import DEFAULT_EXCEL_EMPLOYEES from "./seed_employees.json";
import GS_LIVE_PAYLOAD from "./gs_live_data.json";

const DEFAULT_GS_DATA = GS_LIVE_PAYLOAD.rawData || [];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS
    }
  });
}

async function ensureSchema(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS jv_employees (
      emp_id TEXT PRIMARY KEY,
      seq_no INTEGER,
      name TEXT NOT NULL,
      dept TEXT NOT NULL,
      group_name TEXT,
      position_type TEXT,
      level TEXT,
      role TEXT,
      start_date TEXT,
      monthly_rev_2025 TEXT,
      monthly_cost_2025 TEXT,
      monthly_prof_2025 TEXT,
      avg_rev_2025 REAL DEFAULT 0,
      avg_cost_2025 REAL DEFAULT 0,
      avg_prof_2025 REAL DEFAULT 0,
      monthly_rev_2026 TEXT,
      monthly_cost_2026 TEXT,
      monthly_prof_2026 TEXT,
      avg_rev_2026 REAL DEFAULT 0,
      avg_cost_2026 REAL DEFAULT 0,
      avg_prof_2026 REAL DEFAULT 0,
      profit_growth REAL DEFAULT 0,
      profit_growth_status TEXT,
      rank_2025 INTEGER,
      rank_2025_fraction TEXT,
      rank_2026 INTEGER,
      rank_2026_fraction TEXT,
      eval_2026 TEXT,
      eval_2025 TEXT,
      leaves_2026 INTEGER DEFAULT 0,
      leaves_2025 INTEGER DEFAULT 0,
      adj_status TEXT,
      adj_base_salary REAL DEFAULT 0,
      adj_cap_jv REAL DEFAULT 0,
      note TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS jv_upload_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL,
      record_count INTEGER NOT NULL,
      mode TEXT DEFAULT 'replace',
      uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`)
  ]);
}

function normalizeRecord(rec, idx = 0) {
  const ensure12 = (arr) => {
    const res = new Array(12).fill(0);
    if (Array.isArray(arr)) {
      for (let i = 0; i < 12; i++) res[i] = Math.round(Number(arr[i]) || 0);
    }
    return res;
  };

  const mRev25 = ensure12(rec.monthlyRev2025);
  const mProf25 = ensure12(rec.monthlyProf2025);
  const mCost25 =
    Array.isArray(rec.monthlyCost2025) && rec.monthlyCost2025.some((v) => Number(v) !== 0)
      ? ensure12(rec.monthlyCost2025)
      : mRev25.map((r, i) => (r !== 0 || mProf25[i] !== 0 ? r - mProf25[i] : 0));

  const mRev26 = ensure12(rec.monthlyRev2026 || rec.monthlyRevenue);
  const mProf26 = ensure12(rec.monthlyProf2026 || rec.monthlyProfit);
  const mCost26 =
    Array.isArray(rec.monthlyCost2026 || rec.monthlyCost) &&
    (rec.monthlyCost2026 || rec.monthlyCost).some((v) => Number(v) !== 0)
      ? ensure12(rec.monthlyCost2026 || rec.monthlyCost)
      : mRev26.map((r, i) => (r !== 0 || mProf26[i] !== 0 ? r - mProf26[i] : 0));

  const act25 = mRev25.filter((v, i) => v !== 0 || mProf25[i] !== 0).length || 12;
  const act26 = mRev26.filter((v, i) => v !== 0 || mProf26[i] !== 0).length || 12;

  const avgRev25 = Math.round(
    Number(rec.avgRev2025 ?? mRev25.reduce((a, b) => a + b, 0) / act25) || 0
  );
  const avgProf25 = Math.round(
    Number(rec.avgProf2025 ?? rec.profit2025 ?? mProf25.reduce((a, b) => a + b, 0) / act25) || 0
  );
  const avgCost25 = Math.round(Number(rec.avgCost2025 ?? avgRev25 - avgProf25) || 0);

  const avgRev26 = Math.round(
    Number(rec.avgRev2026 ?? rec.avgRevenue ?? mRev26.reduce((a, b) => a + b, 0) / act26) || 0
  );
  const avgProf26 = Math.round(
    Number(rec.avgProf2026 ?? rec.totalProfit ?? mProf26.reduce((a, b) => a + b, 0) / act26) || 0
  );
  const avgCost26 = Math.round(
    Number(rec.avgCost2026 ?? rec.avgCost ?? avgRev26 - avgProf26) || 0
  );

  const profitGrowth = Math.round(Number(rec.profitGrowth ?? avgProf26 - avgProf25) || 0);
  const rawDept = String(rec.dept || rec.department || "INTER 2")
    .trim()
    .replace("INETR 3", "INTER 3")
    .replace(/^INTER2$/i, "INTER 2")
    .replace(/^INTER3$/i, "INTER 3")
    .replace(/^INTER5$/i, "INTER 5")
    .replace(/^INTER7$/i, "INTER 7");

  const rawPos = String(rec.positionType || rec.position || rec.type || "Technician").trim();

  return {
    no: Number(rec.no) || idx + 1,
    empId: String(rec.empId || rec.id || idx + 1).trim(),
    name: String(rec.name || "").trim(),
    dept: rawDept,
    groupName: String(rec.groupName || rec.group || `${rawDept}_Technician`).trim(),
    positionType: rawPos,
    level: String(rec.level || "Level 10").trim(),
    role: String(rec.role || rawPos).trim(),
    startDate: String(rec.startDate || "").trim(),
    monthlyRev2025: mRev25,
    monthlyCost2025: mCost25,
    monthlyProf2025: mProf25,
    avgRev2025: avgRev25,
    avgCost2025: avgCost25,
    avgProf2025: avgProf25,
    monthlyRev2026: mRev26,
    monthlyCost2026: mCost26,
    monthlyProf2026: mProf26,
    avgRev2026: avgRev26,
    avgCost2026: avgCost26,
    avgProf2026: avgProf26,
    profitGrowth,
    profitGrowthStatus: String(
      rec.profitGrowthStatus || rec.status || (profitGrowth > 0 ? "กำไรต่อยอด" : "ไม่ต่อยอด")
    ).trim(),
    rank2025: rec.rank2025 != null ? Number(rec.rank2025) : null,
    rank2025Fraction: String(rec.rank2025Fraction || "").trim(),
    rank2026: rec.rank2026 != null ? Number(rec.rank2026) : null,
    rank2026Fraction: String(rec.rank2026Fraction || "").trim(),
    eval2026: String(rec.eval2026 || "").trim(),
    eval2025: String(rec.eval2025 || "").trim(),
    leaves2026: Math.round(Number(rec.leaves2026) || 0),
    leaves2025: Math.round(Number(rec.leaves2025) || 0),
    adjStatus: String(rec.adjStatus || (profitGrowth > 0 ? "ปรับ" : "ไม่ปรับ")).trim(),
    adjBaseSalary: Math.round(Number(rec.adjBaseSalary) || 0),
    adjCapJv: Math.round(Number(rec.adjCapJv) || 0),
    note: String(rec.note || "").trim()
  };
}

function rowToEmployee(row) {
  const safeParse = (str) => {
    try {
      return JSON.parse(str || "[]");
    } catch {
      return new Array(12).fill(0);
    }
  };
  return {
    no: row.seq_no,
    empId: row.emp_id,
    name: row.name,
    dept: row.dept,
    groupName: row.group_name,
    positionType: row.position_type,
    level: row.level,
    role: row.role,
    startDate: row.start_date,
    monthlyRev2025: safeParse(row.monthly_rev_2025),
    monthlyCost2025: safeParse(row.monthly_cost_2025),
    monthlyProf2025: safeParse(row.monthly_prof_2025),
    avgRev2025: row.avg_rev_2025,
    avgCost2025: row.avg_cost_2025,
    avgProf2025: row.avg_prof_2025,
    monthlyRev2026: safeParse(row.monthly_rev_2026),
    monthlyCost2026: safeParse(row.monthly_cost_2026),
    monthlyProf2026: safeParse(row.monthly_prof_2026),
    avgRev2026: row.avg_rev_2026,
    avgCost2026: row.avg_cost_2026,
    avgProf2026: row.avg_prof_2026,
    profitGrowth: row.profit_growth,
    profitGrowthStatus: row.profit_growth_status,
    rank2025: row.rank_2025,
    rank2025Fraction: row.rank_2025_fraction,
    rank2026: row.rank_2026,
    rank2026Fraction: row.rank_2026_fraction,
    eval2026: row.eval_2026,
    eval2025: row.eval_2025,
    leaves2026: row.leaves_2026,
    leaves2025: row.leaves_2025,
    adjStatus: row.adj_status,
    adjBaseSalary: row.adj_base_salary,
    adjCapJv: row.adj_cap_jv,
    note: row.note,
    updatedAt: row.updated_at
  };
}

async function upsertRecordsToD1(db, records, mode = "replace", fileName = "Job value.xlsx") {
  const stmts = [];
  if (mode === "replace") {
    stmts.push(db.prepare("DELETE FROM jv_employees"));
  }

  const nowIso = new Date().toISOString();
  records.forEach((raw, idx) => {
    const r = normalizeRecord(raw, idx);
    stmts.push(
      db
        .prepare(
          `INSERT OR REPLACE INTO jv_employees (
        emp_id, seq_no, name, dept, group_name, position_type, level, role, start_date,
        monthly_rev_2025, monthly_cost_2025, monthly_prof_2025, avg_rev_2025, avg_cost_2025, avg_prof_2025,
        monthly_rev_2026, monthly_cost_2026, monthly_prof_2026, avg_rev_2026, avg_cost_2026, avg_prof_2026,
        profit_growth, profit_growth_status, rank_2025, rank_2025_fraction, rank_2026, rank_2026_fraction,
        eval_2026, eval_2025, leaves_2026, leaves_2025, adj_status, adj_base_salary, adj_cap_jv, note, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`
        )
        .bind(
          r.empId,
          r.no,
          r.name,
          r.dept,
          r.groupName,
          r.positionType,
          r.level,
          r.role,
          r.startDate,
          JSON.stringify(r.monthlyRev2025),
          JSON.stringify(r.monthlyCost2025),
          JSON.stringify(r.monthlyProf2025),
          r.avgRev2025,
          r.avgCost2025,
          r.avgProf2025,
          JSON.stringify(r.monthlyRev2026),
          JSON.stringify(r.monthlyCost2026),
          JSON.stringify(r.monthlyProf2026),
          r.avgRev2026,
          r.avgCost2026,
          r.avgProf2026,
          r.profitGrowth,
          r.profitGrowthStatus,
          r.rank2025,
          r.rank2025Fraction,
          r.rank2026,
          r.rank2026Fraction,
          r.eval2026,
          r.eval2025,
          r.leaves2026,
          r.leaves2025,
          r.adjStatus,
          r.adjBaseSalary,
          r.adjCapJv,
          r.note,
          nowIso
        )
    );
  });

  stmts.push(
    db
      .prepare("INSERT INTO jv_upload_logs (file_name, record_count, mode, uploaded_at) VALUES (?, ?, ?, ?)")
      .bind(fileName, records.length, mode, nowIso)
  );

  await db.batch(stmts);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      try {
        await ensureSchema(env.DB);

        if (url.pathname === "/api/jv/data" && request.method === "GET") {
          let { results } = await env.DB.prepare(
            "SELECT * FROM jv_employees ORDER BY seq_no ASC, emp_id ASC"
          ).all();
          if (!results || results.length === 0) {
            await upsertRecordsToD1(
              env.DB,
              DEFAULT_EXCEL_EMPLOYEES,
              "replace",
              "Initial Seed (Job value.xlsx)"
            );
            const seeded = await env.DB.prepare(
              "SELECT * FROM jv_employees ORDER BY seq_no ASC, emp_id ASC"
            ).all();
            results = seeded.results || [];
          }
          const logsRes = await env.DB.prepare(
            "SELECT * FROM jv_upload_logs ORDER BY id DESC LIMIT 10"
          ).all();
          const records = results.map(rowToEmployee);
          return jsonResponse({
            status: "success",
            appName: "jv.marine.work.dev",
            storage: "Cloudflare D1 (jvmarine-db)",
            count: records.length,
            records,
            uploadLogs: logsRes.results || []
          });
        }

        if (url.pathname === "/api/jv/upload" && request.method === "POST") {
          const body = await request.json();
          const incoming = Array.isArray(body.records) ? body.records : [];
          if (incoming.length === 0) {
            return jsonResponse(
              { status: "error", message: "ไม่พบรายการข้อมูลในไฟล์ที่อัปโหลด" },
              400
            );
          }
          const mode = body.mode === "merge" ? "merge" : "replace";
          const fileName = body.fileName || "Excel_Upload.xlsx";
          await upsertRecordsToD1(env.DB, incoming, mode, fileName);

          const { results } = await env.DB.prepare(
            "SELECT * FROM jv_employees ORDER BY seq_no ASC, emp_id ASC"
          ).all();
          const logsRes = await env.DB.prepare(
            "SELECT * FROM jv_upload_logs ORDER BY id DESC LIMIT 10"
          ).all();
          return jsonResponse({
            status: "success",
            message: `บันทึกข้อมูลลง Cloudflare D1 สำเร็จ (${incoming.length} รายการ)`,
            records: (results || []).map(rowToEmployee),
            uploadLogs: logsRes.results || []
          });
        }

        if (url.pathname === "/api/jv/reset" && request.method === "POST") {
          const body = await request.json().catch(() => ({}));
          const source = body.source === "gsheet" ? "gsheet" : "excel";
          const dataset = source === "gsheet" ? DEFAULT_GS_DATA : DEFAULT_EXCEL_EMPLOYEES;
          const label =
            source === "gsheet"
              ? "Google Apps Script Live Sheet (21 คน)"
              : "Master Job value.xlsx (27 คน)";
          await upsertRecordsToD1(env.DB, dataset, "replace", label);

          const { results } = await env.DB.prepare(
            "SELECT * FROM jv_employees ORDER BY seq_no ASC, emp_id ASC"
          ).all();
          const logsRes = await env.DB.prepare(
            "SELECT * FROM jv_upload_logs ORDER BY id DESC LIMIT 10"
          ).all();
          return jsonResponse({
            status: "success",
            message: `โหลดข้อมูลมาตรฐาน (${label}) ลง Cloudflare D1 สำเร็จ`,
            records: (results || []).map(rowToEmployee),
            uploadLogs: logsRes.results || []
          });
        }

        return jsonResponse({ status: "error", message: "Not Found" }, 404);
      } catch (err) {
        return jsonResponse({ status: "error", message: err.message || String(err) }, 500);
      }
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("JVMarine Worker Active", { status: 200 });
  }
};
