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

// Middleware for request handling
app.use((req, res, next) => {
  next();
});

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
  } catch {
    return null;
  }
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
  leaveRecords: [] as any[],
  vesselSchedules: [] as any[],
  jobValueRecords: [
    {
      id: "JV-EMP-101", empId: "EMP-101", empName: "นายสมชาย ใจดี", department: "INTER 2", position: "Operator", status: "Active",
      avgRevenue: 185000, avgCost: 110000, profit2026: 900000, profit2025: 820000,
      monthlyRevenue: [180000,182000,185000,188000,190000,185000,187000,186000,184000,189000,191000,188000],
      monthlyCost: [108000,109000,110000,112000,111000,110000,112000,110000,109000,111000,113000,110000],
      monthlyProfit: [72000,73000,75000,76000,79000,75000,75000,76000,75000,78000,78000,78000],
      updatedAt: new Date().toISOString()
    },
    {
      id: "JV-EMP-102", empId: "EMP-102", empName: "นายวิชัย สุขใจ", department: "INTER 2", position: "Technician", status: "Active",
      avgRevenue: 210000, avgCost: 125000, profit2026: 1020000, profit2025: 940000,
      monthlyRevenue: [205000,208000,210000,215000,212000,210000,214000,211000,209000,216000,218000,213000],
      monthlyCost: [123000,124000,125000,128000,126000,125000,127000,125000,124000,127000,129000,126000],
      monthlyProfit: [82000,84000,85000,87000,86000,85000,87000,86000,85000,89000,89000,87000],
      updatedAt: new Date().toISOString()
    },
    {
      id: "JV-EMP-103", empId: "EMP-103", empName: "นางสาววิภา รักงาน", department: "INTER 3", position: "Operator", status: "Active",
      avgRevenue: 175000, avgCost: 105000, profit2026: 840000, profit2025: 780000,
      monthlyRevenue: [170000,172000,175000,178000,176000,175000,177000,174000,173000,179000,180000,176000],
      monthlyCost: [103000,104000,105000,107000,106000,105000,106000,104000,103000,107000,108000,105000],
      monthlyProfit: [67000,68000,70000,71000,70000,70000,71000,70000,70000,72000,72000,71000],
      updatedAt: new Date().toISOString()
    },
    {
      id: "JV-EMP-104", empId: "EMP-104", empName: "นายสมศักดิ์ มั่นคง", department: "INTER 5", position: "Senior Operator", status: "Active",
      avgRevenue: 240000, avgCost: 140000, profit2026: 1200000, profit2025: 1100000,
      monthlyRevenue: [235000,238000,240000,245000,242000,240000,244000,241000,239000,246000,248000,243000],
      monthlyCost: [138000,139000,140000,143000,141000,140000,142000,140000,139000,143000,145000,142000],
      monthlyProfit: [97000,99000,100000,102000,101000,100000,102000,101000,100000,103000,103000,101000],
      updatedAt: new Date().toISOString()
    },
    {
      id: "JV-EMP-105", empId: "EMP-105", empName: "นายอนันต์ ขยันยิ่ง", department: "Heavy Machine", position: "Mechanic", status: "Active",
      avgRevenue: 220000, avgCost: 130000, profit2026: 1080000, profit2025: 1000000,
      monthlyRevenue: [215000,218000,220000,225000,222000,220000,224000,221000,219000,226000,228000,223000],
      monthlyCost: [128000,129000,130000,133000,131000,130000,132000,130000,129000,133000,135000,132000],
      monthlyProfit: [87000,89000,90000,92000,91000,90000,92000,91000,90000,93000,93000,91000],
      updatedAt: new Date().toISOString()
    },
    {
      id: "JV-EMP-106", empId: "EMP-106", empName: "นายประสิทธิ์ ดีเลิศ", department: "ECC", position: "Electrician", status: "Active",
      avgRevenue: 195000, avgCost: 115000, profit2026: 960000, profit2025: 890000,
      monthlyRevenue: [190000,192000,195000,198000,196000,195000,197000,194000,193000,199000,200000,196000],
      monthlyCost: [113000,114000,115000,117000,116000,115000,116000,114000,113000,117000,118000,115000],
      monthlyProfit: [77000,78000,80000,81000,80000,80000,81000,80000,80000,82000,82000,81000],
      updatedAt: new Date().toISOString()
    }
  ]
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
// Helper: compute employee OT from ot_daily_records (D1)
const computeEmployeeOtStats = async (employeeId: string, targetOt: number, reqYear?: number, reqMonth?: number) => {
  let sql = "SELECT COALESCE(SUM(otHours), 0) as total FROM ot_daily_records WHERE employeeId = ?";
  const params: any[] = [employeeId];
  if (reqYear && reqMonth) {
    sql += " AND year = ? AND month = ?";
    params.push(reqYear, reqMonth);
  }
  const rows = await queryD1(sql, params);
  const actualOt = Math.round((rows[0]?.total || 0) * 10) / 10;
  const otPct    = targetOt > 0 ? Math.round((actualOt / targetOt) * 100) : 0;
  const status   = actualOt > targetOt ? "Warning" : "On Track";
  return { actualOt, otPct, status };
};

