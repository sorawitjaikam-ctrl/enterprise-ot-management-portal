import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
};

// ============================================================
// Shift Code → OT Hours mapping
// ============================================================
const SHIFT_OT_MAP: Record<string, number> = {
  "M8":  0, "A8":  0, "N8":  0,
  "M12": 4, "A12": 4, "N12": 4,
  "M16": 8, "N16": 8,
  "OND": 8,
  "D":   0, "O":   0
};

const getShiftOt = (shiftCode: string): number => {
  if (shiftCode === "OND") return 8;
  const match = shiftCode.match(/\d+$/);
  if (match) {
    const hours = Number(match[0]);
    return Math.max(0, hours - 8);
  }
  return SHIFT_OT_MAP[shiftCode] ?? 0;
};

// ============================================================
// Real departments
// ============================================================
const REAL_DEPARTMENTS = [
  { id: "inter2", name: "INTER 2",       nameTh: "แผนก INTER 2",       manager: "-", managerRole: "Section Manager", managerImg: "", icon: "precision_manufacturing" },
  { id: "inter3", name: "INTER 3",       nameTh: "แผนก INTER 3",       manager: "-", managerRole: "Section Manager", managerImg: "", icon: "precision_manufacturing" },
  { id: "inter5", name: "INTER 5",       nameTh: "แผนก INTER 5",       manager: "-", managerRole: "Section Manager", managerImg: "", icon: "precision_manufacturing" },
  { id: "inter7", name: "INTER 7",       nameTh: "แผนก INTER 7",       manager: "-", managerRole: "Section Manager", managerImg: "", icon: "precision_manufacturing" },
  { id: "heavy",  name: "Heavy Machine", nameTh: "แผนก Heavy Machine", manager: "-", managerRole: "Section Manager", managerImg: "", icon: "settings" },
  { id: "ecc",    name: "ECC",           nameTh: "แผนก ECC",           manager: "-", managerRole: "Section Manager", managerImg: "", icon: "electrical_services" },
];

// Roles that can see ALL departments
const FULL_ACCESS_ROLES = ["HR", "HR Section Manager", "Operation Dir", "Operation Depart", "ผู้ดูแลระบบ"];

const hasFullAccess = (role: string) => FULL_ACCESS_ROLES.includes(role);

// ============================================================
// Initial in-memory state
// ============================================================
let appState = {
  departments: REAL_DEPARTMENTS.map(d => ({ ...d, employeesCount: 0, otHours: 0, budgetUsed: 0, budgetUtilization: 0, status: "On Track" })),
  employees: [] as any[],
  shiftConfig: {
    pattern: "4-on-2-off",
    currentMonth: new Date().toISOString().substring(0, 7),
    currentDept: "inter2"
  },
  otTrendData: { months: [] as string[], lastYear: [] as number[], currentYear: [] as number[] }
};

// Fallback in-memory accounts
let appAccounts: any[] = [
  { username: "admin",      password: "admin123",       name: "ผู้ดูแลระบบ",           role: "ผู้ดูแลระบบ",        deptId: "all", avatar: "" },
  { username: "hr",         password: "hr1234",         name: "HR Manager",             role: "HR",                 deptId: "all", avatar: "" },
  { username: "hr_sec",     password: "hrsec1234",      name: "HR Section Manager",     role: "HR Section Manager", deptId: "all", avatar: "" },
  { username: "op_dir",     password: "opdir1234",      name: "Operation Director",     role: "Operation Dir",      deptId: "all", avatar: "" },
  { username: "op_dept",    password: "opdept1234",     name: "Operation Department",   role: "Operation Depart",   deptId: "all", avatar: "" },
  { username: "inter2_mgr", password: "i2mgr1234",      name: "Section Manager INTER2", role: "Section Manager",    deptId: "inter2", avatar: "" },
  { username: "inter3_mgr", password: "i3mgr1234",      name: "Section Manager INTER3", role: "Section Manager",    deptId: "inter3", avatar: "" },
  { username: "inter5_mgr", password: "i5mgr1234",      name: "Section Manager INTER5", role: "Section Manager",    deptId: "inter5", avatar: "" },
  { username: "inter7_mgr", password: "i7mgr1234",      name: "Section Manager INTER7", role: "Section Manager",    deptId: "inter7", avatar: "" },
  { username: "heavy_mgr",  password: "hvmgr1234",      name: "Section Manager Heavy",  role: "Section Manager",    deptId: "heavy",  avatar: "" },
  { username: "ecc_mgr",    password: "eccmgr1234",     name: "Section Manager ECC",    role: "Section Manager",    deptId: "ecc",    avatar: "" },
];

