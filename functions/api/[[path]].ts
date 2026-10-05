interface Env {
  DB: any;
  LINE_CHANNEL_ACCESS_TOKEN?: string;
  LINE_CHANNEL_SECRET?: string;
}

type PagesFunction<T = any> = (context: { request: Request; env: T; [key: string]: any }) => Promise<Response>;

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
      const urlObj = new URL(request.url);
      const reqYear = urlObj.searchParams.get("year");
      const reqMonth = urlObj.searchParams.get("month");
      
      const now = new Date();
      const thisYear = reqYear ? Number(reqYear) : now.getFullYear();
      const thisMonth = reqMonth ? Number(reqMonth) : (now.getMonth() + 1);
      const monthKey = `${thisYear}-${String(thisMonth).padStart(2, "0")}`;

      let deptsRes: any = { results: [] };
      let empsRes: any = { results: [] };
      let accountsRes: any = { results: [] };
      let vesselSchedulesRes: any = { results: [] };
      let otRequestsRes: any = { results: [] };
      let otSummaryMap: Record<string, number> = {};

      if (db) {
        try {
          try { await db.prepare("ALTER TABLE departments ADD COLUMN pattern TEXT DEFAULT '4-on-2-off'").run(); } catch (e) {}
          deptsRes = await db.prepare("SELECT * FROM departments").all();
          try { await db.prepare("ALTER TABLE employees ADD COLUMN resignationDate TEXT DEFAULT ''").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN employmentStatus TEXT DEFAULT 'Active'").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN planShifts TEXT DEFAULT '[]'").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN positionId TEXT DEFAULT ''").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN unit TEXT DEFAULT 'INTER 2'").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN level TEXT DEFAULT 'Staff'").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN ocType TEXT DEFAULT 'OLD'").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN status TEXT DEFAULT 'Active'").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN isMgr INTEGER DEFAULT 0").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN isEng INTEGER DEFAULT 0").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN avgRevenue REAL DEFAULT 0").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN avgCost REAL DEFAULT 0").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN profit2026 REAL DEFAULT 0").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN profit2025 REAL DEFAULT 0").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN monthlyRevenue TEXT DEFAULT '[]'").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN monthlyCost TEXT DEFAULT '[]'").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN monthlyProfit TEXT DEFAULT '[]'").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN updatedAt TEXT DEFAULT ''").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE employees ADD COLUMN avatar TEXT DEFAULT ''").run(); } catch (e) {}
          try { await db.prepare("ALTER TABLE accounts ADD COLUMN employeeId TEXT DEFAULT ''").run(); } catch (e) {}

          // Safe Auto-Migration: Migrate legacy manpower_positions into employees table if table exists
          try {
            const manpowerRes = await db.prepare("SELECT * FROM manpower_positions").all();
            if (manpowerRes && manpowerRes.results && manpowerRes.results.length > 0) {
              for (const pos of manpowerRes.results as any[]) {
                const pEmpId = (pos.empId || "").trim();
                const pName = (pos.name || "").trim();
                const pUnit = (pos.unit || "INTER 2").trim();
                const pRole = (pos.role || "Operator").trim();
                const pLevel = (pos.level || "Staff").trim();
                const pOcType = (pos.ocType || "OLD").trim();
                const pStatus = (pos.status || "Active").trim();
                const pIsMgr = pos.isMgr ? 1 : 0;
                const pIsEng = pos.isEng ? 1 : 0;
                const posId = pos.id || `POS-${pEmpId || Math.random().toString(36).substring(2, 7).toUpperCase()}`;

                let existing: any = null;
                if (pEmpId) {
                  existing = await db.prepare("SELECT id FROM employees WHERE id = ?").bind(pEmpId).first();
                }
                if (!existing && pName && !pName.toLowerCase().includes("vacant") && pName !== "ว่าง") {
                  existing = await db.prepare("SELECT id FROM employees WHERE name = ?").bind(pName).first();
                }

                if (existing && existing.id) {
                  await db.prepare(`UPDATE employees SET positionId = ?, unit = ?, role = ?, level = ?, ocType = ?, isMgr = ?, isEng = ?, status = ? WHERE id = ?`)
                    .bind(posId, pUnit, pRole, pLevel, pOcType, pIsMgr, pIsEng, pStatus, existing.id).run();
                } else if (pStatus === "Vacant" || pName.toLowerCase().includes("vacant") || pName === "ว่าง") {
                  await db.prepare(`INSERT OR IGNORE INTO employees (id, positionId, name, deptId, role, unit, level, ocType, status, employmentStatus, isMgr, isEng, targetOt, shifts, planShifts)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Vacant', 'Inactive', ?, ?, 0, '[]', '[]')`)
                    .bind(posId, posId, pName || "Vacant", "inter2", pRole, pUnit, pLevel, pOcType, pIsMgr, pIsEng).run();
                } else if (pEmpId || pName) {
                  const empId = pEmpId || `EMP-${String(pos.id).replace(/\D/g, "")}`;
                  await db.prepare(`INSERT OR IGNORE INTO employees (id, positionId, name, deptId, role, unit, level, ocType, status, employmentStatus, isMgr, isEng, targetOt, shifts, planShifts)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?, 48, '[]', '[]')`)
                    .bind(empId, posId, pName, "inter2", pRole, pUnit, pLevel, pOcType, pStatus, pIsMgr, pIsEng).run();
                }
              }
              await db.prepare("DROP TABLE IF EXISTS manpower_positions").run();
            } else {
              await db.prepare("DROP TABLE IF EXISTS manpower_positions").run();
            }
          } catch (_) {
            // Table manpower_positions does not exist or already dropped
          }

          // Safe Auto-Migration: Migrate legacy job_value_records into employees table if table exists
          try {
            const jvRes = await db.prepare("SELECT * FROM job_value_records").all();
            if (jvRes && jvRes.results && jvRes.results.length > 0) {
              for (const jv of jvRes.results as any[]) {
                const empId = (jv.empId || "").trim();
                const empName = (jv.empName || "").trim();
                let targetId = empId;
                if (!targetId && empName) {
                  const found: any = await db.prepare("SELECT id FROM employees WHERE name = ?").bind(empName).first();
                  if (found) targetId = found.id;
                }
                if (targetId) {
                  await db.prepare(`UPDATE employees SET avgRevenue = ?, avgCost = ?, profit2026 = ?, profit2025 = ?, monthlyRevenue = ?, monthlyCost = ?, monthlyProfit = ?, updatedAt = ? WHERE id = ?`)
                    .bind(
                      Number(jv.avgRevenue) || 0,
                      Number(jv.avgCost) || 0,
                      Number(jv.profit2026) || 0,
                      Number(jv.profit2025) || 0,
                      typeof jv.monthlyRevenue === "string" ? jv.monthlyRevenue : JSON.stringify(jv.monthlyRevenue || []),
                      typeof jv.monthlyCost === "string" ? jv.monthlyCost : JSON.stringify(jv.monthlyCost || []),
                      typeof jv.monthlyProfit === "string" ? jv.monthlyProfit : JSON.stringify(jv.monthlyProfit || []),
                      jv.updatedAt || new Date().toISOString(),
                      targetId
                    ).run();
                }
              }
              await db.prepare("DROP TABLE IF EXISTS job_value_records").run();
              await db.prepare("DROP TABLE IF EXISTS job_value").run();
            } else {
              await db.prepare("DROP TABLE IF EXISTS job_value_records").run();
              await db.prepare("DROP TABLE IF EXISTS job_value").run();
            }
          } catch (_) {
            // Table job_value_records does not exist or already dropped
          }

          empsRes = await db.prepare("SELECT * FROM employees").all();

          accountsRes = await db.prepare("SELECT * FROM accounts").all();
          vesselSchedulesRes = await db.prepare("SELECT * FROM vessel_schedules").all();
          otRequestsRes = await db.prepare("SELECT * FROM ot_requests").all();

          // Efficient single aggregation query for OT records filtered by month/year
          try {
            const otSumRes = await db.prepare("SELECT employeeId, SUM(otHours) as total FROM ot_daily_records WHERE year = ? AND month = ? GROUP BY employeeId")
              .bind(thisYear, thisMonth).all();
            if (otSumRes && otSumRes.results) {
              for (const row of otSumRes.results as any[]) {
                if (row.employeeId) {
                  const eid = String(row.employeeId).trim();
                  const stripped = eid.replace(/^EMP-/i, '');
                  const hrs = Number(row.total) || 0;
                  otSummaryMap[eid] = hrs;
                  otSummaryMap[stripped] = hrs;
                  otSummaryMap[`EMP-${stripped}`] = hrs;
                }
              }
            }
          } catch (e) {
            console.error("D1 OT Aggregation Error:", e);
          }
        } catch (e) {
          console.error("D1 Fetch Error:", e);
        }
      }

      // Enrich employees with OT from otSummaryMap
      const rawEmployees = empsRes.results || [];
      const enrichedEmployees = [];

      for (let idx = 0; idx < rawEmployees.length; idx++) {
        const emp = rawEmployees[idx];
        let shiftsRaw: any = [];
        try {
          shiftsRaw = typeof emp.shifts === "string" ? JSON.parse(emp.shifts) : (emp.shifts || []);
        } catch {
          shiftsRaw = [];
        }

        let planShiftsRaw: any = [];
        try {
          planShiftsRaw = typeof emp.planShifts === "string" ? JSON.parse(emp.planShifts) : (emp.planShifts || []);
        } catch {
          planShiftsRaw = [];
        }

        // Extract this month's array
        let shifts: string[] = [];
        if (Array.isArray(shiftsRaw)) {
          shifts = shiftsRaw;
        } else if (shiftsRaw && typeof shiftsRaw === "object") {
          shifts = shiftsRaw[monthKey] || [];
        }

        let planShifts: string[] = [];
        if (Array.isArray(planShiftsRaw)) {
          planShifts = planShiftsRaw;
        } else if (planShiftsRaw && typeof planShiftsRaw === "object") {
          planShifts = planShiftsRaw[monthKey] || [];
        }

        if (shifts.length === 0) { shifts = Array(31).fill("O"); }
        if (planShifts.length === 0) { planShifts = [...shifts]; }

        const canonicalId = (emp.id || "").toString().trim();
        const strippedId = canonicalId.replace(/^EMP-/i, '');
        let actualOt = otSummaryMap[canonicalId] ?? otSummaryMap[strippedId] ?? otSummaryMap[`EMP-${strippedId}`] ?? 0;

        if (actualOt === 0 && shifts && shifts.length > 0) {
          actualOt = Math.round(shifts.reduce((s: number, code: string) => s + getShiftOt(code), 0) * 10) / 10;
        }

        const targetOt = Number(emp.targetOt) || 48;
        const otPct = Math.round((actualOt / targetOt) * 100);
        const status = (emp.status === "Vacant" || emp.status === "Resigned") ? emp.status : (actualOt > targetOt ? "Warning" : "On Track");

        enrichedEmployees.push({
          ...emp,
          id: canonicalId,
          empId: canonicalId, // Always guarantee canonical Employee ID
          positionId: emp.positionId || `POS-${canonicalId}`,
          unit: emp.unit || emp.deptId || "INTER 2",
          level: emp.level || "Staff",
          ocType: emp.ocType || "OLD",
          isMgr: Boolean(emp.isMgr),
          isEng: Boolean(emp.isEng),
          shifts: shiftsRaw, // Keep the multi-month raw data to let the client have it
          planShifts: planShiftsRaw,
          actualOt,
          otPct,
          status
        });
      }

      // Compute actual monthly OT totals from D1 ot_daily_records table
      const monthNamesTh = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      const currentYearNum = now.getFullYear();
      const currentMonthNum = now.getMonth() + 1; // 1-indexed

      // Build last 6 months array info
      const last6MonthsInfo: { year: number; month: number; label: string }[] = [];
      for (let i = 5; i >= 0; i--) {
        let m = currentMonthNum - i;
        let y = currentYearNum;
        if (m <= 0) {
          m += 12;
          y -= 1;
        }
        last6MonthsInfo.push({ year: y, month: m, label: monthNamesTh[m - 1] });
      }

      const trendMonths = last6MonthsInfo.map(m => m.label);
      const trendCurrentYear = last6MonthsInfo.map(() => 0);
      const trendLastYear = last6MonthsInfo.map(() => 0);

      if (db) {
        try {
          const otMonthlyQuery = await db.prepare("SELECT year, month, SUM(otHours) as total FROM ot_daily_records GROUP BY year, month").all();
          if (otMonthlyQuery && otMonthlyQuery.results) {
            for (const row of otMonthlyQuery.results as any[]) {
              const rYear = Number(row.year);
              const rMonth = Number(row.month);
              const rTotal = Number(row.total) || 0;
              
              const idxCurrent = last6MonthsInfo.findIndex(m => m.year === rYear && m.month === rMonth);
              if (idxCurrent !== -1) {
                trendCurrentYear[idxCurrent] += rTotal;
              }

              const idxLast = last6MonthsInfo.findIndex(m => m.year === (rYear + 1) && m.month === rMonth);
              if (idxLast !== -1) {
                trendLastYear[idxLast] += rTotal;
              }
            }
          }
        } catch (e) {
          console.error("D1 Monthly Trend Query Error:", e);
        }
      }

      const totalEnrichedOt = enrichedEmployees.reduce((s, e) => s + (e.actualOt || 0), 0);
      if (trendCurrentYear[5] === 0 && totalEnrichedOt > 0) {
        trendCurrentYear[5] = Math.round(totalEnrichedOt * 10) / 10;
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
        const budgetUsed = Math.round(deptEmps.reduce((s, e) => {
          const sal = Number(e.salary) || 15000;
          const rate = sal / 240;
          return s + (e.actualOt * 1.5 * rate);
        }, 0));
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
        accounts: accountsRes.results || [],
        vesselSchedules: vesselSchedulesRes.results || [],
        otRequests: otRequestsRes.results || [],
        shiftConfig: {
          pattern: "4-on-2-off",
          currentMonth: monthKey,
          currentDept: "inter2"
        },
        otTrendData: {
          months: trendMonths,
          lastYear: trendLastYear,
          currentYear: trendCurrentYear
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
        const recordYear = Number(year);
        const recordMonth = Number(month);
        for (const emp of employees) {
          const shifts: string[] = emp.shifts || [];
          const planShifts: string[] = emp.planShifts || shifts;

          const canonicalId = (emp.id || emp.empId || "").toString().trim();
          const strippedId = canonicalId.replace(/^EMP-/i, '');

          // Delete existing OT daily records for this month to prevent orphans across ID variants
          try {
            await db.prepare("DELETE FROM ot_daily_records WHERE (employeeId = ? OR employeeId = ? OR employeeId = ?) AND year = ? AND month = ?")
              .bind(canonicalId, strippedId, `EMP-${strippedId}`, recordYear, recordMonth).run();
          } catch (e) {
            console.error("D1 Delete OT Records Error:", e);
          }

          // Compute daily OT from actual shifts (shifts)
          for (let dayIdx = 0; dayIdx < shifts.length; dayIdx++) {
            const shiftCode = shifts[dayIdx];
            const otHrs = getShiftOt(shiftCode);
            if (otHrs > 0) {
              const dayNum = dayIdx + 1;
              const dateStr = `${recordYear}-${String(recordMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const recId = `OTD-${canonicalId}-${recordYear}-${String(recordMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              try {
                await db.prepare(`INSERT OR REPLACE INTO ot_daily_records (id, year, month, date, employeeId, employeeName, deptId, shiftCode, otHours, note)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '')`)
                  .bind(recId, recordYear, recordMonth, dateStr, canonicalId, emp.name, emp.deptId || "inter2", shiftCode, otHrs).run();
              } catch (e) {
                console.error("D1 Insert OT Record Error:", e);
              }
            }
          }

          try {
            await db.prepare("UPDATE employees SET shifts = ?, planShifts = ? WHERE id = ? OR id = ? OR id = ?")
              .bind(JSON.stringify(shifts), JSON.stringify(planShifts), canonicalId, strippedId, `EMP-${strippedId}`).run();
          } catch (e) {
            console.error("D1 Update Shifts Error:", e);
          }
        }
      }
      return Response.json({ success: true, message: "บันทึกตารางกะลง Cloudflare D1 เรียบร้อยแล้ว" }, { headers: corsHeaders });
    }

    // POST /api/save-department-config
    if (path === "/api/save-department-config" && request.method === "POST") {
      const { deptId, pattern, manager } = await getBody();
      if (db && deptId) {
        try {
          if (pattern !== undefined) {
            await db.prepare("UPDATE departments SET pattern = ? WHERE id = ?").bind(pattern, deptId).run();
          }
          if (manager !== undefined) {
            await db.prepare("UPDATE departments SET manager = ? WHERE id = ?").bind(manager, deptId).run();
          }
          return Response.json({ success: true, message: "อัปเดตข้อมูลแผนกสำเร็จ" }, { headers: corsHeaders });
        } catch (e) {
          return Response.json({ error: "D1 Save Config Error" }, { status: 500, headers: corsHeaders });
        }
      }
      return Response.json({ error: "Missing deptId" }, { status: 400, headers: corsHeaders });
    }

    // 8. POST /api/add-employee
    if (path === "/api/add-employee" && request.method === "POST") {
      const body = await getBody();
      const empId = body.id || "EMP-" + Date.now();
      const posId = body.positionId || `POS-${empId}`;
      const salary = Number(body.salary) || 15000;
      const division = body.division || body.groupName || "-";
      const fullName = body.name || ((body.firstName || "") + " " + (body.lastName || "")).trim();
      const finalRole = body.role || "Operator";
      const finalUnit = body.unit || body.deptId || "inter2";
      const finalLevel = body.level || "Staff";
      const ocType = body.ocType || "OLD";
      const status = body.status || (body.resignationDate ? "Resigned" : "Active");
      const isMgr = body.isMgr !== undefined ? (body.isMgr ? 1 : 0) : (finalRole.toLowerCase().includes("mgr") || finalRole.includes("ผู้จัดการ") ? 1 : 0);
      const isEng = body.isEng !== undefined ? (body.isEng ? 1 : 0) : (finalRole.toLowerCase().includes("eng") || finalRole.includes("วิศวกร") ? 1 : 0);

      if (db) {
        try {
          await db.prepare(`INSERT OR REPLACE INTO employees (
            id, positionId, name, deptId, role, unit, level, ocType, status, isMgr, isEng,
            targetOt, groupName, shifts, planShifts, salary, division, prefix, firstName, lastName,
            nickname, birthday, age, calculatedAge, startDate, tenure, probationDate, calendarType,
            resignationDate, employmentStatus, avatar
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
              empId,
              posId,
              fullName,
              body.deptId || finalUnit,
              finalRole,
              finalUnit,
              finalLevel,
              ocType,
              status,
              isMgr,
              isEng,
              Number(body.targetOt) || 48,
              body.groupName || "Group A",
              JSON.stringify(body.shifts || []),
              JSON.stringify(body.planShifts || body.shifts || []),
              salary,
              division,
              body.prefix || "นาย",
              body.firstName || "",
              body.lastName || "",
              body.nickname || "",
              body.birthday || "",
              Number(body.age) || 0,
              Number(body.calculatedAge) || 0,
              body.startDate || "",
              body.tenure || "",
              body.probationDate || "",
              body.calendarType || "ปฏิทินกะ 4-on-2-off",
              body.resignationDate || "",
              body.employmentStatus || (body.resignationDate ? "Resigned" : "Active"),
              body.avatar || ""
            ).run();
        } catch (e) {
          console.error("D1 Add Employee Error:", e);
        }
      }
      return Response.json({ success: true, message: "เพิ่มพนักงานเรียบร้อยแล้ว", employeeId: empId }, { headers: corsHeaders });
    }

    // 8.1 POST /api/export-employees
    if (path === "/api/export-employees" && request.method === "POST") {
      let empsRes: any = { results: [] };
      if (db) {
        try {
          empsRes = await db.prepare("SELECT * FROM employees").all();
        } catch (e) {
          console.error("D1 Export Employees Error:", e);
        }
      }
      return Response.json({ success: true, employees: empsRes.results || [] }, { headers: corsHeaders });
    }

    // 8.2 POST /api/import-employees
    if (path === "/api/import-employees" && request.method === "POST") {
      const body = await getBody();
      const employees = body.employees || [];
      if (db && Array.isArray(employees)) {
        try {
          await db.prepare(`CREATE TABLE IF NOT EXISTS manpower_positions (
            id TEXT PRIMARY KEY,
            empId TEXT DEFAULT '',
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            unit TEXT NOT NULL,
            isMgr INTEGER DEFAULT 0,
            isEng INTEGER DEFAULT 0,
            status TEXT DEFAULT 'Active',
            ocType TEXT DEFAULT 'OLD',
            img TEXT DEFAULT '',
            createdAt TEXT DEFAULT '',
            updatedAt TEXT DEFAULT ''
          )`).run();
        } catch (_) {}

        for (const emp of employees) {
          try {
            const fullName = emp.name || ((emp.firstName || "") + " " + (emp.lastName || "")).trim();
            const finalRole = emp.role || "Operator";
            const finalUnit = emp.unit || emp.deptId || "inter2";
            const finalLevel = emp.level || "Staff";
            const ocType = emp.ocType || "OLD";
            const status = emp.status || (emp.resignationDate ? "Resigned" : "Active");
            const isMgr = emp.isMgr !== undefined ? (emp.isMgr ? 1 : 0) : (finalRole.toLowerCase().includes("mgr") || finalRole.includes("ผู้จัดการ") ? 1 : 0);
            const isEng = emp.isEng !== undefined ? (emp.isEng ? 1 : 0) : (finalRole.toLowerCase().includes("eng") || finalRole.includes("วิศวกร") ? 1 : 0);
            const posId = emp.positionId || `POS-${emp.id}`;

            await db.prepare(`INSERT OR REPLACE INTO employees (
              id, positionId, name, deptId, role, unit, level, ocType, status, isMgr, isEng,
              targetOt, groupName, shifts, planShifts, salary, division, prefix, firstName, lastName,
              nickname, birthday, age, calculatedAge, startDate, tenure, probationDate, calendarType,
              resignationDate, employmentStatus, avatar
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
                emp.id,
                posId,
                fullName,
                emp.deptId || finalUnit,
                finalRole,
                finalUnit,
                finalLevel,
                ocType,
                status,
                isMgr,
                isEng,
                Number(emp.targetOt) || 48,
                emp.groupName || "Group A",
                JSON.stringify(emp.shifts || []),
                JSON.stringify(emp.planShifts || emp.shifts || []),
                Number(emp.salary) || 15000,
                emp.division || emp.groupName || "-",
                emp.prefix || "นาย",
                emp.firstName || "",
                emp.lastName || "",
                emp.nickname || "",
                emp.birthday || "",
                Number(emp.age) || 0,
                Number(emp.calculatedAge) || 0,
                emp.startDate || "",
                emp.tenure || "",
                emp.probationDate || "",
                emp.calendarType || "ปฏิทินกะ 4-on-2-off",
                emp.resignationDate || "",
                emp.employmentStatus || (emp.resignationDate ? "Resigned" : "Active"),
                emp.avatar || ""
              ).run();
          } catch (e) {
            console.error("D1 Import Employee Item Error:", e);
          }
        }
      }
      return Response.json({ success: true, message: `นำเข้าพนักงาน ${employees.length} รายการเรียบร้อยแล้ว` }, { headers: corsHeaders });
    }

    // 8.3 POST /api/edit-employee
    if (path === "/api/edit-employee" && request.method === "POST") {
      const body = await getBody();
      const empId = body.id;
      const fullName = body.name || ((body.firstName || "") + " " + (body.lastName || "")).trim();
      const finalRole = body.role || "Operator";
      const finalUnit = body.unit || body.deptId || "inter2";
      const finalLevel = body.level || "Staff";
      const ocType = body.ocType || "OLD";
      const status = body.status || (body.resignationDate ? "Resigned" : "Active");
      const isMgr = body.isMgr !== undefined ? (body.isMgr ? 1 : 0) : (finalRole.toLowerCase().includes("mgr") || finalRole.includes("ผู้จัดการ") ? 1 : 0);
      const isEng = body.isEng !== undefined ? (body.isEng ? 1 : 0) : (finalRole.toLowerCase().includes("eng") || finalRole.includes("วิศวกร") ? 1 : 0);
      const posId = body.positionId || `POS-${empId}`;

      if (db && empId) {
        try {
          await db.prepare(`UPDATE employees SET 
            name = ?, deptId = ?, role = ?, unit = ?, level = ?, ocType = ?, status = ?, isMgr = ?, isEng = ?, positionId = ?,
            targetOt = ?, groupName = ?, salary = ?, division = ?, prefix = ?, firstName = ?, lastName = ?, 
            nickname = ?, birthday = ?, age = ?, calculatedAge = ?, startDate = ?, 
            tenure = ?, probationDate = ?, calendarType = ?, resignationDate = ?, employmentStatus = ?,
            avatar = COALESCE(?, avatar),
            shifts = COALESCE(?, shifts), planShifts = COALESCE(?, planShifts)
            WHERE id = ?`).bind(
              fullName,
              body.deptId || finalUnit,
              finalRole,
              finalUnit,
              finalLevel,
              ocType,
              status,
              isMgr,
              isEng,
              posId,
              Number(body.targetOt) || 48,
              body.groupName || "Group A",
              Number(body.salary) || 15000,
              body.division || body.groupName || "-",
              body.prefix || "นาย",
              body.firstName || "",
              body.lastName || "",
              body.nickname || "",
              body.birthday || "",
              Number(body.age) || 0,
              Number(body.calculatedAge) || 0,
              body.startDate || "",
              body.tenure || "",
              body.probationDate || "",
              body.calendarType || "ปฏิทิน 2 ทีม (คู่กะ 12 ชม.)",
              body.resignationDate || "",
              body.employmentStatus || (body.resignationDate ? "Resigned" : "Active"),
              body.avatar || null,
              body.shifts ? (typeof body.shifts === "string" ? body.shifts : JSON.stringify(body.shifts)) : null,
              body.planShifts ? (typeof body.planShifts === "string" ? body.planShifts : JSON.stringify(body.planShifts)) : null,
              empId
            ).run();
        } catch (e) {
          console.error("D1 Edit Employee Error:", e);
        }
      }
      return Response.json({ success: true, message: "แก้ไขข้อมูลพนักงานเรียบร้อยแล้ว" }, { headers: corsHeaders });
    }

    // 8.4 POST /api/delete-employee
    if (path === "/api/delete-employee" && request.method === "POST") {
      const body = await getBody();
      const targetId = (body.id || body.empId || body.positionId || "").toString().trim();
      const targetName = (body.name || "").toString().trim();
      const targetEmpId = (body.empId || "").toString().trim();
      const targetPosId = (body.positionId || "").toString().trim();

      if (db && (targetId || targetName)) {
        try {
          await db.prepare(`DELETE FROM employees WHERE 
            id = ? OR id = ? OR id = ? OR 
            positionId = ? OR positionId = ? OR positionId = ? OR
            name = ?
          `).bind(
            targetId, targetEmpId || targetId, `EMP-${targetId.replace(/^EMP-/i, '')}`,
            targetId, targetPosId || targetId, `POS-${targetId.replace(/^POS-/i, '')}`,
            targetName || targetId
          ).run();

          // Clean up daily OT records, requests, and leaves
          const idsToClean = Array.from(new Set([targetId, targetEmpId, targetPosId, `EMP-${targetId.replace(/^EMP-/i, '')}`])).filter(Boolean);
          for (const tid of idsToClean) {
            try { await db.prepare("DELETE FROM ot_daily_records WHERE employeeId = ?").bind(tid).run(); } catch (_) {}
            try { await db.prepare("DELETE FROM ot_requests WHERE employeeId = ?").bind(tid).run(); } catch (_) {}
            try { await db.prepare("DELETE FROM leave_records WHERE employeeId = ?").bind(tid).run(); } catch (_) {}
          }
        } catch (e) {
          console.error("D1 Delete Employee Error:", e);
        }
      }
      return Response.json({ success: true, message: "ลบพนักงานเรียบร้อยแล้ว" }, { headers: corsHeaders });
    }

    // 8.5 GET /api/job-value
    if (path === "/api/job-value" && request.method === "GET") {
      let records: any[] = [];
      if (db) {
        try {
          const res = await db.prepare("SELECT id, name, deptId, role, status, avgRevenue, avgCost, profit2026, profit2025, monthlyRevenue, monthlyCost, monthlyProfit, updatedAt FROM employees ORDER BY id ASC").all();
          if (res && res.results) {
            records = res.results.map((r: any) => ({
              id: r.id,
              empId: r.id,
              empName: r.name,
              deptId: r.deptId,
              department: r.deptId,
              position: r.role,
              status: r.status || "Active",
              avgRevenue: Number(r.avgRevenue) || 0,
              avgCost: Number(r.avgCost) || 0,
              profit2026: Number(r.profit2026) || 0,
              profit2025: Number(r.profit2025) || 0,
              monthlyRevenue: typeof r.monthlyRevenue === "string" ? JSON.parse(r.monthlyRevenue || "[]") : (r.monthlyRevenue || []),
              monthlyCost: typeof r.monthlyCost === "string" ? JSON.parse(r.monthlyCost || "[]") : (r.monthlyCost || []),
              monthlyProfit: typeof r.monthlyProfit === "string" ? JSON.parse(r.monthlyProfit || "[]") : (r.monthlyProfit || []),
              updatedAt: r.updatedAt || ""
            }));
          }
        } catch (e) {
          console.error("D1 Fetch Job Value Error:", e);
        }
      }
      return Response.json(records, { headers: corsHeaders });
    }

    // 8.6 POST /api/job-value/import OR /api/import-job-value
    if ((path === "/api/job-value/import" || path === "/api/import-job-value") && request.method === "POST") {
      const body = await getBody();
      const records = body.records || [];
      if (db && Array.isArray(records)) {
        try {
          for (const item of records) {
            const targetId = String(item.empId || item.id || "").trim();
            if (targetId) {
              const stripped = targetId.replace(/^(EMP-|POS-)/i, "");
              const empIdVariants = [targetId, `EMP-${stripped}`, stripped].filter(Boolean);

              let existing: any = null;
              try {
                existing = await db.prepare(
                  `SELECT id FROM employees WHERE id = ? OR id = ? OR id = ? OR name = ?`
                ).bind(empIdVariants[0], empIdVariants[1] || empIdVariants[0], empIdVariants[2] || empIdVariants[0], item.empName || targetId).first();
              } catch (_) {}

              const avgRev = Number(item.avgRevenue) || 0;
              const avgCost = Number(item.avgCost) || 0;
              const p26 = Number(item.profit2026 || item.totalProfit) || ((avgRev - avgCost) * 12);
              const p25 = Number(item.profit2025) || Math.round(p26 * 0.9);
              const mRev = Array.isArray(item.monthlyRevenue) ? JSON.stringify(item.monthlyRevenue) : (item.monthlyRevenue || "[]");
              const mCost = Array.isArray(item.monthlyCost) ? JSON.stringify(item.monthlyCost) : (item.monthlyCost || "[]");
              const mProf = Array.isArray(item.monthlyProfit) ? JSON.stringify(item.monthlyProfit) : (item.monthlyProfit || "[]");
              const nowIso = new Date().toISOString();

              if (existing && existing.id) {
                await db.prepare(
                  `UPDATE employees SET avgRevenue = ?, avgCost = ?, profit2026 = ?, profit2025 = ?, monthlyRevenue = ?, monthlyCost = ?, monthlyProfit = ?, updatedAt = ? WHERE id = ?`
                ).bind(avgRev, avgCost, p26, p25, mRev, mCost, mProf, nowIso, existing.id).run();
              } else {
                const dept = item.department || item.deptId || "inter2";
                const role = item.position || item.role || "Operator";
                const name = item.empName || item.name || targetId;
                await db.prepare(
                  `INSERT INTO employees (id, name, deptId, unit, role, level, status, avgRevenue, avgCost, profit2026, profit2025, monthlyRevenue, monthlyCost, monthlyProfit, updatedAt)
                   VALUES (?, ?, ?, ?, ?, 'Staff', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                ).bind(targetId, name, dept, dept, role, item.status || "Active", avgRev, avgCost, p26, p25, mRev, mCost, mProf, nowIso).run();
              }
            }
          }
        } catch (e) {
          console.error("D1 Import Job Value Error:", e);
        }
      }
      return Response.json({ success: true, message: `นำเข้าข้อมูล Job Value ${records.length} รายการเรียบร้อยแล้ว`, count: records.length }, { headers: corsHeaders });
    }

    // 8.7 POST /api/clear-job-value
    if (path === "/api/clear-job-value" && request.method === "POST") {
      if (db) {
        try {
          await db.prepare("UPDATE employees SET avgRevenue = 0, avgCost = 0, profit2026 = 0, profit2025 = 0, monthlyRevenue = '[]', monthlyCost = '[]', monthlyProfit = '[]'").run();
        } catch (e) {
          console.error("D1 Clear Job Value Error:", e);
        }
      }
      return Response.json({ success: true, message: "ล้างข้อมูล Job Value ทั้งหมดใน D1 Database เรียบร้อยแล้ว" }, { headers: corsHeaders });
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

    // 13.5 POST /api/clear-mock-data OR /api/clear-all-data
    if ((path === "/api/clear-mock-data" || path === "/api/clear-all-data") && request.method === "POST") {
      if (db) {
        try {
          await db.prepare("DELETE FROM employees").run();
          await db.prepare("DELETE FROM ot_daily_records").run();
          await db.prepare("DELETE FROM leave_records").run();
          try { await db.prepare("DELETE FROM job_value_records").run(); } catch (_) {}
          try { await db.prepare("DELETE FROM vessel_schedules").run(); } catch (_) {}
          try { await db.prepare("DELETE FROM ot_requests").run(); } catch (_) {}
          try { await db.prepare("DELETE FROM manpower_positions").run(); } catch (_) {}
          try { await db.prepare("DELETE FROM audit_logs").run(); } catch (_) {}
        } catch (e) {
          console.error("D1 Clear Mock Data Error:", e);
        }
      }
      return Response.json({ success: true, message: "ล้างข้อมูลทั้งหมดในระบบเรียบร้อยแล้ว" }, { headers: corsHeaders });
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

    // 16. GET /api/manpower (Fetch all positions from employees master table)
    if (path === "/api/manpower" && request.method === "GET") {
      let positions: any[] = [];
      if (db) {
        try {
          const res = await db.prepare("SELECT id, positionId, name, role, deptId, unit, level, ocType, status, isMgr, isEng, avatar, employmentStatus FROM employees ORDER BY id ASC").all();
          if (res && res.results) {
            positions = res.results.map((r: any) => ({
              id: r.positionId || `POS-${r.id}`,
              empId: r.status === "Vacant" ? "" : r.id,
              name: r.name,
              role: r.role,
              unit: r.unit || r.deptId || "INTER 2",
              level: r.level || "Staff",
              isMgr: Boolean(r.isMgr),
              isEng: Boolean(r.isEng),
              status: r.status || (r.employmentStatus === "Resigned" ? "Resigned" : "Active"),
              ocType: r.ocType || "OLD",
              img: r.avatar || null
            }));
          }
        } catch (e) {
          console.error("D1 Get Manpower Positions Error:", e);
        }
      }
      return Response.json({ success: true, positions }, { headers: corsHeaders });
    }

    // 17. POST /api/manpower (Upsert single position in employees table)
    if (path === "/api/manpower" && request.method === "POST") {
      const body = await getBody();
      const pos = body.position || body;
      if (db && pos && pos.id) {
        try {
          const pEmpId = (pos.empId || "").trim();
          const pPosId = pos.id || `POS-${pEmpId || Date.now()}`;
          const pName = (pos.name || "").trim();
          const pRole = pos.role || "Operator";
          const pUnit = pos.unit || "INTER 2";
          const pLevel = pos.level || "Staff";
          const pOcType = pos.ocType || "OLD";
          const pStatus = pos.status || "Active";
          const pIsMgr = pos.isMgr ? 1 : 0;
          const pIsEng = pos.isEng ? 1 : 0;

          let existing: any = null;
          if (pEmpId) {
            existing = await db.prepare("SELECT id FROM employees WHERE id = ? OR id = ?").bind(pEmpId, `EMP-${pEmpId.replace(/^EMP-/i, '')}`).first();
          }
          if (!existing && pPosId) {
            existing = await db.prepare("SELECT id FROM employees WHERE positionId = ?").bind(pPosId).first();
          }
          if (!existing && pName && !pName.toLowerCase().includes("vacant") && pName !== "ว่าง") {
            existing = await db.prepare("SELECT id FROM employees WHERE name = ?").bind(pName).first();
          }

          if (existing && existing.id) {
            await db.prepare(`UPDATE employees SET positionId = ?, name = ?, role = ?, unit = ?, level = ?, ocType = ?, status = ?, isMgr = ?, isEng = ?, avatar = COALESCE(?, avatar) WHERE id = ?`)
              .bind(pPosId, pName, pRole, pUnit, pLevel, pOcType, pStatus, pIsMgr, pIsEng, pos.img || null, existing.id).run();
          } else if (pEmpId && pStatus !== "Vacant" && !pName.toLowerCase().includes("vacant") && pName !== "ว่าง") {
            const canonicalEmpId = pEmpId;
            await db.prepare(`INSERT OR REPLACE INTO employees (
              id, positionId, name, deptId, role, unit, level, ocType, status, isMgr, isEng,
              targetOt, groupName, shifts, planShifts, salary, division, prefix, firstName, lastName,
              nickname, birthday, age, calculatedAge, startDate, tenure, probationDate, calendarType,
              resignationDate, employmentStatus, avatar
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'Group A', '[]', '[]', 20000, 'ฝ่ายปฏิบัติการท่าเรือ', 'นาย', ?, '', '', '', 30, 30, ?, '1 ปี', '', 'ปฏิทินกะ 4-on-2-off', '', ?, ?)`).bind(
              canonicalEmpId, pPosId, pName || "พนักงาน", "inter2", pRole, pUnit, pLevel, pOcType, pStatus, pIsMgr, pIsEng,
              pName.split(" ")[0] || pName, new Date().toISOString().slice(0, 10), "Active", pos.img || ""
            ).run();
          } else if (pStatus === "Vacant" || !pEmpId || pName.toLowerCase().includes("vacant") || pName === "ว่าง") {
            // Unlink position from any employee who was previously assigned to this slot
            try {
              await db.prepare("UPDATE employees SET positionId = '' WHERE positionId = ?").bind(pPosId).run();
            } catch (_) {}
          }
        } catch (e) {
          console.error("D1 Upsert Manpower Position Error:", e);
        }
      }
      return Response.json({ success: true, message: "บันทึกตำแหน่งงานในฐานข้อมูลเรียบร้อยแล้ว" }, { headers: corsHeaders });
    }

    // 18. POST /api/manpower/bulk (Bulk save / replace all positions in employees master table)
    if (path === "/api/manpower/bulk" && request.method === "POST") {
      const body = await getBody();
      const positions = body.positions || [];
      if (db && Array.isArray(positions)) {
        try {
          for (const pos of positions) {
            const pEmpId = (pos.empId || "").trim();
            const pPosId = pos.id || `POS-${pEmpId || Date.now()}`;
            const pName = (pos.name || "").trim();
            const pRole = pos.role || "Operator";
            const pUnit = pos.unit || "INTER 2";
            const pLevel = pos.level || "Staff";
            const pOcType = pos.ocType || "OLD";
            const pStatus = pos.status || "Active";
            const pIsMgr = pos.isMgr ? 1 : 0;
            const pIsEng = pos.isEng ? 1 : 0;

            let existing: any = null;
            if (pEmpId) {
              existing = await db.prepare("SELECT id FROM employees WHERE id = ? OR id = ?").bind(pEmpId, `EMP-${pEmpId.replace(/^EMP-/i, '')}`).first();
            }
            if (!existing && pPosId) {
              existing = await db.prepare("SELECT id FROM employees WHERE positionId = ?").bind(pPosId).first();
            }
            if (!existing && pName && !pName.toLowerCase().includes("vacant") && pName !== "ว่าง") {
              existing = await db.prepare("SELECT id FROM employees WHERE name = ?").bind(pName).first();
            }

            if (existing && existing.id) {
              await db.prepare(`UPDATE employees SET positionId = ?, name = ?, role = ?, unit = ?, level = ?, ocType = ?, status = ?, isMgr = ?, isEng = ?, avatar = COALESCE(?, avatar) WHERE id = ?`)
                .bind(pPosId, pName, pRole, pUnit, pLevel, pOcType, pStatus, pIsMgr, pIsEng, pos.img || null, existing.id).run();
            } else if (pEmpId && pStatus !== "Vacant" && !pName.toLowerCase().includes("vacant") && pName !== "ว่าง") {
              const canonicalEmpId = pEmpId;
              await db.prepare(`INSERT OR REPLACE INTO employees (
                id, positionId, name, deptId, role, unit, level, ocType, status, isMgr, isEng,
                targetOt, groupName, shifts, planShifts, salary, division, prefix, firstName, lastName,
                nickname, birthday, age, calculatedAge, startDate, tenure, probationDate, calendarType,
                resignationDate, employmentStatus, avatar
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'Group A', '[]', '[]', 20000, 'ฝ่ายปฏิบัติการท่าเรือ', 'นาย', ?, '', '', '', 30, 30, ?, '1 ปี', '', 'ปฏิทินกะ 4-on-2-off', '', ?, ?)`).bind(
                canonicalEmpId, pPosId, pName || "พนักงาน", "inter2", pRole, pUnit, pLevel, pOcType, pStatus, pIsMgr, pIsEng,
                pName.split(" ")[0] || pName, new Date().toISOString().slice(0, 10), "Active", pos.img || ""
              ).run();
            } else if (pStatus === "Vacant" || !pEmpId || pName.toLowerCase().includes("vacant") || pName === "ว่าง") {
              try {
                await db.prepare("UPDATE employees SET positionId = '' WHERE positionId = ?").bind(pPosId).run();
              } catch (_) {}
            }
          }
        } catch (e) {
          console.error("D1 Bulk Save Manpower Error:", e);
        }
      }
      return Response.json({ success: true, count: positions.length, message: "บันทึกโครงสร้างอัตรากำลังลงฐานข้อมูลเรียบร้อยแล้ว" }, { headers: corsHeaders });
    }

    // 19. DELETE /api/manpower (Delete vacant position or mark position vacant in employees)
    if (path.startsWith("/api/manpower") && request.method === "DELETE") {
      const urlObj = new URL(request.url);
      const isClearAll = urlObj.searchParams.get("clearAll") === "true" || urlObj.searchParams.get("clear_all") === "true";
      const idFromQuery = urlObj.searchParams.get("id");
      const idFromPath = path.replace(/^\/api\/manpower\/?/, "");
      const targetId = idFromQuery || idFromPath;
      if (db) {
        try {
          if (isClearAll || targetId === "all" || targetId === "clear-all" || targetId === "clearAll") {
            await db.prepare("DELETE FROM employees").run();
          } else if (targetId) {
            await db.prepare("DELETE FROM employees WHERE id = ? OR positionId = ?").bind(targetId, targetId).run();
          }
        } catch (e) {
          console.error("D1 Delete Manpower Position Error:", e);
        }
      }
      return Response.json({ success: true, message: "ปรับปรุงสถานะตำแหน่งเรียบร้อยแล้ว" }, { headers: corsHeaders });
    }

    // 20. GET /api/audit-logs
    if (path === "/api/audit-logs" && request.method === "GET") {
      let logs: any[] = [];
      if (db) {
        try {
          const limit = Number(url.searchParams.get("limit")) || 100;
          const res = await db.prepare("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?").bind(limit).all();
          logs = res.results || [];
        } catch (e) {
          console.error("D1 Fetch Audit Logs Error:", e);
        }
      }
      return Response.json(logs, { headers: corsHeaders });
    }

    // 20. LINE OA Webhook endpoint (/api/line-webhook)
    if (path === "/api/line-webhook") {
      if (request.method === "GET") {
        return Response.json({ status: "ok", service: "LINE OA Webhook Endpoint", ready: true }, { headers: corsHeaders });
      }

      if (request.method === "POST") {
        const DEFAULT_LINE_CHANNEL_SECRET = "10bc535b070ddf725f6d8147bdcfa02f";
        const DEFAULT_LINE_ACCESS_TOKEN = "vKI+vZEU0/bfQmxJE6oNweN2slMnbZQldqa+JXUMggobaCx4v7gY5c0sYCzqfdG6OBiIPF1QWwxz+rQMddyZ4ue6NC6mnqBd2nvaRBMVwOmOVSBF8RktKVWWauAM4PdD76TLSX4e4EuTpy8JGL027wdB04t89/1O/w1cDnyilFU=";
        const channelSecret = env.LINE_CHANNEL_SECRET || DEFAULT_LINE_CHANNEL_SECRET;
        const channelAccessToken = env.LINE_CHANNEL_ACCESS_TOKEN || DEFAULT_LINE_ACCESS_TOKEN;

        let rawBody = "";
        try {
          rawBody = await request.text();
        } catch {
          return Response.json({ error: "Cannot read body" }, { status: 400, headers: corsHeaders });
        }

        let payload: any = {};
        try {
          payload = JSON.parse(rawBody);
        } catch {
          payload = {};
        }

        const events = payload.events || [];
        // LINE Console "Verify" probe sends events: [] -> Return 200 OK immediately
        if (events.length === 0) {
          return Response.json({ status: "ok", message: "Verification success" }, { status: 200, headers: corsHeaders });
        }

        // Auto ensure columns exist in D1
        if (db) {
          try {
            await db.prepare("ALTER TABLE ot_daily_records ADD COLUMN vesselName TEXT DEFAULT ''").run();
            await db.prepare("ALTER TABLE ot_daily_records ADD COLUMN timeRange TEXT DEFAULT ''").run();
            await db.prepare("ALTER TABLE ot_daily_records ADD COLUMN multiplier REAL DEFAULT 1.0").run();
            await db.prepare("ALTER TABLE ot_daily_records ADD COLUMN source TEXT DEFAULT 'SYSTEM'").run();
          } catch {}
        }

        for (const event of events) {
          if (event.type === "message" && event.message?.type === "text") {
            const text = event.message.text.trim();
            const replyToken = event.replyToken;

            // Shift intervals regex
            const shiftRegex = /(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})\s*=\s*(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)/gi;
            const shifts: Array<{ timeRange: string; hours: number; multiplier: number; shiftCode: string }> = [];
            let match: RegExpExecArray | null;
            while ((match = shiftRegex.exec(text)) !== null) {
              const hours = parseFloat(match[3]);
              const multiplier = parseFloat(match[4]);
              shifts.push({
                timeRange: `${match[1]}-${match[2]}`,
                hours,
                multiplier,
                shiftCode: multiplier >= 3 ? "OT-3X" : (multiplier > 1 ? "OT-1.5X" : "OT-1X")
              });
            }

            const hasOtKeyword = /ขออนุมัติทำงานล่วงเวลา|ทำงานล่วงเวลา|โอที|\bOT\b/i.test(text);
            if (shifts.length === 0 && !hasOtKeyword) {
              if (replyToken) {
                await fetch("https://api.line.me/v2/bot/message/reply", {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${channelAccessToken}` },
                  body: JSON.stringify({
                    replyToken,
                    messages: [{
                      type: "text",
                      text: "สวัสดีครับ 👋 ระบบบันทึก OT อัตโนมัติ\n\nหากต้องการยื่นขอ OT กรุณาส่งตามรูปแบบตัวอย่าง:\n\nขออนุมัติทำงานล่วงเวลา\nM.V.\"PEDHOULAS TRADER\"\nแผนก ปากเรือ\nนาย สุทัศน์ พุทธเสน\nรหัส 668126\nวันที่ 04/10/2569\n00:00-08:00=8×1\n08:00-16:00=8×3"
                    }]
                  })
                }).catch(() => {});
              }
              continue;
            }

            // Extract fields
            let vesselName = "ทั่วไป";
            const vesselMatch = text.match(/(?:M\.?V\.?|เรือ|MV)\s*[:"']?\s*([^"'\r\n]+)["']?/i);
            if (vesselMatch) {
              const raw = vesselMatch[1].trim().replace(/^["']|["']$/g, "");
              vesselName = raw.toUpperCase().startsWith("M.V.") ? raw : `M.V. ${raw}`;
            }

            let department = "ไม่ระบุแผนก";
            const deptMatch = text.match(/แผนก\s*[:\s]?\s*([^\r\n]+)/i);
            if (deptMatch) department = deptMatch[1].trim();

            let employeeName = "พนักงาน";
            const nameMatch = text.match(/(?:นาย\s+นาย|นาย|นางสาว|นาง|คุณ)\s*([^\r\n]+)/);
            if (nameMatch) {
              employeeName = nameMatch[0].trim().replace(/^นาย\s+นาย\s+/g, "นาย ");
            }

            let employeeId = "ไม่ระบุรหัส";
            const idMatch = text.match(/(?:รหัส|ID|Emp ID)\s*[:\s]?\s*([A-Za-z0-9\-]+)/i);
            if (idMatch) {
              employeeId = idMatch[1].trim();
            } else {
              const numMatch = text.match(/\b\d{5,7}\b/);
              if (numMatch) employeeId = numMatch[0];
            }

            let date = new Date().toISOString().substring(0, 10);
            let dateDisplayTh = "";
            const dateMatch = text.match(/(?:วันที่|Date)\s*[:\s]?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i);
            if (dateMatch) {
              const day = dateMatch[1].padStart(2, "0");
              const month = dateMatch[2].padStart(2, "0");
              const rawYear = parseInt(dateMatch[3], 10);
              dateDisplayTh = `${day}/${month}/${rawYear}`;
              const solarYear = rawYear > 2500 ? rawYear - 543 : rawYear;
              date = `${solarYear}-${month}-${day}`;
            } else {
              const today = new Date();
              dateDisplayTh = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear() + 543}`;
            }

            const totalHours = shifts.reduce((sum, s) => sum + s.hours, 0);
            const [yearStr, monthStr] = date.split("-");
            const recordYear = parseInt(yearStr, 10);
            const recordMonth = parseInt(monthStr, 10);

            // Duplicate Detection in D1
            const duplicates: string[] = [];
            if (db) {
              for (const shift of shifts) {
                try {
                  const existing = await db.prepare(
                    "SELECT id FROM ot_daily_records WHERE employeeId = ? AND date = ? AND (timeRange = ? OR note LIKE ?)"
                  ).bind(employeeId, date, shift.timeRange, `%${shift.timeRange}%`).first();

                  if (existing) {
                    duplicates.push(`${shift.timeRange} (${shift.hours} ชม.)`);
                  }
                } catch {}
              }
            }

            if (duplicates.length > 0) {
              if (replyToken) {
                const warnMsg = [
                  "⚠️ แจ้งเตือน: พบรายการขอ OT ซ้ำในระบบ!",
                  "━━━━━━━━━━━━━━━━━━━━",
                  `👤 พนักงาน: ${employeeName}`,
                  `🆔 รหัส: ${employeeId}`,
                  `📅 วันที่: ${dateDisplayTh}`,
                  "❌ ช่วงเวลาที่เคยบันทึกไปแล้ว:",
                  ...duplicates.map(d => `  • ${d}`),
                  "━━━━━━━━━━━━━━━━━━━━",
                  "ระบบปฏิเสธการบันทึกซ้ำ เพื่อความถูกต้องของข้อมูลบน Dashboard ครับ"
                ].join("\n");

                await fetch("https://api.line.me/v2/bot/message/reply", {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${channelAccessToken}` },
                  body: JSON.stringify({ replyToken, messages: [{ type: "text", text: warnMsg }] })
                }).catch(() => {});
              }
              continue;
            }

            // Insert into D1
            if (db) {
              for (let i = 0; i < shifts.length; i++) {
                const s = shifts[i];
                const recordId = `LINE-${Date.now()}-${i + 1}`;
                const note = `${vesselName} (${s.timeRange} = ${s.hours}x${s.multiplier})`;
                try {
                  await db.prepare(`
                    INSERT INTO ot_daily_records (
                      id, year, month, date, employeeId, employeeName, deptId, shiftCode, otHours, note, vesselName, timeRange, multiplier, source
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'LINE_OA')
                  `).bind(
                    recordId, recordYear, recordMonth, date, employeeId, employeeName, department, s.shiftCode, s.hours, note, vesselName, s.timeRange, s.multiplier
                  ).run();
                } catch (e) {
                  console.error("D1 Insert Error:", e);
                }
              }
            }

            // Reply confirmation
            if (replyToken) {
              const successMsg = [
                "✅ บันทึกขออนุมัติ OT เรียบร้อยแล้ว!",
                "━━━━━━━━━━━━━━━━━━━━",
                `🚢 เรือ/หน้างาน: ${vesselName}`,
                `🏢 แผนก: ${department}`,
                `👤 พนักงาน: ${employeeName}`,
                `🆔 รหัส: ${employeeId}`,
                `📅 วันที่: ${dateDisplayTh}`,
                "━━━━━━━━━━━━━━━━━━━━",
                "⏰ รายการเวลาทำงาน:",
                ...shifts.map(s => `  • ${s.timeRange} = ${s.hours} ชม. (เรท x${s.multiplier})`),
                "━━━━━━━━━━━━━━━━━━━━",
                `⏱️ รวมชั่วโมง OT: ${totalHours} ชม.`,
                "🌐 ข้อมูลเข้าสู่ Cloudflare D1 และแสดงบน Dashboard เรียบร้อยแล้ว"
              ].join("\n");

              await fetch("https://api.line.me/v2/bot/message/reply", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${channelAccessToken}` },
                body: JSON.stringify({ replyToken, messages: [{ type: "text", text: successMsg }] })
              }).catch(() => {});
            }
          }
        }

        return Response.json({ status: "ok" }, { headers: corsHeaders });
      }
    }

    // Default 404 response for unhandled API paths
    return Response.json({ error: "Endpoint not found" }, { status: 404, headers: corsHeaders });

  } catch (err: any) {
    console.error("Pages Function Error:", err);
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
};