// Helper: enrich employees array with computed OT stats & sync shifts (D1)
const enrichEmployeesWithOt = async (employees: any[], customYear?: number, customMonth?: number): Promise<any[]> => {
  let year = customYear;
  let month = customMonth;

  if (!year || !month) {
    try {
      const cfgRows = await queryD1("SELECT currentMonth FROM shift_config LIMIT 1");
      const cm = cfgRows[0]?.currentMonth || "";
      if (cm.includes("-")) {
        const [yStr, mStr] = cm.split("-");
        year = Number(yStr);
        month = Number(mStr);
      }
    } catch (_) {}
  }

  const now = new Date();
  if (!year || isNaN(year)) year = now.getFullYear();
  if (!month || isNaN(month)) month = now.getMonth() + 1;

  const daysInMonth = new Date(year, month, 0).getDate();
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;

  // Fetch daily OT records for current month
  let dailyRecords: any[] = [];
  try {
    dailyRecords = await queryD1(
      "SELECT employeeId, date, shiftCode, otHours FROM ot_daily_records WHERE year = ? AND month = ?",
      [year, month]
    );
  } catch (err) {
    dailyRecords = [];
  }

  const recordsByEmp: Record<string, Record<number, string>> = {};
  dailyRecords.forEach((r: any) => {
    if (!recordsByEmp[r.employeeId]) recordsByEmp[r.employeeId] = {};
    const dNum = parseInt(String(r.date).split("-")[2], 10);
    if (!isNaN(dNum)) {
      recordsByEmp[r.employeeId][dNum - 1] = r.shiftCode;
    }
  });

  const defaultPatterns = [
    ["M12", "M12", "A12", "A12", "O", "O"],
    ["M8", "M8", "M12", "M12", "O", "O"],
    ["A12", "A12", "N12", "N12", "O", "O"],
    ["N8", "N12", "N12", "O", "O", "M12"]
  ];

  return Promise.all(employees.map(async (e: any, idx: number) => {
    let shifts: string[] = [];
    try {
      if (typeof e.shifts === "string") {
        shifts = JSON.parse(e.shifts || "[]");
      } else if (Array.isArray(e.shifts)) {
        shifts = [...e.shifts];
      }
    } catch (_) {
      shifts = [];
    }

    const empDailyRecs = recordsByEmp[e.id] || {};
    const hasDailyRecs = Object.keys(empDailyRecs).length > 0;

    // If shifts stored in DB is empty or all 'O's but we have daily records, reconstruct
    const isAllOff = shifts.length === 0 || shifts.every((s: string) => s === "O");
    if (isAllOff && hasDailyRecs) {
      shifts = Array(daysInMonth).fill("O");
      Object.entries(empDailyRecs).forEach(([dayIdxStr, code]) => {
        const dIdx = Number(dayIdxStr);
        if (dIdx >= 0 && dIdx < daysInMonth) {
          shifts[dIdx] = code;
        }
      });
    }

    // Pad shifts with 'O' up to daysInMonth if needed
    while (shifts.length < daysInMonth) {
      shifts.push("O");
    }

    // Calculate OT hours from shifts array
    const otFromShifts = Math.round(shifts.reduce((sum: number, code: string) => sum + getShiftOt(code), 0) * 10) / 10;

    // Sync to D1 ot_daily_records if otFromShifts > 0 but D1 daily records table was empty for this employee
    if (!hasDailyRecs && otFromShifts > 0 && isD1Enabled()) {
      for (let dIdx = 0; dIdx < shifts.length; dIdx++) {
        const shiftCode = shifts[dIdx];
        const otHrs = getShiftOt(shiftCode);
        if (otHrs > 0) {
          const dayNum = dIdx + 1;
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const recId = `OTD-${e.id}-${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          try {
            await queryD1(
              `INSERT OR REPLACE INTO ot_daily_records (id, year, month, date, employeeId, employeeName, deptId, shiftCode, otHours, note)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '')`,
              [recId, year, month, dateStr, e.id, e.name || "", e.deptId || "", shiftCode, otHrs]
            );
          } catch (_) {}
        }
      }
    }

    let planShifts: string[] = [];
    try {
      if (typeof e.planShifts === "string") {
        planShifts = JSON.parse(e.planShifts || "[]");
      } else if (Array.isArray(e.planShifts)) {
        planShifts = [...e.planShifts];
      }
    } catch (_) {
      planShifts = [];
    }
    if (!Array.isArray(planShifts) || planShifts.length === 0) {
      planShifts = [...shifts];
    }

    const { actualOt: dbOt } = await computeEmployeeOtStats(e.id, e.targetOt || 48, year, month);
    const actualOt = Math.max(dbOt, otFromShifts);
    const targetOt = e.targetOt || 48;
    const otPct = targetOt > 0 ? Math.round((actualOt / targetOt) * 100) : 0;
    const status = actualOt > targetOt ? "Warning" : "On Track";

    return { ...e, shifts, planShifts, actualOt, otPct, status };
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
      planShifts TEXT DEFAULT '[]',
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
      { name: "calendarType", type: "TEXT" },
      { name: "planShifts", type: "TEXT DEFAULT '[]'" }
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

    // Vessel schedules — ตารางเรือและปั้นจั่นตักเรือ
    await queryD1(`CREATE TABLE IF NOT EXISTS vessel_schedules (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      planType TEXT NOT NULL,
      name TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      deptId TEXT NOT NULL,
      color TEXT
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
      const employees = await enrichEmployeesWithOt(employeesRaw, thisYear, thisMonth);

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
      // Offline mode — compute from local appState
      const enrichedEmps = appState.employees.map(emp => {
        const shifts   = emp.shifts || [];
        const actualOt = Math.round(shifts.reduce((s: number, c: string) => s + getShiftOt(c), 0) * 10) / 10;
        const otPct    = emp.targetOt > 0 ? Math.round((actualOt / emp.targetOt) * 100) : 0;
        const status   = actualOt > emp.targetOt ? "Warning" : "On Track";
        return { ...emp, actualOt, otPct, status };
      });

      const enrichedDepts = appState.departments.map(dept => {
        const deptEmp        = enrichedEmps.filter(e => e.deptId === dept.id);
        const employeesCount = deptEmp.length;
        const otHours        = Math.round(deptEmp.reduce((s, e) => s + (e.actualOt || 0), 0) * 10) / 10;
        const budgetUsed     = Math.round(otHours * DEFAULT_OT_RATE);
        const budgetUtilization = Math.min(100, Math.round((budgetUsed / DEFAULT_BUDGET_MAX) * 100));
        const status         = budgetUtilization > 95 ? "Warning" : "On Track";
        return { ...dept, employeesCount, otHours, budgetUsed, budgetMax: DEFAULT_BUDGET_MAX, otRatePerHour: DEFAULT_OT_RATE, budgetUtilization, status };
      });

      res.json({
        departments: enrichedDepts,
        employees: enrichedEmps,
        shiftConfig: appState.shiftConfig,
        otTrendData: appState.otTrendData || { months: [], lastYear: [], currentYear: [] },
        leaveRecords: appState.leaveRecords || [],
        vesselSchedules: appState.vesselSchedules || [],
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
        // บันทึกทั้ง actual shifts และ plan shifts
        const actualShifts = emp.shifts || [];
        const planShifts   = emp.planShifts || actualShifts; // fallback: ถ้าไม่มี plan ให้ใช้ actual
        await queryD1(
          "UPDATE employees SET shifts = ?, planShifts = ? WHERE id = ?",
          [JSON.stringify(actualShifts), JSON.stringify(planShifts), emp.id]
        );

        // OT daily records คำนวณจาก Actual shifts เท่านั้น
        await queryD1("DELETE FROM ot_daily_records WHERE employeeId = ? AND year = ? AND month = ?",
          [emp.id, recordYear, recordMonth]);

        const empRows = await queryD1("SELECT name, deptId FROM employees WHERE id = ? LIMIT 1", [emp.id]);
        const empName = empRows[0]?.name || emp.name || "";
        const deptId  = empRows[0]?.deptId || emp.deptId || "";

        for (let dayIdx = 0; dayIdx < actualShifts.length; dayIdx++) {
          const shiftCode = actualShifts[dayIdx];
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

// Save Department Shift Config (Pattern & Manager)
app.post("/api/save-department-config", async (req, res) => {
  try {
    const { deptId, pattern, manager } = req.body;
    if (isD1Enabled()) {
      if (pattern !== undefined) {
        await queryD1("UPDATE departments SET pattern = ? WHERE id = ?", [pattern, deptId]);
      }
      if (manager !== undefined) {
        await queryD1("UPDATE departments SET manager = ? WHERE id = ?", [manager, deptId]);
      }
    }
    res.json({ success: true, message: "อัปเดตข้อมูลแผนกสำเร็จ" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



    } else {
      // Offline mode
      appState.employees = appState.employees.map(emp => {
        const updated = employees.find((e: any) => e.id === emp.id);
        if (updated) {
          const shifts: string[]     = updated.shifts || [];
          const planShifts: string[] = updated.planShifts || shifts;
          const actualOt = Math.round(shifts.reduce((s, code) => s + getShiftOt(code), 0) * 10) / 10;
          const otPct    = Math.round((actualOt / emp.targetOt) * 100);
          return { ...emp, shifts, planShifts, actualOt, otPct, status: actualOt > emp.targetOt ? "Warning" : "On Track" };
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
// Vessel Schedules (NEW)
// ============================================================
app.get("/api/vessel-schedules", async (req, res) => {
  const { deptId, year, month } = req.query;
  if (!deptId) return res.status(400).json({ error: "ต้องระบุ deptId" });
  try {
    if (isD1Enabled()) {
      let sql = "SELECT * FROM vessel_schedules WHERE deptId = ?";
      const params: any[] = [deptId];
      if (year && month) {
        const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
        const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
        const endOfMonth = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
        sql += " AND startDate <= ? AND endDate >= ?";
        params.push(endOfMonth, startOfMonth);
      }
      const rows = await queryD1(sql, params);
      res.json(rows);
    } else {
      let filtered = [...(appState.vesselSchedules || [])];
      filtered = filtered.filter(v => v.deptId === deptId);
      if (year && month) {
        const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
        const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
        const endOfMonth = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
        filtered = filtered.filter(v => v.startDate <= endOfMonth && v.endDate >= startOfMonth);
      }
      res.json(filtered);
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post("/api/save-vessel-schedule", async (req, res) => {
  const { id, type, planType, name, startDate, endDate, deptId, color, username } = req.body;
  if (!type || !planType || !name || !startDate || !endDate || !deptId) {
    return res.status(400).json({ error: "กรอกข้อมูลไม่ครบถ้วน" });
  }
  const scheduleId = id || `VS-${Date.now()}`;
  try {
    if (isD1Enabled()) {
      await queryD1(
        `INSERT OR REPLACE INTO vessel_schedules (id, type, planType, name, startDate, endDate, deptId, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [scheduleId, type, planType, name, startDate, endDate, deptId, color || "#fef08a"]
      );
      await writeAuditLog(username || "system", "save_vessel_schedule", "vessel_schedule", scheduleId, { type, planType, name });
      res.json({ success: true, id: scheduleId });
    } else {
      const record = { id: scheduleId, type, planType, name, startDate, endDate, deptId, color: color || "#fef08a" };
      appState.vesselSchedules = (appState.vesselSchedules || []).filter(v => v.id !== scheduleId);
      appState.vesselSchedules.push(record);
      saveLocalDb();
      res.json({ success: true, id: scheduleId });
    }
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.delete("/api/delete-vessel-schedule/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (isD1Enabled()) {
      await queryD1("DELETE FROM vessel_schedules WHERE id = ?", [id]);
    } else {
      appState.vesselSchedules = (appState.vesselSchedules || []).filter(v => v.id !== id);
      saveLocalDb();
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// ============================================================
// ============================================================
// Job Value API Routes (Executive Financials & Performance)
// ============================================================
app.get("/api/job-value", async (req, res) => {
  try {
    if (isD1Enabled()) {
      const rows = await queryD1("SELECT * FROM job_value_records ORDER BY empId ASC");
      const parsed = rows.map((r: any) => ({
        ...r,
        monthlyRevenue: typeof r.monthlyRevenue === "string" ? JSON.parse(r.monthlyRevenue || "[]") : (r.monthlyRevenue || []),
        monthlyCost: typeof r.monthlyCost === "string" ? JSON.parse(r.monthlyCost || "[]") : (r.monthlyCost || []),
        monthlyProfit: typeof r.monthlyProfit === "string" ? JSON.parse(r.monthlyProfit || "[]") : (r.monthlyProfit || [])
      }));
      res.json(parsed);
    } else {
      res.json(appState.jobValueRecords || []);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/job-value/import", async (req, res) => {
  const { records, role, username } = req.body;
  const isHrOrAdmin = ["HR", "HR Section Manager", "ผู้ดูแลระบบ"].includes(role || "");
  if (!isHrOrAdmin) {
    return res.status(403).json({ error: "เฉพาะ HR และผู้ดูแลระบบเท่านั้นที่มีสิทธิ์นำเข้าข้อมูล Job Value" });
  }
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: "ข้อมูลไม่ถูกต้องหรือไม่มีรายการ" });
  }
  try {
    const formattedRecords = records.map((r: any) => ({
      id: r.id || `JV-${r.empId || Date.now()}`,
      empId: String(r.empId || r.id || "").trim(),
      empName: String(r.empName || r.name || "").trim(),
      department: String(r.department || r.deptId || "ไม่ระบุแผนก").trim(),
      position: String(r.position || r.role || "").trim(),
      status: String(r.status || "Active").trim(),
      avgRevenue: Number(r.avgRevenue) || 0,
      avgCost: Number(r.avgCost) || 0,
      profit2026: Number(r.profit2026 || r.totalProfit) || 0,
      profit2025: Number(r.profit2025) || 0,
      monthlyRevenue: Array.isArray(r.monthlyRevenue) ? r.monthlyRevenue : (r.monthlyRevenue ? JSON.parse(r.monthlyRevenue) : []),
      monthlyCost: Array.isArray(r.monthlyCost) ? r.monthlyCost : (r.monthlyCost ? JSON.parse(r.monthlyCost) : []),
      monthlyProfit: Array.isArray(r.monthlyProfit) ? r.monthlyProfit : (r.monthlyProfit ? JSON.parse(r.monthlyProfit) : []),
      updatedAt: new Date().toISOString()
    }));

    if (isD1Enabled()) {
      for (const rec of formattedRecords) {
        await queryD1(
          `INSERT OR REPLACE INTO job_value_records (id, empId, empName, department, position, status, avgRevenue, avgCost, profit2026, profit2025, monthlyRevenue, monthlyCost, monthlyProfit, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            rec.id, rec.empId, rec.empName, rec.department, rec.position, rec.status,
            rec.avgRevenue, rec.avgCost, rec.profit2026, rec.profit2025,
            JSON.stringify(rec.monthlyRevenue), JSON.stringify(rec.monthlyCost), JSON.stringify(rec.monthlyProfit),
            rec.updatedAt
          ]
        );
      }
      await writeAuditLog(username || "system", "import_job_value", "job_value", "bulk", { count: formattedRecords.length });
    } else {
      appState.jobValueRecords = formattedRecords;
      saveLocalDb();
    }
    res.json({ success: true, count: formattedRecords.length, records: formattedRecords });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

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
      try { await queryD1("DELETE FROM job_value"); } catch (_) {}
      try { await queryD1("DELETE FROM vessel_schedules"); } catch (_) {}
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
      const overOt = employeesData.filter(e => e.actualOt > e.targetOt);
      const report = `### 📊 รายงานวิเคราะห์การทำงานชั่วโมงเกิน (OT Audit Report)
      
#### 1. สรุปความเสี่ยงและพนักงาน OT เกินเป้าหมาย
- พนักงานทั้งหมด: ${employeesData.length} คน
- พนักงานที่มีชั่วโมง OT เกินขีดจำกัด: **${overOt.length} คน**
${overOt.map(e => `  - ⚠️ **${e.name}** (${e.deptId}): OT สะสม ${e.actualOt} ชม. (เป้าหมาย ${e.targetOt} ชม.)`).join("\n")}

#### 2. สถานะแผนก
${deptsData.map((d: any) => `- **${d.nameTh || d.name}**: ผู้ดูแล ${d.manager || "-"}`).join("\n")}

#### 3. ข้อแนะนำการจัดกะ
- ควรพิจารณาสลับกะทำงานระหว่างพนักงานกลุ่มที่มี OT สะสมสูงกับกลุ่มที่มี OT น้อยเพื่อลดความเหนื่อยล้า
- ตรวจสอบตารางกะล่วงหน้าเพื่อกระจายภาระงานให้สอดคล้องกับงบประมาณแผนก`;

      return res.json({ report });
    }
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

if (!process.env.CF_WORKER && process.env.LISTEN_PORT !== "false") {
  startServer();
}

export default app;