// ============================================================
// Local persistence (offline mode)
// ============================================================
const DB_FILE = path.join(process.cwd(), "db.json");

const saveLocalDb = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify({ appState, appAccounts }, null, 2), "utf8");
  } catch (err) { console.error("Failed to save local DB:", err); }
};

const loadLocalDb = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      if (data.appState) appState = data.appState;
      if (data.appAccounts) appAccounts = data.appAccounts;
      console.log("Loaded persistent local state from db.json");
    } else {
      saveLocalDb();
    }
  } catch (err) { console.error("Failed to load local DB:", err); }
};

loadLocalDb();

// ============================================================
// Cloudflare D1 helpers
// ============================================================
const isD1Enabled = () =>
  !!(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_DATABASE_ID);

const queryD1 = async (sql: string, params: any[] = []): Promise<any> => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken  = process.env.CLOUDFLARE_API_TOKEN;
  const dbId      = process.env.CLOUDFLARE_DATABASE_ID;
  if (!accountId || !apiToken || !dbId) throw new Error("Missing Cloudflare D1 credentials");

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ sql, params })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`D1 Query failed: ${response.statusText} - ${errorText}`);
  }

  const data: any = await response.json();
  if (!data.success) throw new Error(`D1 API error: ${JSON.stringify(data.errors)}`);

  const queryResult = data.result[0];
  if (!queryResult.success) throw new Error(`SQL error: ${JSON.stringify(queryResult.errors || data.errors)}`);

  return queryResult.results || [];
};

// ============================================================
// D1 Database Initialization
// ============================================================
const initD1Database = async () => {
  if (!isD1Enabled()) {
    console.log("Cloudflare D1 is not enabled (missing env variables). Running in offline mock mode.");
    return;
  }

  console.log("Initializing Cloudflare D1 database tables...");
  try {
    // Departments
    await queryD1(`CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY, name TEXT, nameTh TEXT,
      manager TEXT, managerRole TEXT, managerImg TEXT,
      employeesCount INTEGER DEFAULT 0, otHours REAL DEFAULT 0,
      budgetUsed REAL DEFAULT 0, budgetUtilization REAL DEFAULT 0,
      status TEXT DEFAULT 'On Track', icon TEXT
    )`);

    // Employees
    await queryD1(`CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY, name TEXT, deptId TEXT, role TEXT,
      targetOt REAL DEFAULT 48, actualOt REAL DEFAULT 0,
      otPct REAL DEFAULT 0, status TEXT DEFAULT 'On Track',
      groupName TEXT, shifts TEXT DEFAULT '[]'
    )`);

    // Check if ot_daily_records is outdated (missing month column)
    try {
      await queryD1("SELECT month FROM ot_daily_records LIMIT 1");
    } catch (e) {
      console.log("Table ot_daily_records does not have 'month' column. Recreating...");
      await queryD1("DROP TABLE IF EXISTS ot_daily_records");
    }

    // OT Daily Records (new — computed from shifts)
    await queryD1(`CREATE TABLE IF NOT EXISTS ot_daily_records (
      id TEXT PRIMARY KEY,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      date TEXT NOT NULL,
      employeeId TEXT NOT NULL,
      employeeName TEXT,
      deptId TEXT NOT NULL,
      shiftCode TEXT NOT NULL,
      otHours REAL NOT NULL DEFAULT 0,
      note TEXT DEFAULT ''
    )`);

    // Shift config
    await queryD1(`CREATE TABLE IF NOT EXISTS shift_config (
      pattern TEXT, currentMonth TEXT, currentDept TEXT
    )`);

    // Accounts
    await queryD1(`CREATE TABLE IF NOT EXISTS accounts (
      username TEXT PRIMARY KEY, password TEXT, name TEXT,
      role TEXT, deptId TEXT, avatar TEXT
    )`);

    // Seed departments if empty
    const depts = await queryD1("SELECT id FROM departments LIMIT 1");
    if (depts.length === 0) {
      console.log("Seeding real departments and default accounts...");

      for (const d of REAL_DEPARTMENTS) {
        await queryD1(`INSERT INTO departments (id, name, nameTh, manager, managerRole, managerImg, employeesCount, otHours, budgetUsed, budgetUtilization, status, icon)
          VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 'On Track', ?)`,
          [d.id, d.name, d.nameTh, d.manager, d.managerRole, d.managerImg, d.icon]);
      }

      // Seed accounts
      const existingAccounts = await queryD1("SELECT username FROM accounts LIMIT 1");
      if (existingAccounts.length === 0) {
        for (const acc of appAccounts) {
          await queryD1(`INSERT INTO accounts (username, password, name, role, deptId, avatar) VALUES (?, ?, ?, ?, ?, ?)`,
            [acc.username, acc.password, acc.name, acc.role, acc.deptId, acc.avatar]);
        }
      }

      // Seed shift config
      const sc = appState.shiftConfig;
      await queryD1(`INSERT INTO shift_config (pattern, currentMonth, currentDept) VALUES (?, ?, ?)`,
        [sc.pattern, sc.currentMonth, sc.currentDept]);

      console.log("Database seeded successfully.");
    }
    console.log("D1 Database initialization completed.");
  } catch (error) {
    console.error("Failed to initialize D1 database:", error);
  }
};

