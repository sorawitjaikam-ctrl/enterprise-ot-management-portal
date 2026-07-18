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

const isD1Enabled = () =>
  !!(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_DATABASE_ID);

// Intercept write requests if Cloudflare D1 is not enabled
app.use((req, res, next) => {
  if (!isD1Enabled() && ["POST", "PUT", "DELETE"].includes(req.method) && !req.path.startsWith("/api/login") && !req.path.startsWith("/api/logout")) {
    return res.status(403).json({
      error: "ไม่สามารถทำรายการได้ เนื่องจากเซิร์ฟเวอร์ไม่ได้เชื่อมต่อกับ Cloudflare D1 Database (กรุณาเชื่อมต่อฐานข้อมูลก่อน)"
    });
  }
  next();
});

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

const FULL_ACCESS_ROLES = ["HR", "HR Section Manager", "Operation Dir", "Operation Depart", "ผู้ดูแลระบบ"];
const hasFullAccess = (role: string) => FULL_ACCESS_ROLES.includes(role);

// Default OT budget config
const DEFAULT_OT_RATE    = 300;    // บาท/ชั่วโมง
const DEFAULT_BUDGET_MAX = 150000; // บาทต่อแผนกต่อเดือน

// ============================================================
// Initial in-memory state (offline mode)
// ============================================================
let appState = {
  departments: REAL_DEPARTMENTS.map(d => ({ ...d, employeesCount: 0, otHours: 0, budgetUsed: 0, budgetUtilization: 0, status: "On Track" })),
  employees: [] as any[],
  shiftConfig: {
    pattern: "4-on-2-off",
    currentMonth: new Date().toISOString().substring(0, 7),
    currentDept: "inter2"
  },
  otTrendData: { months: [] as string[], lastYear: [] as number[], currentYear: [] as number[] },
  leaveRecords: [] as any[]
};

let appAccounts: any[] = [
  { username: "admin",      password: "admin123",       name: "ผู้ดูแลระบบ",           role: "ผู้ดูแลระบบ",        deptId: "all", avatar: "", canBackup: 1 },
  { username: "hr",         password: "hr1234",         name: "HR Manager",             role: "HR",                 deptId: "all", avatar: "", canBackup: 1 },
  { username: "hr_sec",     password: "hrsec1234",      name: "HR Section Manager",     role: "HR Section Manager", deptId: "all", avatar: "", canBackup: 1 },
  { username: "op_dir",     password: "opdir1234",      name: "Operation Director",     role: "Operation Dir",      deptId: "all", avatar: "", canBackup: 0 },
  { username: "op_dept",    password: "opdept1234",     name: "Operation Department",   role: "Operation Depart",   deptId: "all", avatar: "", canBackup: 0 },
  { username: "inter2_mgr", password: "i2mgr1234",      name: "Section Manager INTER2", role: "Section Manager",    deptId: "inter2", avatar: "", canBackup: 0 },
  { username: "inter3_mgr", password: "i3mgr1234",      name: "Section Manager INTER3", role: "Section Manager",    deptId: "inter3", avatar: "", canBackup: 0 },
  { username: "inter5_mgr", password: "i5mgr1234",      name: "Section Manager INTER5", role: "Section Manager",    deptId: "inter5", avatar: "", canBackup: 0 },
  { username: "inter7_mgr", password: "i7mgr1234",      name: "Section Manager INTER7", role: "Section Manager",    deptId: "inter7", avatar: "", canBackup: 0 },
  { username: "heavy_mgr",  password: "hvmgr1234",      name: "Section Manager Heavy",  role: "Section Manager",    deptId: "heavy",  avatar: "", canBackup: 0 },
  { username: "ecc_mgr",    password: "eccmgr1234",     name: "Section Manager ECC",    role: "Section Manager",    deptId: "ecc",    avatar: "", canBackup: 0 },
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
// Audit log helper
// ============================================================
const writeAuditLog = async (username: string, action: string, targetType: string, targetId: string, detail: any) => {
  try {
    if (isD1Enabled()) {
      const id = `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await queryD1(
        `INSERT INTO audit_logs (id, timestamp, username, action, targetType, targetId, detail) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, new Date().toISOString(), username || "system", action, targetType, targetId, JSON.stringify(detail)]
      );
    }
  } catch (e) { /* silent — don't break main flow */ }
};

// ============================================================
// Helper: compute employee OT from ot_daily_records (D1)
// ============================================================
const computeEmployeeOtStats = async (employeeId: string, targetOt: number) => {
  const rows = await queryD1("SELECT COALESCE(SUM(otHours), 0) as total FROM ot_daily_records WHERE employeeId = ?", [employeeId]);
  const actualOt = Math.round((rows[0]?.total || 0) * 10) / 10;
  const otPct    = targetOt > 0 ? Math.round((actualOt / targetOt) * 100) : 0;
  const status   = actualOt > targetOt ? "Warning" : "On Track";
  return { actualOt, otPct, status };
};

