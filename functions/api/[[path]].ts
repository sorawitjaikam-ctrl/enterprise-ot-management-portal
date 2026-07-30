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
      let accountsRes: any = { results: [] };
      let vesselSchedulesRes: any = { results: [] };

      if (db) {
        try {
          deptsRes = await db.prepare("SELECT * FROM departments").all();
          empsRes = await db.prepare("SELECT * FROM employees").all();
          accountsRes = await db.prepare("SELECT * FROM accounts").all();
          vesselSchedulesRes = await db.prepare("SELECT * FROM vessel_schedules").all();
        } catch (e) {
          console.error("D1 Fetch Error:", e);
        }
      }

      // Enrich employees with OT from ot_daily_records
      const rawEmployees = empsRes.results || [];
      const enrichedEmployees = [];

      for (let idx = 0; idx < rawEmployees.length; idx++) {
        const emp = rawEmployees[idx];
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
            actualOt = Number(otRows.results[0]?.total) || 0;
          } catch {
            actualOt = 0;
          }
        }

        if (actualOt === 0 && shifts && shifts.length > 0) {
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

      const normalizeDeptId = (deptId: string) => {
        if (!deptId) return "";
        const clean = String(deptId).trim().toLowerCase().replace(/\s+/g, "");
        if (clean.includes("inter2")) return "inter2";
        if (clean.includes("inter3")) return "inter3";
        if (clean.includes("inter5")) return "inter5";
        if (clean.includes("inter7")) return "inter7";
        if (clean.includes("heavy")) return "heavy";
        if (clean.includes("ecc")) return "ecc";
        return clean;
      };

      const departments = (deptsRes.results || []).map((d: any) => {
        const deptEmps = enrichedEmployees.filter(e => normalizeDeptId(e.deptId) === normalizeDeptId(d.id));
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

      const defaultAccounts = [
        { username: "admin", password: "admin123", name: "ผู้ดูแลระบบ", role: "ผู้ดูแลระบบ", deptId: "all", avatar: "", canBackup: 1 },
        { username: "hr", password: "hr1234", name: "HR Manager", role: "HR", deptId: "all", avatar: "", canBackup: 1 },
        { username: "hr_sec", password: "hrsec1234", name: "HR Section Manager", role: "HR Section Manager", deptId: "all", avatar: "", canBackup: 1 },
        { username: "inter2_mgr", password: "i2mgr1234", name: "Section Manager INTER2", role: "Section Manager", deptId: "inter2", avatar: "", canBackup: 0 }
      ];

      return Response.json({
        departments,
        employees: enrichedEmployees,
        accounts: accountsRes.results || [],
        vesselSchedules: vesselSchedulesRes.results || [],
        otRequests: otRequestsRes.results || [],
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
          const acc = await db.prepare("SELECT * FROM accounts WHERE username = ? AND password = ?").bind(username, password).first();
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

    // 3. POST /api/add-account
    if (path === "/api/add-account" && request.method === "POST") {
      const body = await getBody();
      if (!body.username || !body.name) {
        return Response.json({ error: "กรุณากรอก Username และชื่อผู้ใช้งาน" }, { status: 400, headers: corsHeaders });
      }

      if (db) {
        await db.prepare(`INSERT OR REPLACE INTO accounts (username, password, name, role, deptId, avatar, canBackup)
          VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(
            body.username,
            body.password || "123456",
            body.name,
            body.role || "Section Manager",
            body.deptId || "all",
            body.avatar || "",
            body.canBackup ? 1 : 0
          ).run();
      }
      return Response.json({ success: true, message: "เพิ่มบัญชีผู้ใช้ใหม่ใน D1 Database เรียบร้อยแล้ว" }, { headers: corsHeaders });
    }

    // 4. POST /api/update-account
    if (path === "/api/update-account" && request.method === "POST") {
      const body = await getBody();
      const targetUsername = body.originalUsername || body.username;
      const newUsername = body.username || targetUsername;

      if (!targetUsername) {
        return Response.json({ error: "ไม่พบ Username" }, { status: 400, headers: corsHeaders });
      }

      if (db) {
        try {
          // Check if targetUsername exists
          const existing = await db.prepare("SELECT * FROM accounts WHERE username = ?").bind(targetUsername).first();
          if (existing) {
            const pwd = existing.password || "123456";
            if (targetUsername !== newUsername) {
              await db.prepare("DELETE FROM accounts WHERE username = ?").bind(targetUsername).run();
            }
            await db.prepare(`INSERT OR REPLACE INTO accounts (username, password, name, role, deptId, avatar, canBackup) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(
              newUsername,
              pwd,
              body.name || existing.name,
              body.role || existing.role,
              body.deptId || existing.deptId || "all",
              body.avatar !== undefined ? body.avatar : existing.avatar,
              body.canBackup ? 1 : 0
            ).run();
          } else {
            // Insert new account record into D1
            await db.prepare(`INSERT OR REPLACE INTO accounts (username, password, name, role, deptId, avatar, canBackup) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(
              newUsername,
              "123456",
              body.name || newUsername,
              body.role || "ผู้ดูแลระบบ",
              body.deptId || "all",
              body.avatar || "",
              body.canBackup ? 1 : 0
            ).run();
          }
        } catch (e) {
          console.error("D1 Update Account Error:", e);
        }
      }
      return Response.json({ success: true, message: "อัปเดตข้อมูลสิทธิ์ผู้ใช้ใน D1 Database เรียบร้อยแล้ว" }, { headers: corsHeaders });
    }

    // 4.1 POST /api/update-profile
    if (path === "/api/update-profile" && request.method === "POST") {
      const { username, name, avatar, password } = await getBody();
      if (!username) {
        return Response.json({ error: "ไม่พบ Username" }, { status: 400, headers: corsHeaders });
      }

      if (db) {
        try {
          if (password) {
            await db.prepare("UPDATE accounts SET name = ?, avatar = ?, password = ? WHERE username = ?").bind(
              name, avatar || "", password, username
            ).run();
          } else {
            await db.prepare("UPDATE accounts SET name = ?, avatar = ? WHERE username = ?").bind(
              name, avatar || "", username
            ).run();
          }

          const acc = await db.prepare("SELECT * FROM accounts WHERE username = ?").bind(username).first();
          if (acc) {
            return Response.json({
              success: true,
              user: { username: acc.username, name: acc.name, role: acc.role, deptId: acc.deptId, avatar: acc.avatar, canBackup: acc.canBackup }
            }, { headers: corsHeaders });
          }
        } catch (e) {
          console.error("D1 Update Profile Error:", e);
        }
      }

      return Response.json({
        success: true,
        user: { username, name, avatar: avatar || "", role: "ผู้ดูแลระบบ", deptId: "all", canBackup: 1 }
      }, { headers: corsHeaders });
    }

    // 5. POST /api/delete-account
    if (path === "/api/delete-account" && request.method === "POST") {
      const { username } = await getBody();
      if (db && username) {
        await db.prepare("DELETE FROM accounts WHERE username = ?").bind(username).run();
      }
      return Response.json({ success: true, message: "ลบบัญชีผู้ใช้งานเรียบร้อยแล้ว" }, { headers: corsHeaders });
    }

    // 6. POST /api/reset-password
    if (path === "/api/reset-password" && request.method === "POST") {
      const { username, password } = await getBody();
      if (!username || !password) {
        return Response.json({ error: "กรุณากรอกรหัสผ่านใหม่" }, { status: 400, headers: corsHeaders });
      }

      if (db) {
        await db.prepare("UPDATE accounts SET password = ? WHERE username = ?").bind(password, username).run();
      }
      return Response.json({ success: true, message: "รีเซ็ตรหัสผ่านใน D1 Database เรียบร้อยแล้ว" }, { headers: corsHeaders });
    }

    // 7. POST /api/save-shifts
    if (path === "/api/save-shifts" && request.method === "POST") {
      const { year, month, employees } = await getBody();
      if (db && employees && Array.isArray(employees)) {
        for (const emp of employees) {
          const shifts: string[] = emp.shifts || [];
          let totalOt = 0;
          for (let dayIdx = 0; dayIdx < shifts.length; dayIdx++) {
            const shiftCode = shifts[dayIdx];
            const otHrs = getShiftOt(shiftCode);
            totalOt += otHrs;
            if (otHrs > 0) {
              const dayNum = dayIdx + 1;
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const recId = `OTD-${emp.id}-${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              await db.prepare(`INSERT OR REPLACE INTO ot_daily_records (id, year, month, date, employeeId, employeeName, deptId, shiftCode, otHours, note)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '')`).bind(recId, year, month, dateStr, emp.id, emp.name, emp.deptId || "inter2", shiftCode, otHrs).run();
            }
          }
          await db.prepare("UPDATE employees SET shifts = ?, actualOt = ? WHERE id = ?").bind(JSON.stringify(shifts), totalOt, emp.id).run();
        }
      }
      return Response.json({ success: true, message: "บันทึกตารางกะลง Cloudflare D1 เรียบร้อยแล้ว" }, { headers: corsHeaders });
    }

    // 8. POST /api/add-employee
    if (path === "/api/add-employee" && request.method === "POST") {
      const body = await getBody();
      const empId = body.id || "EMP-" + Date.now();
      const salary = Number(body.salary) || 15000;
      const division = body.division || body.groupName || "-";
      if (db) {
        try {
          await db.prepare(`INSERT OR REPLACE INTO employees (id, name, deptId, role, targetOt, groupName, shifts, salary, division)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
              empId,
              body.name || (body.firstName + " " + body.lastName),
              body.deptId || "inter2",
              body.role || "Operator",
              Number(body.targetOt) || 48,
              body.groupName || "Group A",
              JSON.stringify(body.shifts || []),
              salary,
              division
            ).run();
        } catch (e) {
          console.error("D1 Add Employee Error:", e);
        }
      }
      return Response.json({ success: true, message: "เพิ่มพนักงานเรียบร้อยแล้ว", employeeId: empId }, { headers: corsHeaders });
    }

    // 9. GET /api/ot-records
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

    // 10. POST /api/clear-mock-data
    if (path === "/api/clear-mock-data" && request.method === "POST") {
      if (db) {
        try {
          await db.prepare("DELETE FROM employees").run();
          await db.prepare("DELETE FROM ot_daily_records").run();
          await db.prepare("DELETE FROM leave_records").run();
          await db.prepare("DELETE FROM ot_requests").run();
        } catch (e) {
          console.error("D1 Clear Data Error:", e);
        }
      }
      return Response.json({ success: true, message: "ล้างข้อมูลพนักงานและ OT records ใน Cloudflare D1 เรียบร้อยแล้ว" }, { headers: corsHeaders });
    }

    // 11. GET /api/vessel-schedules
    if (path === "/api/vessel-schedules" && request.method === "GET") {
      if (db) {
        try {
          const deptId = url.searchParams.get("deptId");
          let sql = "SELECT * FROM vessel_schedules WHERE 1=1";
          const params: any[] = [];
          if (deptId && deptId !== "all") {
            sql += " AND deptId = ?";
            params.push(deptId);
          }
          sql += " ORDER BY startDate ASC";
          const stmt = db.prepare(sql);
          const rows = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
          return Response.json(rows.results || [], { headers: corsHeaders });
        } catch (e) {
          console.error("D1 Vessel Fetch Error:", e);
        }
      }
      return Response.json([], { headers: corsHeaders });
    }

    // 12. POST /api/save-vessel-schedule
    if (path === "/api/save-vessel-schedule" && request.method === "POST") {
      const body = await getBody();
      if (!body.name || !body.startDate || !body.endDate) {
        return Response.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400, headers: corsHeaders });
      }
      const id = body.id || "VS-" + Date.now();
      const tonnage = Number(body.tonnage) || 0;
      if (db) {
        try {
          await db.prepare(`INSERT OR REPLACE INTO vessel_schedules (id, type, planType, name, startDate, endDate, deptId, color, tonnage)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
              id,
              body.type || "vessel",
              body.planType || "plan",
              body.name,
              body.startDate,
              body.endDate,
              body.deptId || "inter2",
              body.color || "#fef08a",
              tonnage
            ).run();
        } catch (e) {
          console.error("D1 Save Vessel Error:", e);
        }
      }
      return Response.json({ success: true, message: "บันทึกตารางเรือเรียบร้อยแล้ว", id }, { headers: corsHeaders });
    }

    // 13. DELETE / POST /api/delete-vessel-schedule
    if (path.startsWith("/api/delete-vessel-schedule")) {
      const idFromPath = path.replace("/api/delete-vessel-schedule/", "").replace("/api/delete-vessel-schedule", "");
      const body = await getBody();
      const id = idFromPath || body.id;
      if (db && id) {
        try {
          await db.prepare("DELETE FROM vessel_schedules WHERE id = ?").bind(id).run();
        } catch (e) {
          console.error("D1 Delete Vessel Error:", e);
        }
      }
      return Response.json({ success: true, message: "ลบตารางเรือเรียบร้อยแล้ว" }, { headers: corsHeaders });
    }

    // 14. POST /api/save-ot-request
    if (path === "/api/save-ot-request" && request.method === "POST") {
      const body = await getBody();
      const id = body.id || "REQ-" + Date.now();
      if (db) {
        try {
          await db.prepare(`INSERT OR REPLACE INTO ot_requests (id, employeeId, employeeName, deptId, date, hours, reason, status, requestedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
              id,
              body.employeeId || "",
              body.employeeName || "",
              body.deptId || "inter2",
              body.date || new Date().toISOString().substring(0, 10),
              Number(body.hours) || 4,
              body.reason || "",
              body.status || "pending",
              body.requestedAt || new Date().toLocaleString("th-TH")
            ).run();
        } catch (e) {
          console.error("D1 Save OT Request Error:", e);
        }
      }
      return Response.json({ success: true, message: "ยื่นใบคำขอทำ OT เรียบร้อยแล้ว", id }, { headers: corsHeaders });
    }

    // 15. POST /api/update-ot-request-status
    if (path === "/api/update-ot-request-status" && request.method === "POST") {
      const body = await getBody();
      const { id, status } = body;
      if (db && id && status) {
        try {
          await db.prepare("UPDATE ot_requests SET status = ? WHERE id = ?").bind(status, id).run();
        } catch (e) {
          console.error("D1 Update OT Request Status Error:", e);
        }
      }
      return Response.json({ success: true, message: "อัปเดตสถานะใบคำขอเรียบร้อยแล้ว" }, { headers: corsHeaders });
    }

    // Default 404 response for unhandled API paths
    return Response.json({ error: "Endpoint not found" }, { status: 404, headers: corsHeaders });

  } catch (err: any) {
    console.error("Pages Function Error:", err);
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
};
