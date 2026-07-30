interface Env {
  DB: any;
}

const getShiftOt = (shiftCode: string): number => {
  if (shiftCode === "OND") return 8;
  const match = shiftCode.match(/\d+$/);
  if (match) {
    const hours = Number(match[0]);
    return Math.max(0, hours - 8);
  }
  const map: Record<string, number> = { M12: 4, A12: 4, N12: 4, M16: 8, N16: 8, OND: 8 };
  return map[shiftCode] ?? 0;
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const db = env.DB;

    // Helper: read request JSON body
    const getBody = async () => {
      try {
        return await request.json();
      } catch {
        return {};
      }
    };

    // 1. GET /api/portal-state
    if (path === "/api/portal-state" && request.method === "GET") {
      let deptsRes: any = { results: [] };
      let empsRes: any = { results: [] };

      if (db) {
        try {
          deptsRes = await db.prepare("SELECT * FROM departments").all();
          empsRes = await db.prepare("SELECT * FROM employees").all();
        } catch (e) {
          console.error("D1 Fetch Error:", e);
        }
      }

      // Enrich employees with OT from ot_daily_records
      const rawEmployees = empsRes.results || [];
      const enrichedEmployees = [];

      for (const emp of rawEmployees) {
        let actualOt = 0;
        let shifts: string[] = [];
        try {
          shifts = typeof emp.shifts === "string" ? JSON.parse(emp.shifts) : (emp.shifts || []);
        } catch {
          shifts = [];
        }

        if (db) {
          try {
            const otRows = await db.prepare("SELECT SUM(otHours) as total FROM ot_daily_records WHERE employeeId = ?").bind(emp.id).all();
            actualOt = otRows.results[0]?.total || 0;
          } catch {
            actualOt = Math.round(shifts.reduce((s: number, code: string) => s + getShiftOt(code), 0) * 10) / 10;
          }
        } else {
          actualOt = Math.round(shifts.reduce((s: number, code: string) => s + getShiftOt(code), 0) * 10) / 10;
        }

        const targetOt = Number(emp.targetOt) || 48;
        const otPct = Math.round((actualOt / targetOt) * 100);
        const status = actualOt > targetOt ? "Warning" : "On Track";

        enrichedEmployees.push({
          ...emp,
          shifts,
          actualOt,
          otPct,
          status
        });
      }

      const departments = (deptsRes.results || []).map((d: any) => {
        const deptEmps = enrichedEmployees.filter(e => e.deptId === d.id);
        const totalOt = deptEmps.reduce((s, e) => s + e.actualOt, 0);
        const budgetUsed = totalOt * 300;
        const budgetUtilization = Math.round((budgetUsed / 150000) * 100);
        return {
          ...d,
          employeesCount: deptEmps.length,
          otHours: totalOt,
          budgetUsed,
          budgetUsedChange: 0,
          budgetUsedChangePct: 0,
          budgetUtilization,
          status: budgetUtilization > 80 ? "Warning" : "On Track"
        };
      });

      return Response.json({
        departments,
        employees: enrichedEmployees,
        shiftConfig: {
          pattern: "4-on-2-off",
          currentMonth: new Date().toISOString().substring(0, 7),
          currentDept: "inter2"
        },
        otTrendData: {
          months: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."],
          lastYear: [120, 150, 180, 200, 170, 190],
          currentYear: [110, 140, 160, 190, 165, 180]
        },
        d1Connected: !!db
      }, { headers: corsHeaders });
    }

    // 2. POST /api/login
    if (path === "/api/login" && request.method === "POST") {
      const { username, password } = await getBody();
      if (!username || !password) {
        return Response.json({ error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" }, { status: 400, headers: corsHeaders });
      }

      if (db) {
        try {
          const acc = await db.prepare("SELECT * FROM app_accounts WHERE username = ? AND password = ?").bind(username, password).first();
          if (acc) {
            return Response.json({
              success: true,
              user: { username: acc.username, name: acc.name, role: acc.role, deptId: acc.deptId, avatar: acc.avatar, canBackup: acc.canBackup }
            }, { headers: corsHeaders });
          }
        } catch (e) {
          console.error("D1 Login Error:", e);
        }
      }

      // Default accounts fallback
      const defaultAccounts = [
        { username: "admin", password: "admin123", name: "ผู้ดูแลระบบ", role: "ผู้ดูแลระบบ", deptId: "all", canBackup: 1 },
        { username: "hr", password: "hr1234", name: "HR Manager", role: "HR", deptId: "all", canBackup: 1 },
        { username: "hr_sec", password: "hrsec1234", name: "HR Section Manager", role: "HR Section Manager", deptId: "all", canBackup: 1 },
        { username: "inter2_mgr", password: "i2mgr1234", name: "Section Manager INTER2", role: "Section Manager", deptId: "inter2", canBackup: 0 }
      ];

      const found = defaultAccounts.find(a => a.username === username && a.password === password);
      if (found) {
        return Response.json({
          success: true,
          user: { username: found.username, name: found.name, role: found.role, deptId: found.deptId, avatar: "", canBackup: found.canBackup }
        }, { headers: corsHeaders });
      }

      return Response.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401, headers: corsHeaders });
    }

    // 3. POST /api/save-shifts
    if (path === "/api/save-shifts" && request.method === "POST") {
      const { year, month, employees } = await getBody();
      if (db && employees && Array.isArray(employees)) {
        for (const emp of employees) {
          // Update employees table shifts
          await db.prepare("UPDATE employees SET shifts = ? WHERE id = ?").bind(JSON.stringify(emp.shifts || []), emp.id).run();

          // Insert into ot_daily_records
          const shifts: string[] = emp.shifts || [];
          for (let dayIdx = 0; dayIdx < shifts.length; dayIdx++) {
            const shiftCode = shifts[dayIdx];
            const otHrs = getShiftOt(shiftCode);
            if (otHrs > 0) {
              const dayNum = dayIdx + 1;
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const recId = `OTD-${emp.id}-${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              await db.prepare(`INSERT OR REPLACE INTO ot_daily_records (id, year, month, date, employeeId, employeeName, deptId, shiftCode, otHours, note)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '')`).bind(recId, year, month, dateStr, emp.id, emp.name, emp.deptId || "inter2", shiftCode, otHrs).run();
            }
          }
        }
      }
      return Response.json({ success: true, message: "บันทึกตารางกะลง Cloudflare D1 เรียบร้อยแล้ว" }, { headers: corsHeaders });
    }

    // 4. POST /api/add-employee
    if (path === "/api/add-employee" && request.method === "POST") {
      const body = await getBody();
      const empId = body.id || "EMP-" + Date.now();
      if (db) {
        await db.prepare(`INSERT INTO employees (id, name, deptId, role, targetOt, groupName, shifts)
          VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(
            empId,
            body.name || (body.firstName + " " + body.lastName),
            body.deptId || "inter2",
            body.role || "Operator",
            Number(body.targetOt) || 48,
            body.groupName || "Group A",
            JSON.stringify(body.shifts || [])
          ).run();
      }
      return Response.json({ success: true, message: "เพิ่มพนักงานเรียบร้อยแล้ว", employeeId: empId }, { headers: corsHeaders });
    }

    // 5. GET /api/ot-records
    if (path === "/api/ot-records" && request.method === "GET") {
      if (db) {
        const year = url.searchParams.get("year");
        const month = url.searchParams.get("month");
        let sql = "SELECT * FROM ot_daily_records WHERE 1=1";
        const params: any[] = [];
        if (year) { sql += " AND year = ?"; params.push(Number(year)); }
        if (month) { sql += " AND month = ?"; params.push(Number(month)); }
        sql += " ORDER BY date DESC, employeeId";

        const stmt = db.prepare(sql);
        const rows = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
        return Response.json(rows.results || [], { headers: corsHeaders });
      }
      return Response.json([], { headers: corsHeaders });
    }

    // Default 404 response for unhandled API paths
    return Response.json({ error: "Endpoint not found" }, { status: 404, headers: corsHeaders });

  } catch (err: any) {
    console.error("Pages Function Error:", err);
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
};