// ============================================================
// Helper: recompute actualOt for an employee from ot_daily_records
// ============================================================
const recomputeEmployeeOt = async (employeeId: string, deptId: string) => {
  if (isD1Enabled()) {
    const rows = await queryD1("SELECT SUM(otHours) as total FROM ot_daily_records WHERE employeeId = ?", [employeeId]);
    const totalOt = rows[0]?.total || 0;
    const emps = await queryD1("SELECT targetOt FROM employees WHERE id = ? LIMIT 1", [employeeId]);
    const targetOt = emps[0]?.targetOt || 48;
    const otPct = Math.round((totalOt / targetOt) * 100);
    const status = totalOt > targetOt ? "Warning" : "On Track";
    await queryD1("UPDATE employees SET actualOt = ?, otPct = ?, status = ? WHERE id = ?",
      [totalOt, otPct, status, employeeId]);
  }
};

// ============================================================
// ROUTES
// ============================================================

// --- Login ---
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    let account: any;
    if (isD1Enabled()) {
      const rows = await queryD1("SELECT * FROM accounts WHERE username = ?", [username]);
      account = rows[0];
    } else {
      account = appAccounts.find(a => a.username === username);
    }
    if (account && password === account.password) {
      res.json({ success: true, user: account });
    } else {
      res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// --- Update profile ---
app.post("/api/update-profile", async (req, res) => {
  const { username, name, avatar, password } = req.body;
  try {
    if (isD1Enabled()) {
      if (password) {
        await queryD1("UPDATE accounts SET name = ?, avatar = ?, password = ? WHERE username = ?", [name, avatar, password, username]);
      } else {
        await queryD1("UPDATE accounts SET name = ?, avatar = ? WHERE username = ?", [name, avatar, username]);
      }
    } else {
      const idx = appAccounts.findIndex(a => a.username === username);
      if (idx !== -1) {
        appAccounts[idx].name = name;
        appAccounts[idx].avatar = avatar;
        if (password) appAccounts[idx].password = password;
      }
      saveLocalDb();
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// --- Accounts list ---
app.get("/api/accounts", async (req, res) => {
  try {
    if (isD1Enabled()) {
      const rows = await queryD1("SELECT username, name, role, deptId, avatar FROM accounts");
      res.json(rows);
    } else {
      res.json(appAccounts.map(({ password: _, ...rest }) => rest));
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// --- Add account ---
app.post("/api/add-account", async (req, res) => {
  const { username, password, name, role, deptId, avatar } = req.body;
  if (!username || !password) return res.status(400).json({ error: "กรุณากรอก username และ password" });
  try {
    if (isD1Enabled()) {
      await queryD1("INSERT INTO accounts (username, password, name, role, deptId, avatar) VALUES (?, ?, ?, ?, ?, ?)",
        [username, password, name || username, role || "Section Manager", deptId || "all", avatar || ""]);
    } else {
      if (appAccounts.find(a => a.username === username)) return res.status(409).json({ error: "Username นี้มีอยู่แล้ว" });
      appAccounts.push({ username, password, name: name || username, role: role || "Section Manager", deptId: deptId || "all", avatar: avatar || "" });
      saveLocalDb();
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// --- Update account permission ---
app.post("/api/update-account-permission", async (req, res) => {
  const { targetUsername, role, deptId } = req.body;
  try {
    if (isD1Enabled()) {
      await queryD1("UPDATE accounts SET role = ?, deptId = ? WHERE username = ?", [role, deptId, targetUsername]);
    } else {
      const acc = appAccounts.find(a => a.username === targetUsername);
      if (acc) { acc.role = role; acc.deptId = deptId; }
      saveLocalDb();
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// --- Edit account (username + name + deptId + role) ---
app.post("/api/edit-account", async (req, res) => {
  const { originalUsername, username, name, role, deptId } = req.body;
  if (!originalUsername) return res.status(400).json({ error: "ต้องระบุ originalUsername" });
  try {
    if (isD1Enabled()) {
      if (originalUsername !== username) {
        await queryD1("UPDATE accounts SET username = ?, name = ?, role = ?, deptId = ? WHERE username = ?",
          [username, name, role, deptId, originalUsername]);
      } else {
        await queryD1("UPDATE accounts SET name = ?, role = ?, deptId = ? WHERE username = ?",
          [name, role, deptId, originalUsername]);
      }
    } else {
      const idx = appAccounts.findIndex(a => a.username === originalUsername);
      if (idx !== -1) {
        appAccounts[idx].username = username || appAccounts[idx].username;
        appAccounts[idx].name = name;
        appAccounts[idx].role = role;
        appAccounts[idx].deptId = deptId;
      }
      saveLocalDb();
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// --- Delete account ---
app.post("/api/delete-account", async (req, res) => {
  const { targetUsername, role } = req.body;
  const isHrOrAdmin = ["HR", "HR Section Manager", "ผู้ดูแลระบบ"].includes(role || "");
  if (!isHrOrAdmin) {
    return res.status(403).json({ error: "ไม่มีสิทธิ์ในการลบบัญชีผู้ใช้" });
  }
  try {
    if (isD1Enabled()) {
      await queryD1("DELETE FROM accounts WHERE username = ?", [targetUsername]);
    } else {
      appAccounts = appAccounts.filter(a => a.username !== targetUsername);
      saveLocalDb();
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// --- Reset account password ---
app.post("/api/reset-account-password", async (req, res) => {
  const { targetUsername, newPassword } = req.body;
  if (!targetUsername || !newPassword) return res.status(400).json({ error: "กรุณาระบุ username และรหัสผ่านใหม่" });
  try {
    if (isD1Enabled()) {
      await queryD1("UPDATE accounts SET password = ? WHERE username = ?", [newPassword, targetUsername]);
    } else {
      const acc = appAccounts.find(a => a.username === targetUsername);
      if (acc) acc.password = newPassword;
      saveLocalDb();
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ============================================================
// Portal State (Dashboard data)
// ============================================================
app.get("/api/portal-state", async (req, res) => {
  try {
    const now = new Date();
    const thisYear  = now.getFullYear();
    const thisMonth = now.getMonth() + 1;
    const lastYear  = thisYear - 1;

    if (isD1Enabled()) {
      const departments   = await queryD1("SELECT * FROM departments");
      const employeesRaw  = await queryD1("SELECT * FROM employees");
      const shiftConfigRaw = await queryD1("SELECT * FROM shift_config LIMIT 1");

      const employees = employeesRaw.map((e: any) => ({ ...e, shifts: JSON.parse(e.shifts || "[]") }));

      // Compute dept stats dynamically from employees
      const enrichedDepartments = departments.map((dept: any) => {
        const deptEmp = employees.filter((e: any) => e.deptId === dept.id);
        const employeesCount = deptEmp.length;
        const otHours = Math.round(deptEmp.reduce((s: number, e: any) => s + (e.actualOt || 0), 0) * 10) / 10;
        const budgetUsed = Math.round(otHours * 300);
        const budgetMax = 150000;
        const budgetUtilization = Math.min(100, Math.round((budgetUsed / budgetMax) * 100));
        const status = budgetUtilization > 95 ? "Warning" : "On Track";
        return { ...dept, employeesCount, otHours, budgetUsed, budgetUtilization, status };
      });

      // OT trend: 12 months current year vs last year from ot_daily_records
      const MONTH_LABELS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      const trendThisYear = await queryD1(
        "SELECT month, SUM(otHours) as total FROM ot_daily_records WHERE year = ? GROUP BY month ORDER BY month",
        [thisYear]
      );
      const trendLastYear = await queryD1(
        "SELECT month, SUM(otHours) as total FROM ot_daily_records WHERE year = ? GROUP BY month ORDER BY month",
        [lastYear]
      );
      const thisYearMap: Record<number, number> = {};
      const lastYearMap: Record<number, number> = {};
      trendThisYear.forEach((r: any) => { thisYearMap[r.month] = r.total; });
      trendLastYear.forEach((r: any) => { lastYearMap[r.month] = r.total; });

      const otTrendData = {
        months:      MONTH_LABELS,
        currentYear: MONTH_LABELS.map((_, i) => thisYearMap[i + 1] || 0),
        lastYear:    MONTH_LABELS.map((_, i) => lastYearMap[i + 1] || 0),
      };

      const shiftConfig = shiftConfigRaw[0] || appState.shiftConfig;

      res.json({ departments: enrichedDepartments, employees, shiftConfig, otTrendData, requests: [] });
    } else {
      // Offline mode
      const enriched = appState.departments.map(dept => {
        const deptEmp = appState.employees.filter(e => e.deptId === dept.id);
        const employeesCount = deptEmp.length;
        const otHours = Math.round(deptEmp.reduce((s, e) => s + (e.actualOt || 0), 0) * 10) / 10;
        const budgetUsed = Math.round(otHours * 300);
        const budgetMax = 150000;
        const budgetUtilization = Math.min(100, Math.round((budgetUsed / budgetMax) * 100));
        const status = budgetUtilization > 95 ? "Warning" : "On Track";
        return { ...dept, employeesCount, otHours, budgetUsed, budgetUtilization, status };
      });
      res.json({ ...appState, departments: enriched, requests: [] });
    }
  } catch (error: any) {
    console.error("portal-state error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// Update Shift Config
// ============================================================
app.post("/api/update-shift-config", async (req, res) => {
  const { currentMonth, pattern, currentDept } = req.body;
  try {
    if (isD1Enabled()) {
      const config = await queryD1("SELECT * FROM shift_config LIMIT 1");
      if (config.length > 0) {
        let sql = "UPDATE shift_config SET ";
        const updates: string[] = [];
        const params: any[] = [];
        if (currentMonth !== undefined) { updates.push("currentMonth = ?"); params.push(currentMonth); }
        if (pattern !== undefined) { updates.push("pattern = ?"); params.push(pattern); }
        if (currentDept !== undefined) { updates.push("currentDept = ?"); params.push(currentDept); }
        sql += updates.join(", ");
        await queryD1(sql, params);
      } else {
        await queryD1("INSERT INTO shift_config (pattern, currentMonth, currentDept) VALUES (?, ?, ?)",
          [pattern || "4-on-2-off", currentMonth || new Date().toISOString().substring(0, 7), currentDept || "inter2"]);
      }
    } else {
      if (currentMonth !== undefined) appState.shiftConfig.currentMonth = currentMonth;
      if (pattern !== undefined) appState.shiftConfig.pattern = pattern;
      if (currentDept !== undefined) appState.shiftConfig.currentDept = currentDept;
      saveLocalDb();
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ============================================================
// Save Shifts → auto-write OT daily records
// ============================================================
app.post("/api/save-shifts", async (req, res) => {
  try {
    const { employees, year, month } = req.body;
    if (!Array.isArray(employees)) return res.status(400).json({ error: "Invalid payload" });

    const now = new Date();
    const recordYear  = Number(year)  || now.getFullYear();
    const recordMonth = Number(month) || (now.getMonth() + 1);

    if (isD1Enabled()) {
      for (const emp of employees) {
        // Update shifts
        await queryD1("UPDATE employees SET shifts = ? WHERE id = ?", [JSON.stringify(emp.shifts || []), emp.id]);

        // Delete old OT records for this employee × this year/month
        await queryD1("DELETE FROM ot_daily_records WHERE employeeId = ? AND year = ? AND month = ?",
          [emp.id, recordYear, recordMonth]);

        // Get employee info
        const empRows = await queryD1("SELECT name, deptId FROM employees WHERE id = ? LIMIT 1", [emp.id]);
        const empName = empRows[0]?.name || emp.name || "";
        const deptId  = empRows[0]?.deptId || emp.deptId || "";

        // Insert OT records for each day with OT > 0
        const shifts: string[] = emp.shifts || [];
        for (let dayIdx = 0; dayIdx < shifts.length; dayIdx++) {
          const shiftCode = shifts[dayIdx];
          const otHrs = getShiftOt(shiftCode);
          if (otHrs > 0) {
            const dayNum = dayIdx + 1;
            const dateStr = `${recordYear}-${String(recordMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const recId = `OTD-${emp.id}-${recordYear}-${String(recordMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            await queryD1(`INSERT OR REPLACE INTO ot_daily_records (id, year, month, date, employeeId, employeeName, deptId, shiftCode, otHours, note)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '')`,
              [recId, recordYear, recordMonth, dateStr, emp.id, empName, deptId, shiftCode, otHrs]);
          }
        }

        // Recompute actualOt for this employee
        await recomputeEmployeeOt(emp.id, emp.deptId || deptId);
      }

      const updatedEmps = await queryD1("SELECT * FROM employees");
      res.json({ success: true, message: "บันทึกตารางกะสำเร็จ", employees: updatedEmps.map((e: any) => ({ ...e, shifts: JSON.parse(e.shifts || "[]") })) });
    } else {
      // Offline
      appState.employees = appState.employees.map(emp => {
        const updated = employees.find((e: any) => e.id === emp.id);
        if (updated) {
          const shifts: string[] = updated.shifts || [];
          const totalOt = shifts.reduce((s, code) => s + getShiftOt(code), 0);
          const otPct = Math.round((totalOt / emp.targetOt) * 100);
          return { ...emp, shifts, actualOt: totalOt, otPct, status: totalOt > emp.targetOt ? "Warning" : "On Track" };
        }
        return emp;
      });
      saveLocalDb();
      res.json({ success: true, message: "บันทึกตารางกะสำเร็จ", employees: appState.employees });
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ============================================================
// OT Daily Records
// ============================================================
app.get("/api/ot-records", async (req, res) => {
  const { year, month, deptId } = req.query;
  try {
    if (isD1Enabled()) {
      let sql = "SELECT * FROM ot_daily_records WHERE 1=1";
      const params: any[] = [];
      if (year)   { sql += " AND year = ?";   params.push(Number(year)); }
      if (month)  { sql += " AND month = ?";  params.push(Number(month)); }
      if (deptId && deptId !== "all") { sql += " AND deptId = ?"; params.push(deptId); }
      sql += " ORDER BY date DESC, employeeId";
      const rows = await queryD1(sql, params);
      res.json(rows);
    } else {
      // Offline: generate from employee shifts
      const rows: any[] = [];
      for (const emp of appState.employees) {
        if (deptId && deptId !== "all" && emp.deptId !== deptId) continue;
        const shifts: string[] = emp.shifts || [];
        const nowDate = new Date();
        const y = Number(year) || nowDate.getFullYear();
        const m = Number(month) || (nowDate.getMonth() + 1);
        shifts.forEach((code, idx) => {
          const otHrs = getShiftOt(code);
          if (otHrs > 0) {
            rows.push({
              id: `OTD-${emp.id}-${y}-${m}-${idx + 1}`,
              year: y, month: m,
              date: `${y}-${String(m).padStart(2,"0")}-${String(idx+1).padStart(2,"0")}`,
              employeeId: emp.id, employeeName: emp.name,
              deptId: emp.deptId, shiftCode: code, otHours: otHrs, note: ""
            });
          }
        });
      }
      res.json(rows.sort((a, b) => b.date.localeCompare(a.date)));
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.delete("/api/delete-ot-record/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (isD1Enabled()) {
      await queryD1("DELETE FROM ot_daily_records WHERE id = ?", [id]);
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ============================================================
// Employees
// ============================================================
app.post("/api/add-employee", async (req, res) => {
  try {
    const { id, name, deptId, role, groupName, targetOt } = req.body;
    const empId       = id        || "EMP-" + Date.now();
    const empName     = name      || "พนักงานใหม่";
    const empDeptId   = deptId    || "inter2";
    const empRole     = role      || "Operator";
    const empTargetOt = Number(targetOt) || 48;
    const empGroupName = groupName || "";
    const empShifts   = [] as string[];

    if (isD1Enabled()) {
      await queryD1(`INSERT INTO employees (id, name, deptId, role, targetOt, actualOt, otPct, status, groupName, shifts)
        VALUES (?, ?, ?, ?, ?, 0, 0, 'On Track', ?, ?)`,
        [empId, empName, empDeptId, empRole, empTargetOt, empGroupName, JSON.stringify(empShifts)]);
    } else {
      appState.employees.push({ id: empId, name: empName, deptId: empDeptId, role: empRole, targetOt: empTargetOt, actualOt: 0, otPct: 0, status: "On Track", groupName: empGroupName, shifts: empShifts });
      saveLocalDb();
    }
    res.json({ success: true, employee: { id: empId, name: empName, deptId: empDeptId, role: empRole, targetOt: empTargetOt } });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post("/api/edit-employee", async (req, res) => {
  try {
    const { id, name, deptId, role, groupName, targetOt } = req.body;
    if (!id) return res.status(400).json({ error: "ไม่ระบุรหัสพนักงาน" });
    const newTargetOt = Number(targetOt) || 48;

    if (isD1Enabled()) {
      await queryD1(`UPDATE employees SET name = ?, deptId = ?, role = ?, groupName = ?, targetOt = ?,
        otPct = ROUND((actualOt / ?) * 100), status = CASE WHEN actualOt > ? THEN 'Warning' ELSE 'On Track' END WHERE id = ?`,
        [name, deptId, role, groupName, newTargetOt, newTargetOt, newTargetOt, id]);
    } else {
      const idx = appState.employees.findIndex(e => e.id === id);
      if (idx !== -1) {
        const emp = appState.employees[idx];
        emp.name = name || emp.name;
        emp.deptId = deptId || emp.deptId;
        emp.role = role || emp.role;
        emp.groupName = groupName || emp.groupName;
        emp.targetOt = newTargetOt;
        emp.otPct = Math.round((emp.actualOt / emp.targetOt) * 100);
        emp.status = emp.actualOt > emp.targetOt ? "Warning" : "On Track";
      }
      saveLocalDb();
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post("/api/delete-employee", async (req, res) => {
  const { id, role } = req.body;
  if (!id) return res.status(400).json({ error: "ไม่ระบุรหัสพนักงาน" });
  const isHrOrAdmin = ["HR", "HR Section Manager", "ผู้ดูแลระบบ"].includes(role || "");
  if (!isHrOrAdmin) {
    return res.status(403).json({ error: "ไม่มีสิทธิ์ในการลบพนักงาน" });
  }
  try {
    if (isD1Enabled()) {
      await queryD1("DELETE FROM employees WHERE id = ?", [id]);
      await queryD1("DELETE FROM ot_daily_records WHERE employeeId = ?", [id]);
    } else {
      appState.employees = appState.employees.filter(e => e.id !== id);
      saveLocalDb();
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ============================================================
// Update Dept Manager info
// ============================================================
app.post("/api/update-dept-manager", async (req, res) => {
  const { deptId, manager, managerRole, managerImg } = req.body;
  try {
    if (isD1Enabled()) {
      await queryD1("UPDATE departments SET manager = ?, managerRole = ?, managerImg = ? WHERE id = ?",
        [manager, managerRole, managerImg, deptId]);
    } else {
      const dept = appState.departments.find(d => d.id === deptId);
      if (dept) { dept.manager = manager; (dept as any).managerRole = managerRole; (dept as any).managerImg = managerImg; }
      saveLocalDb();
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ============================================================
// Clear all employee & OT data and reset/seed departments and accounts
// ============================================================
app.post("/api/clear-mock-data", async (req, res) => {
  const { role } = req.body;
  const isHrOrAdmin = ["HR", "HR Section Manager", "ผู้ดูแลระบบ"].includes(role || "");
  if (!isHrOrAdmin) {
    return res.status(403).json({ error: "ไม่มีสิทธิ์ในการล้างข้อมูลฐานข้อมูล" });
  }
  try {
    if (isD1Enabled()) {
      await queryD1("DELETE FROM employees");
      await queryD1("DELETE FROM ot_daily_records");
      await queryD1("DELETE FROM departments");
      await queryD1("DELETE FROM accounts");

      // Seed departments
      for (const d of REAL_DEPARTMENTS) {
        await queryD1(`INSERT INTO departments (id, name, nameTh, manager, managerRole, managerImg, employeesCount, otHours, budgetUsed, budgetUtilization, status, icon)
          VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 'On Track', ?)`,
          [d.id, d.name, d.nameTh, d.manager, d.managerRole, d.managerImg, d.icon]);
      }

      // Seed accounts
      for (const acc of appAccounts) {
        await queryD1(`INSERT INTO accounts (username, password, name, role, deptId, avatar) VALUES (?, ?, ?, ?, ?, ?)`,
          [acc.username, acc.password, acc.name, acc.role, acc.deptId, acc.avatar]);
      }
    } else {
      appState.employees = [];
      appState.departments = REAL_DEPARTMENTS.map(d => ({ ...d, employeesCount: 0, otHours: 0, budgetUsed: 0, budgetUtilization: 0, status: "On Track" }));
      appAccounts = [
        { username: "admin",      password: "admin123",       name: "ผู้ดูแลระบบ",           role: "ผู้ดูแลระบบ",        deptId: "all", avatar: "" },
        { username: "hr",         password: "hr1234",         name: "HR Manager",             role: "HR",                 deptId: "all", avatar: "" },
        { username: "hr_sec",     password: "hrsec1234",      name: "HR Section Manager",     role: "HR Section Manager", deptId: "all", avatar: "" },
        { username: "op_dir",     password: "opdir1234",      name: "Operation Director",     role: "Operation Dir",      deptId: "all", avatar: "" },
        { username: "op_dept",    password: "opdept1234",     name: "Operation Department",   role: "Operation Depart",   deptId: "all", avatar: "" },
        { username: "inter2_mgr", password: "i2mgr1234",      name: "Section Manager INTER2", role: "Section Manager",    deptId: "inter2", avatar: "" },
        { username: "inter3_mgr", password: "i3mgr1234",      name: "Section Manager INTER3", role: "Section Manager",    deptId: "inter3", avatar: "" },
        { username: "inter5_mgr", password: "i5mgr1234",      name: "Section Manager INTER5", role: "Section Manager",    deptId: "inter5", avatar: "" },
        { username: "inter7_mgr", password: "i7mgr1234",      name: "Section Manager INTER7", role: "Section Manager",    deptId: "inter7", avatar: "" },
        { username: "heavy_mgr",  password: "hvmgr1234",      name: "Section Manager Heavy",  role: "Section Manager",    deptId: "heavy",  avatar: "" },
        { username: "ecc_mgr",    password: "eccmgr1234",     name: "Section Manager ECC",    role: "Section Manager",    deptId: "ecc",    avatar: "" },
      ];
      saveLocalDb();
    }
    res.json({ success: true, message: "รีเซ็ตฐานข้อมูลเรียบร้อยและเริ่มระบบด้วยแผนกจริง 6 แผนกแล้ว" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// Gemini AI Audit Report
// ============================================================
app.post("/api/audit-report", async (req, res) => {
  try {
    const ai = getGeminiClient();
    let employeesData: any[] = [];
    let deptsData: any[] = [];

    if (isD1Enabled()) {
      const emps = await queryD1("SELECT * FROM employees");
      employeesData = emps.map((e: any) => ({ ...e, shifts: JSON.parse(e.shifts || "[]") }));
      deptsData = await queryD1("SELECT * FROM departments");
    } else {
      employeesData = appState.employees;
      deptsData = appState.departments;
    }

    if (!ai) {
      return res.json({ report: `### 🤖 ไม่พบ GEMINI_API_KEY\nกรุณาตั้งค่า GEMINI_API_KEY ใน environment variables` });
    }

    const formattedEmployees = employeesData.map(e =>
      `- ${e.name} (${e.id}) [${e.role}] แผนก: ${e.deptId}: OT จริง = ${e.actualOt} ชม., เป้าหมาย = ${e.targetOt} ชม., สถานะ = ${e.status}`
    ).join("\n");

    const formattedDepts = deptsData.map(d =>
      `- ${d.nameTh || d.name}: OT รวม = ${d.otHours} ชม., งบ = ${d.budgetUsed} บาท, ใช้งบ = ${d.budgetUtilization}%, สถานะ = ${d.status}`
    ).join("\n");

    const prompt = `คุณคือผู้เชี่ยวชาญด้าน HR และการจัดการกะทำงานโรงงานอุตสาหกรรม
ข้อมูล OT ของบริษัท:

[แผนก]
${formattedDepts}

[พนักงาน]
${formattedEmployees}

กรุณาวิเคราะห์และเขียนรายงาน OT Audit เป็นภาษาไทย ครอบคลุม:
1. ความเสี่ยงพนักงาน OT เกินขีดจำกัด
2. วิเคราะห์งบประมาณรายแผนก
3. ข้อเสนอแนะการจัดกะใหม่
รูปแบบ Markdown สวยงาม ใช้ emoji เหมาะสม`;

    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    res.json({ report: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// Vite / Static serve
// ============================================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  await initD1Database();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