// Helper: enrich employees array with computed OT stats (D1)
const enrichEmployeesWithOt = async (employees: any[]): Promise<any[]> => {
  return Promise.all(employees.map(async (e: any) => {
    const { actualOt, otPct, status } = await computeEmployeeOtStats(e.id, e.targetOt || 48);
    return { ...e, shifts: JSON.parse(e.shifts || "[]"), actualOt, otPct, status };
  }));
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
    // Departments (no computed fields)
    await queryD1(`CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY, name TEXT, nameTh TEXT,
      manager TEXT, managerRole TEXT, managerImg TEXT, icon TEXT
    )`);

    // Employees (expanded schema for employee details)
    await queryD1(`CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY, name TEXT, deptId TEXT, role TEXT,
      targetOt REAL DEFAULT 48, groupName TEXT, shifts TEXT DEFAULT '[]',
      prefix TEXT, firstName TEXT, lastName TEXT, nickname TEXT,
      division TEXT, salary REAL DEFAULT 0, birthday TEXT,
      age INTEGER DEFAULT 0, calculatedAge INTEGER DEFAULT 0,
      startDate TEXT, tenure TEXT, probationDate TEXT, calendarType TEXT
    )`);

    // Migration: add new columns if they do not exist
    const newEmpCols = [
      { name: "prefix", type: "TEXT" },
      { name: "firstName", type: "TEXT" },
      { name: "lastName", type: "TEXT" },
      { name: "nickname", type: "TEXT" },
      { name: "division", type: "TEXT" },
      { name: "salary", type: "REAL DEFAULT 0" },
      { name: "birthday", type: "TEXT" },
      { name: "age", type: "INTEGER DEFAULT 0" },
      { name: "calculatedAge", type: "INTEGER DEFAULT 0" },
      { name: "startDate", type: "TEXT" },
      { name: "tenure", type: "TEXT" },
      { name: "probationDate", type: "TEXT" },
      { name: "calendarType", type: "TEXT" }
    ];
    for (const col of newEmpCols) {
      try {
        await queryD1(`ALTER TABLE employees ADD COLUMN ${col.name} ${col.type}`);
      } catch (_) { /* column already exists */ }
    }

    // Migration: drop legacy computed columns if they still exist
    for (const col of ["actualOt", "otPct", "status"]) {
      try { await queryD1(`ALTER TABLE employees DROP COLUMN ${col}`); } catch (_) { /* already gone */ }
    }
    for (const col of ["employeesCount", "otHours", "budgetUsed", "budgetUtilization", "status"]) {
      try { await queryD1(`ALTER TABLE departments DROP COLUMN ${col}`); } catch (_) { /* already gone */ }
    }

    // Check if ot_daily_records is outdated (missing month column)
    try {
      await queryD1("SELECT month FROM ot_daily_records LIMIT 1");
    } catch (e) {
      console.log("Table ot_daily_records does not have 'month' column. Recreating...");
      await queryD1("DROP TABLE IF EXISTS ot_daily_records");
    }

    // OT Daily Records
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

    // Dept Budgets (NEW) — งบประมาณ OT รายแผนกรายเดือน (month=0 หมายถึงตั้งค่าทั้งปี)
    await queryD1(`CREATE TABLE IF NOT EXISTS dept_budgets (
      id TEXT PRIMARY KEY,
      deptId TEXT NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL DEFAULT 0,
      budgetMax REAL DEFAULT 150000,
      otRatePerHour REAL DEFAULT 300,
      UNIQUE(deptId, year, month)
    )`);

    // Audit Logs (NEW) — ประวัติการแก้ไข
    await queryD1(`CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      username TEXT NOT NULL,
      action TEXT NOT NULL,
      targetType TEXT,
      targetId TEXT,
      detail TEXT
    )`);



    // Leave Records — บันทึกวันลา
    await queryD1(`CREATE TABLE IF NOT EXISTS leave_records (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      employeeName TEXT,
      deptId TEXT,
      date TEXT NOT NULL,
      leaveType TEXT DEFAULT 'vacation',
      note TEXT
    )`);

    // Shift config
    await queryD1(`CREATE TABLE IF NOT EXISTS shift_config (
      pattern TEXT, currentMonth TEXT, currentDept TEXT
    )`);

    // Accounts
    await queryD1(`CREATE TABLE IF NOT EXISTS accounts (
      username TEXT PRIMARY KEY, password TEXT, name TEXT,
      role TEXT, deptId TEXT, avatar TEXT, canBackup INTEGER DEFAULT 0
    )`);

    // Add canBackup if missing
    try { await queryD1("SELECT canBackup FROM accounts LIMIT 1"); }
    catch (e) {
      try { await queryD1("ALTER TABLE accounts ADD COLUMN canBackup INTEGER DEFAULT 0"); } catch (_) {}
    }

    // Seed departments if empty
    const depts = await queryD1("SELECT id FROM departments LIMIT 1");
    if (depts.length === 0) {
      console.log("Seeding real departments and default accounts...");
      for (const d of REAL_DEPARTMENTS) {
        await queryD1(
          `INSERT INTO departments (id, name, nameTh, manager, managerRole, managerImg, icon) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [d.id, d.name, d.nameTh, d.manager, d.managerRole, d.managerImg, d.icon]
        );
      }

      const existingAccounts = await queryD1("SELECT username FROM accounts LIMIT 1");
      if (existingAccounts.length === 0) {
        for (const acc of appAccounts) {
          await queryD1(
            `INSERT INTO accounts (username, password, name, role, deptId, avatar, canBackup) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [acc.username, acc.password, acc.name, acc.role, acc.deptId, acc.avatar, acc.canBackup ? 1 : 0]
          );
        }
      }

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
      const rows = await queryD1("SELECT username, name, role, deptId, avatar, canBackup FROM accounts WHERE username = ?", [username]);
      if (rows.length > 0) {
        res.json({ success: true, user: rows[0] });
      } else {
        res.status(404).json({ error: "ไม่พบข้อมูลบัญชีผู้ใช้" });
      }
    } else {
      const idx = appAccounts.findIndex(a => a.username === username);
      if (idx !== -1) {
        appAccounts[idx].name = name;
        appAccounts[idx].avatar = avatar;
        if (password) appAccounts[idx].password = password;
        saveLocalDb();
        const { password: _, ...userWithoutPassword } = appAccounts[idx];
        res.json({ success: true, user: userWithoutPassword });
      } else {
        res.status(404).json({ error: "ไม่พบบัญชีผู้ใช้งาน" });
      }
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// --- Accounts list ---
app.get("/api/accounts", async (req, res) => {
  try {
    if (isD1Enabled()) {
      const rows = await queryD1("SELECT username, name, role, deptId, avatar, canBackup FROM accounts");
      res.json(rows);
    } else {
      res.json(appAccounts.map(({ password: _, ...rest }) => rest));
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// --- Add account ---
app.post("/api/add-account", async (req, res) => {
  const { username, password, name, role, deptId, avatar, canBackup } = req.body;
  if (!username || !password) return res.status(400).json({ error: "กรุณากรอก username และ password" });
  try {
    if (isD1Enabled()) {
      await queryD1("INSERT INTO accounts (username, password, name, role, deptId, avatar, canBackup) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [username, password, name || username, role || "Section Manager", deptId || "all", avatar || "", canBackup ? 1 : 0]);
      await writeAuditLog(username, "add_account", "account", username, { name, role, deptId });
    } else {
      if (appAccounts.find(a => a.username === username)) return res.status(409).json({ error: "Username นี้มีอยู่แล้ว" });
      appAccounts.push({ username, password, name: name || username, role: role || "Section Manager", deptId: deptId || "all", avatar: avatar || "", canBackup: canBackup ? 1 : 0 });
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

// --- Edit account ---
app.post("/api/edit-account", async (req, res) => {
  const { originalUsername, username, name, role, deptId, avatar, canBackup } = req.body;
  if (!originalUsername) return res.status(400).json({ error: "ต้องระบุ originalUsername" });
  try {
    if (isD1Enabled()) {
      if (originalUsername !== username) {
        await queryD1("UPDATE accounts SET username = ?, name = ?, role = ?, deptId = ?, avatar = ?, canBackup = ? WHERE username = ?",
          [username, name, role, deptId, avatar, canBackup ? 1 : 0, originalUsername]);
      } else {
        await queryD1("UPDATE accounts SET name = ?, role = ?, deptId = ?, avatar = ?, canBackup = ? WHERE username = ?",
          [name, role, deptId, avatar, canBackup ? 1 : 0, originalUsername]);
      }
      await writeAuditLog(originalUsername, "edit_account", "account", username, { name, role, deptId });
    } else {
      const idx = appAccounts.findIndex(a => a.username === originalUsername);
      if (idx !== -1) {
        appAccounts[idx].username = username || appAccounts[idx].username;
        appAccounts[idx].name = name;
        appAccounts[idx].role = role;
        appAccounts[idx].deptId = deptId;
        appAccounts[idx].avatar = avatar;
        appAccounts[idx].canBackup = canBackup ? 1 : 0;
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
  if (!isHrOrAdmin) return res.status(403).json({ error: "ไม่มีสิทธิ์ในการลบบัญชีผู้ใช้" });
  try {
    if (isD1Enabled()) {
      await queryD1("DELETE FROM accounts WHERE username = ?", [targetUsername]);
      await writeAuditLog(targetUsername, "delete_account", "account", targetUsername, {});
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
      await writeAuditLog(targetUsername, "reset_password", "account", targetUsername, {});
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
      const departments    = await queryD1("SELECT * FROM departments");
      const employeesRaw   = await queryD1("SELECT * FROM employees");
      const shiftConfigRaw = await queryD1("SELECT * FROM shift_config LIMIT 1");

      // Compute OT stats for each employee from ot_daily_records
      const employees = await enrichEmployeesWithOt(employeesRaw);

      // Fetch dept budgets for current month
      const budgetRows = await queryD1(
        "SELECT deptId, budgetMax, otRatePerHour FROM dept_budgets WHERE year = ? AND (month = ? OR month IS NULL)",
        [thisYear, thisMonth]
      );
      const budgetMap: Record<string, { budgetMax: number; otRate: number }> = {};
      budgetRows.forEach((b: any) => {
        budgetMap[b.deptId] = { budgetMax: b.budgetMax || DEFAULT_BUDGET_MAX, otRate: b.otRatePerHour || DEFAULT_OT_RATE };
      });

      // Compute dept stats dynamically
      const enrichedDepartments = departments.map((dept: any) => {
        const deptEmp        = employees.filter((e: any) => e.deptId === dept.id);
        const employeesCount = deptEmp.length;
        const otHours        = Math.round(deptEmp.reduce((s: number, e: any) => s + (e.actualOt || 0), 0) * 10) / 10;
        const cfg            = budgetMap[dept.id] || { budgetMax: DEFAULT_BUDGET_MAX, otRate: DEFAULT_OT_RATE };
        const budgetUsed     = Math.round(otHours * cfg.otRate);
        const budgetUtilization = Math.min(100, Math.round((budgetUsed / cfg.budgetMax) * 100));
        const status         = budgetUtilization > 95 ? "Warning" : "On Track";
        return { ...dept, employeesCount, otHours, budgetUsed, budgetMax: cfg.budgetMax, otRatePerHour: cfg.otRate, budgetUtilization, status };
      });

      // OT trend — 6 เดือนล่าสุดย้อนหลัง (rolling window)
      const MONTH_LABELS_TH = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

      // Build last 6 months (month=1-12, year) from now going back
      const last6: { year: number; month: number; label: string }[] = [];
      for (let i = 5; i >= 0; i--) {
        let m = thisMonth - i;
        let y = thisYear;
        if (m <= 0) { m += 12; y -= 1; }
        last6.push({ year: y, month: m, label: MONTH_LABELS_TH[m - 1] });
      }

      // Query OT sums for those months (current year and previous year same period)
      const monthNumbers = last6.map(x => x.month);
      const prevYearNumbers = last6.map(x => ({ year: x.year - 1, month: x.month }));

      // Current period
      const trendCur = await queryD1(
        `SELECT year, month, SUM(otHours) as total FROM ot_daily_records
         WHERE (year = ? AND month IN (${monthNumbers.join(",")}))
         OR    (year = ? AND month IN (${monthNumbers.join(",")}))
         GROUP BY year, month`,
        [thisYear, thisYear - 1]
      );
      const trendMap: Record<string, number> = {};
      trendCur.forEach((r: any) => { trendMap[`${r.year}-${r.month}`] = Number(r.total) || 0; });

      const otTrendData = {
        months:      last6.map(x => x.label),
        currentYear: last6.map(x => Math.round((trendMap[`${x.year}-${x.month}`] || 0) * 10) / 10),
        lastYear:    last6.map(x => Math.round((trendMap[`${x.year - 1}-${x.month}`] || 0) * 10) / 10),
        meta:        last6.map(x => ({ year: x.year, month: x.month })),
      };

      const shiftConfig = shiftConfigRaw[0] || appState.shiftConfig;
      res.json({ departments: enrichedDepartments, employees, shiftConfig, otTrendData, requests: [], d1Connected: true });

    } else {
      // Offline mode — do NOT display mock data (return empty)
      const emptyDepts = appState.departments.map(dept => ({
        ...dept,
        employeesCount: 0,
        otHours: 0,
        budgetUsed: 0,
        budgetUtilization: 0,
        status: "On Track" as const
      }));

      res.json({
        departments: emptyDepts,
        employees: [],
        shiftConfig: appState.shiftConfig,
        otTrendData: { months: [], lastYear: [], currentYear: [] },
        leaveRecords: [],
        requests: [],
        d1Connected: false
      });
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
        const updates: string[] = [];
        const params: any[] = [];
        if (currentMonth !== undefined) { updates.push("currentMonth = ?"); params.push(currentMonth); }
        if (pattern !== undefined) { updates.push("pattern = ?"); params.push(pattern); }
        if (currentDept !== undefined) { updates.push("currentDept = ?"); params.push(currentDept); }
        if (updates.length > 0) await queryD1(`UPDATE shift_config SET ${updates.join(", ")}`, params);
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
    const { employees, year, month, username } = req.body;
    if (!Array.isArray(employees)) return res.status(400).json({ error: "Invalid payload" });

    const now = new Date();
    const recordYear  = Number(year)  || now.getFullYear();
    const recordMonth = Number(month) || (now.getMonth() + 1);

    if (isD1Enabled()) {
      for (const emp of employees) {
        await queryD1("UPDATE employees SET shifts = ? WHERE id = ?", [JSON.stringify(emp.shifts || []), emp.id]);

        await queryD1("DELETE FROM ot_daily_records WHERE employeeId = ? AND year = ? AND month = ?",
          [emp.id, recordYear, recordMonth]);

        const empRows = await queryD1("SELECT name, deptId FROM employees WHERE id = ? LIMIT 1", [emp.id]);
        const empName = empRows[0]?.name || emp.name || "";
        const deptId  = empRows[0]?.deptId || emp.deptId || "";

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
      }

      // Return employees with computed OT (from ot_daily_records)
      const updatedRaw = await queryD1("SELECT * FROM employees");
      const updatedEmps = await enrichEmployeesWithOt(updatedRaw);
      await writeAuditLog(username || "system", "save_shifts", "shift", `${recordYear}-${recordMonth}`, { employeeCount: employees.length });
      res.json({ success: true, message: "บันทึกตารางกะสำเร็จ", employees: updatedEmps });

    } else {
      // Offline mode
      appState.employees = appState.employees.map(emp => {
        const updated = employees.find((e: any) => e.id === emp.id);
        if (updated) {
          const shifts: string[] = updated.shifts || [];
          const actualOt = Math.round(shifts.reduce((s, code) => s + getShiftOt(code), 0) * 10) / 10;
          const otPct    = Math.round((actualOt / emp.targetOt) * 100);
          return { ...emp, shifts, actualOt, otPct, status: actualOt > emp.targetOt ? "Warning" : "On Track" };
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
      res.json([]);
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
    const {
      id, name, deptId, role, groupName, targetOt,
      prefix, firstName, lastName, nickname, division, salary, birthday, age, calculatedAge, startDate, tenure, probationDate, calendarType
    } = req.body;
    
    const empId = id || "EMP-" + Date.now();
    const empPrefix = prefix || "";
    const empFirstName = firstName || "พนักงานใหม่";
    const empLastName = lastName || "";
    const empNickname = nickname || "";
    const empName = name || (empFirstName + (empLastName ? " " + empLastName : ""));
    const empDeptId = deptId || "inter2";
    const empRole = role || "Operator";
    const empTargetOt = Number(targetOt) || 48;
    const empGroupName = groupName || "";
    const empDivision = division || "";
    const empSalary = Number(salary) || 0;
    const empBirthday = birthday || "";
    const empAge = Number(age) || 0;
    const empCalculatedAge = Number(calculatedAge) || 0;
    const empStartDate = startDate || "";
    const empTenure = tenure || "";
    const empProbationDate = probationDate || "";
    const empCalendarType = calendarType || "";

    if (isD1Enabled()) {
      await queryD1(
        `INSERT INTO employees (
          id, name, deptId, role, targetOt, groupName, shifts,
          prefix, firstName, lastName, nickname, division, salary, birthday, age, calculatedAge, startDate, tenure, probationDate, calendarType
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          empId, empName, empDeptId, empRole, empTargetOt, empGroupName, "[]",
          empPrefix, empFirstName, empLastName, empNickname, empDivision, empSalary, empBirthday, empAge, empCalculatedAge, empStartDate, empTenure, empProbationDate, empCalendarType
        ]
      );
      await writeAuditLog(req.body.username || "system", "add_employee", "employee", empId, { name: empName, deptId: empDeptId });
    } else {
      appState.employees.push({
        id: empId, name: empName, deptId: empDeptId, role: empRole, targetOt: empTargetOt, groupName: empGroupName, shifts: [],
        prefix: empPrefix, firstName: empFirstName, lastName: empLastName, nickname: empNickname, division: empDivision,
        salary: empSalary, birthday: empBirthday, age: empAge, calculatedAge: empCalculatedAge, startDate: empStartDate,
        tenure: empTenure, probationDate: empProbationDate, calendarType: empCalendarType
      });
      saveLocalDb();
    }
    res.json({ success: true, employee: { id: empId, name: empName, deptId: empDeptId, role: empRole, targetOt: empTargetOt } });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post("/api/edit-employee", async (req, res) => {
  try {
    const {
      id, name, deptId, role, groupName, targetOt, username,
      prefix, firstName, lastName, nickname, division, salary, birthday, age, calculatedAge, startDate, tenure, probationDate, calendarType
    } = req.body;
    if (!id) return res.status(400).json({ error: "ไม่ระบุรหัสพนักงาน" });
    const newTargetOt = Number(targetOt) || 48;
    const empName = name || ((firstName || "") + (lastName ? " " + lastName : ""));

    if (isD1Enabled()) {
      await queryD1(
        `UPDATE employees SET 
          name = ?, deptId = ?, role = ?, groupName = ?, targetOt = ?,
          prefix = ?, firstName = ?, lastName = ?, nickname = ?, division = ?, salary = ?, birthday = ?, age = ?, calculatedAge = ?, startDate = ?, tenure = ?, probationDate = ?, calendarType = ?
         WHERE id = ?`,
        [
          empName, deptId, role, groupName, newTargetOt,
          prefix, firstName, lastName, nickname, division, Number(salary) || 0, birthday, Number(age) || 0, Number(calculatedAge) || 0, startDate, tenure, probationDate, calendarType,
          id
        ]
      );
      await writeAuditLog(username || "system", "edit_employee", "employee", id, { name: empName, deptId, role, targetOt: newTargetOt });
    } else {
      const idx = appState.employees.findIndex(e => e.id === id);
      if (idx !== -1) {
        const emp = appState.employees[idx];
        emp.name = empName;
        emp.deptId = deptId || emp.deptId;
        emp.role = role || emp.role;
        emp.groupName = groupName ?? emp.groupName;
        emp.targetOt = newTargetOt;
        emp.prefix = prefix ?? emp.prefix;
        emp.firstName = firstName ?? emp.firstName;
        emp.lastName = lastName ?? emp.lastName;
        emp.nickname = nickname ?? emp.nickname;
        emp.division = division ?? emp.division;
        emp.salary = Number(salary) || 0;
        emp.birthday = birthday ?? emp.birthday;
        emp.age = Number(age) || 0;
        emp.calculatedAge = Number(calculatedAge) || 0;
        emp.startDate = startDate ?? emp.startDate;
        emp.tenure = tenure ?? emp.tenure;
        emp.probationDate = probationDate ?? emp.probationDate;
        emp.calendarType = calendarType ?? emp.calendarType;
      }
      saveLocalDb();
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post("/api/delete-employee", async (req, res) => {
  const { id, role, username } = req.body;
  if (!id) return res.status(400).json({ error: "ไม่ระบุรหัสพนักงาน" });
  const isHrOrAdmin = ["HR", "HR Section Manager", "ผู้ดูแลระบบ"].includes(role || "");
  if (!isHrOrAdmin) return res.status(403).json({ error: "ไม่มีสิทธิ์ในการลบพนักงาน" });
  try {
    if (isD1Enabled()) {
      await queryD1("DELETE FROM employees WHERE id = ?", [id]);
      await queryD1("DELETE FROM ot_daily_records WHERE employeeId = ?", [id]);
      await queryD1("DELETE FROM leave_records WHERE employeeId = ?", [id]);
      await writeAuditLog(username || "system", "delete_employee", "employee", id, {});
    } else {
      appState.employees = appState.employees.filter(e => e.id !== id);
      saveLocalDb();
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// --- Export employees ---
app.post("/api/export-employees", async (req, res) => {
  const { username } = req.body;
  try {
    let isAllowed = false;
    if (isD1Enabled()) {
      const rows = await queryD1("SELECT role, canBackup FROM accounts WHERE username = ? LIMIT 1", [username]);
      if (rows.length > 0) {
        const user = rows[0];
        isAllowed = user.canBackup === 1 || ["HR", "HR Section Manager", "ผู้ดูแลระบบ"].includes(user.role);
      }
    } else {
      const user = appAccounts.find(a => a.username === username);
      if (user) isAllowed = user.canBackup === 1 || ["HR", "HR Section Manager", "ผู้ดูแลระบบ"].includes(user.role);
    }

    if (!isAllowed) return res.status(403).json({ error: "ไม่มีสิทธิ์ในการส่งออกข้อมูลพนักงาน" });

    let employees: any[] = [];
    if (isD1Enabled()) {
      const raw = await queryD1("SELECT * FROM employees");
      // Enrich with computed OT stats from ot_daily_records
      employees = await enrichEmployeesWithOt(raw);
      await writeAuditLog(username, "export_employees", "employees", "all", { count: employees.length });
    } else {
      employees = appState.employees.map(emp => {
        const shifts   = emp.shifts || [];
        const actualOt = Math.round(shifts.reduce((s: number, c: string) => s + getShiftOt(c), 0) * 10) / 10;
        const otPct    = emp.targetOt > 0 ? Math.round((actualOt / emp.targetOt) * 100) : 0;
        const status   = actualOt > emp.targetOt ? "Warning" : "On Track";
        return { ...emp, actualOt, otPct, status };
      });
    }
    res.json({ success: true, employees });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// --- Import employees ---
app.post("/api/import-employees", async (req, res) => {
  const { username, employees } = req.body;
  if (!Array.isArray(employees)) return res.status(400).json({ error: "รูปแบบข้อมูลพนักงานไม่ถูกต้อง" });
  try {
    let isAllowed = false;
    if (isD1Enabled()) {
      const rows = await queryD1("SELECT role, canBackup FROM accounts WHERE username = ? LIMIT 1", [username]);
      if (rows.length > 0) {
        const user = rows[0];
        isAllowed = user.canBackup === 1 || ["HR", "HR Section Manager", "ผู้ดูแลระบบ"].includes(user.role);
      }
    } else {
      const user = appAccounts.find(a => a.username === username);
      if (user) isAllowed = user.canBackup === 1 || ["HR", "HR Section Manager", "ผู้ดูแลระบบ"].includes(user.role);
    }

    if (!isAllowed) return res.status(403).json({ error: "ไม่มีสิทธิ์ในการนำเข้าข้อมูลพนักงาน" });

    if (isD1Enabled()) {
      await queryD1("DELETE FROM employees");
      await queryD1("DELETE FROM ot_daily_records");

      for (const emp of employees) {
        const shiftsStr = typeof emp.shifts === "string" ? emp.shifts : JSON.stringify(emp.shifts || []);
        const empName = emp.name || ((emp.firstName || "") + (emp.lastName ? " " + emp.lastName : ""));
        await queryD1(
          `INSERT INTO employees (
            id, name, deptId, role, targetOt, groupName, shifts,
            prefix, firstName, lastName, nickname, division, salary, birthday, age, calculatedAge, startDate, tenure, probationDate, calendarType
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            emp.id, empName, emp.deptId, emp.role, emp.targetOt ?? 48, emp.groupName ?? "", shiftsStr,
            emp.prefix ?? "", emp.firstName ?? "", emp.lastName ?? "", emp.nickname ?? "", emp.division ?? "", Number(emp.salary) || 0,
            emp.birthday ?? "", Number(emp.age) || 0, Number(emp.calculatedAge) || 0, emp.startDate ?? "", emp.tenure ?? "", emp.probationDate ?? "", emp.calendarType ?? ""
          ]
        );
      }
      await writeAuditLog(username, "import_employees", "employees", "all", { count: employees.length });
    } else {
      appState.employees = employees.map(emp => ({
        id: emp.id,
        name: emp.name || ((emp.firstName || "") + (emp.lastName ? " " + emp.lastName : "")),
        deptId: emp.deptId,
        role: emp.role,
        targetOt: emp.targetOt ?? 48,
        groupName: emp.groupName ?? "",
        shifts: Array.isArray(emp.shifts) ? emp.shifts : JSON.parse(emp.shifts || "[]"),
        prefix: emp.prefix ?? "",
        firstName: emp.firstName ?? "",
        lastName: emp.lastName ?? "",
        nickname: emp.nickname ?? "",
        division: emp.division ?? "",
        salary: Number(emp.salary) || 0,
        birthday: emp.birthday ?? "",
        age: Number(emp.age) || 0,
        calculatedAge: Number(emp.calculatedAge) || 0,
        startDate: emp.startDate ?? "",
        tenure: emp.tenure ?? "",
        probationDate: emp.probationDate ?? "",
        calendarType: emp.calendarType ?? ""
      }));
      saveLocalDb();
    }

    res.json({ success: true, message: "นำเข้าฐานข้อมูลพนักงานเสร็จสิ้น" });
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
// Dept Budgets (NEW)
// ============================================================
app.get("/api/dept-budgets", async (req, res) => {
  const { year } = req.query;
  try {
    if (isD1Enabled()) {
      const rows = await queryD1(
        "SELECT * FROM dept_budgets WHERE year = ? ORDER BY deptId, month",
        [Number(year) || new Date().getFullYear()]
      );
      res.json(rows);
    } else {
      res.json([]);
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post("/api/update-dept-budget", async (req, res) => {
  const { deptId, year, month, budgetMax, otRatePerHour, username } = req.body;
  if (!deptId || !year) return res.status(400).json({ error: "ต้องระบุ deptId และ year" });
  try {
    if (isD1Enabled()) {
      const id = `BUD-${deptId}-${year}-${month || "all"}`;
      await queryD1(
        `INSERT INTO dept_budgets (id, deptId, year, month, budgetMax, otRatePerHour)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(deptId, year, month) DO UPDATE SET
           budgetMax = excluded.budgetMax,
           otRatePerHour = excluded.otRatePerHour`,
        [id, deptId, year, month ?? 0, budgetMax ?? DEFAULT_BUDGET_MAX, otRatePerHour ?? DEFAULT_OT_RATE]
      );
      await writeAuditLog(username || "system", "update_dept_budget", "dept_budget", deptId, { year, month, budgetMax, otRatePerHour });
      res.json({ success: true });
    } else {
      res.json({ success: true, message: "offline mode — budget not persisted" });
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ============================================================
// Leave Records (NEW)
// ============================================================
app.get("/api/leave-records", async (req, res) => {
  const { employeeId, year, month, deptId } = req.query;
  try {
    if (isD1Enabled()) {
      let sql = "SELECT * FROM leave_records WHERE 1=1";
      const params: any[] = [];
      if (employeeId) { sql += " AND employeeId = ?"; params.push(employeeId); }
      if (deptId && deptId !== "all") { sql += " AND deptId = ?"; params.push(deptId); }
      if (year && month) {
        sql += " AND date LIKE ?";
        params.push(`${year}-${String(month).padStart(2,"0")}-%`);
      } else if (year) {
        sql += " AND date LIKE ?";
        params.push(`${year}-%`);
      }
      sql += " ORDER BY date DESC";
      res.json(await queryD1(sql, params));
    } else {
      res.json([]);
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post("/api/add-leave-record", async (req, res) => {
  const { employeeId, date, leaveType, note, username } = req.body;
  if (!employeeId || !date) return res.status(400).json({ error: "ต้องระบุ employeeId และ date" });
  try {
    if (isD1Enabled()) {
      const empRows = await queryD1("SELECT name, deptId FROM employees WHERE id = ? LIMIT 1", [employeeId]);
      const empName = empRows[0]?.name || "";
      const deptId  = empRows[0]?.deptId || "";
      const id = `LVR-${employeeId}-${date}`;
      await queryD1(
        `INSERT OR REPLACE INTO leave_records (id, employeeId, employeeName, deptId, date, leaveType, note) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, employeeId, empName, deptId, date, leaveType || "vacation", note || ""]
      );
      await writeAuditLog(username || "system", "add_leave", "leave_record", id, { employeeId, date, leaveType });
      res.json({ success: true });
    } else {
      const emp = appState.employees.find(e => e.id === employeeId);
      const empName = emp ? emp.name : "";
      const deptId = emp ? emp.deptId : "";
      const id = `LVR-${employeeId}-${date}`;
      const record = {
        id,
        employeeId,
        employeeName: empName,
        deptId,
        date,
        leaveType: leaveType || "vacation",
        note: note || ""
      };
      appState.leaveRecords = (appState.leaveRecords || []).filter(l => l.id !== id);
      appState.leaveRecords.push(record);
      saveLocalDb();
      res.json({ success: true });
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.delete("/api/delete-leave-record/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (isD1Enabled()) {
      await queryD1("DELETE FROM leave_records WHERE id = ?", [id]);
    } else {
      appState.leaveRecords = (appState.leaveRecords || []).filter(l => l.id !== id);
      saveLocalDb();
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ============================================================
// Audit Logs (NEW)
// ============================================================
app.get("/api/audit-logs", async (req, res) => {
  const { limit } = req.query;
  try {
    if (isD1Enabled()) {
      const rows = await queryD1(
        `SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?`,
        [Number(limit) || 100]
      );
      res.json(rows);
    } else {
      res.json([]);
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ============================================================
// Clear all data and reset
// ============================================================
app.post("/api/clear-mock-data", async (req, res) => {
  const { role } = req.body;
  const isHrOrAdmin = ["HR", "HR Section Manager", "ผู้ดูแลระบบ"].includes(role || "");
  if (!isHrOrAdmin) return res.status(403).json({ error: "ไม่มีสิทธิ์ในการล้างข้อมูลฐานข้อมูล" });
  try {
    if (isD1Enabled()) {
      await queryD1("DELETE FROM employees");
      await queryD1("DELETE FROM ot_daily_records");
      await queryD1("DELETE FROM leave_records");
      await queryD1("DELETE FROM departments");
      await queryD1("DELETE FROM accounts");
      for (const d of REAL_DEPARTMENTS) {
        await queryD1(
          `INSERT INTO departments (id, name, nameTh, manager, managerRole, managerImg, icon) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [d.id, d.name, d.nameTh, d.manager, d.managerRole, d.managerImg, d.icon]
        );
      }
      for (const acc of appAccounts) {
        await queryD1(`INSERT INTO accounts (username, password, name, role, deptId, avatar, canBackup) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [acc.username, acc.password, acc.name, acc.role, acc.deptId, acc.avatar, acc.canBackup ? 1 : 0]);
      }
      await writeAuditLog(req.body.username || "system", "clear_all_data", "system", "all", {});
    } else {
      appState.employees = [];
      appState.departments = REAL_DEPARTMENTS.map(d => ({ ...d, employeesCount: 0, otHours: 0, budgetUsed: 0, budgetUtilization: 0, status: "On Track" }));
      appAccounts = [
        { username: "admin",      password: "admin123",  name: "ผู้ดูแลระบบ",           role: "ผู้ดูแลระบบ",        deptId: "all",    avatar: "", canBackup: 1 },
        { username: "hr",         password: "hr1234",    name: "HR Manager",             role: "HR",                 deptId: "all",    avatar: "", canBackup: 1 },
        { username: "hr_sec",     password: "hrsec1234", name: "HR Section Manager",     role: "HR Section Manager", deptId: "all",    avatar: "", canBackup: 1 },
        { username: "op_dir",     password: "opdir1234", name: "Operation Director",     role: "Operation Dir",      deptId: "all",    avatar: "", canBackup: 0 },
        { username: "op_dept",    password: "opdept1234",name: "Operation Department",   role: "Operation Depart",   deptId: "all",    avatar: "", canBackup: 0 },
        { username: "inter2_mgr", password: "i2mgr1234", name: "Section Manager INTER2", role: "Section Manager",    deptId: "inter2", avatar: "", canBackup: 0 },
        { username: "inter3_mgr", password: "i3mgr1234", name: "Section Manager INTER3", role: "Section Manager",    deptId: "inter3", avatar: "", canBackup: 0 },
        { username: "inter5_mgr", password: "i5mgr1234", name: "Section Manager INTER5", role: "Section Manager",    deptId: "inter5", avatar: "", canBackup: 0 },
        { username: "inter7_mgr", password: "i7mgr1234", name: "Section Manager INTER7", role: "Section Manager",    deptId: "inter7", avatar: "", canBackup: 0 },
        { username: "heavy_mgr",  password: "hvmgr1234", name: "Section Manager Heavy",  role: "Section Manager",    deptId: "heavy",  avatar: "", canBackup: 0 },
        { username: "ecc_mgr",    password: "eccmgr1234",name: "Section Manager ECC",    role: "Section Manager",    deptId: "ecc",    avatar: "", canBackup: 0 },
      ];
      saveLocalDb();
    }
    res.json({ success: true, message: "รีเซ็ตฐานข้อมูลเรียบร้อย" });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
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
      const raw = await queryD1("SELECT * FROM employees");
      employeesData = await enrichEmployeesWithOt(raw);
      deptsData = await queryD1("SELECT * FROM departments");
    } else {
      employeesData = appState.employees.map(emp => {
        const shifts   = emp.shifts || [];
        const actualOt = Math.round(shifts.reduce((s: number, c: string) => s + getShiftOt(c), 0) * 10) / 10;
        const status   = actualOt > emp.targetOt ? "Warning" : "On Track";
        return { ...emp, actualOt, status };
      });
      deptsData = appState.departments;
    }

    if (!ai) {
      return res.json({ report: `### 🤖 ไม่พบ GEMINI_API_KEY\nกรุณาตั้งค่า GEMINI_API_KEY ใน environment variables` });
    }

    const formattedEmployees = employeesData.map(e =>
      `- ${e.name} (${e.id}) [${e.role}] แผนก: ${e.deptId}: OT จริง = ${e.actualOt} ชม., เป้าหมาย = ${e.targetOt} ชม., สถานะ = ${e.status}`
    ).join("\n");

    const formattedDepts = deptsData.map((d: any) =>
      `- ${d.nameTh || d.name}: manager = ${d.manager || "-"}`
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
