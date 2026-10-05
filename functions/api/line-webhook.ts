interface Env {
  DB: any;
  LINE_CHANNEL_ACCESS_TOKEN?: string;
  LINE_CHANNEL_SECRET?: string;
}

const DEFAULT_LINE_CHANNEL_SECRET = "10bc535b070ddf725f6d8147bdcfa02f";
const DEFAULT_LINE_ACCESS_TOKEN = "vKI+vZEU0/bfQmxJE6oNweN2slMnbZQldqa+JXUMggobaCx4v7gY5c0sYCzqfdG6OBiIPF1QWwxz+rQMddyZ4ue6NC6mnqBd2nvaRBMVwOmOVSBF8RktKVWWauAM4PdD76TLSX4e4EuTpy8JGL027wdB04t89/1O/w1cDnyilFU=";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-line-signature",
  "Content-Type": "application/json"
};

interface OtShiftItem {
  timeRange: string;
  hours: number;
  multiplier: number;
  shiftCode: string;
}

interface ParsedOt {
  vesselName: string;
  department: string;
  employeeName: string;
  employeeId: string;
  position: string;
  customNote: string;
  date: string; // YYYY-MM-DD
  dateDisplayTh: string; // DD/MM/YYYY (พ.ศ.)
  shifts: OtShiftItem[];
  totalHours: number;
}

async function verifyLineSignature(body: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature || !secret) return false;
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const hashBytes = new Uint8Array(sig);
    let binary = "";
    for (let i = 0; i < hashBytes.length; i++) {
      binary += String.fromCharCode(hashBytes[i]);
    }
    const computedSig = btoa(binary);
    return computedSig === signature;
  } catch (e) {
    console.error("Signature verification error:", e);
    return false;
  }
}

async function replyLineMessage(replyToken: string, messages: any[], token: string) {
  if (!replyToken) return;
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        replyToken,
        messages
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("LINE Reply Error:", res.status, errText);
    }
  } catch (e) {
    console.error("LINE Fetch Error:", e);
  }
}

function extractField(lines: string[], text: string, pattern: string): string {
  // 1. Try single line match with value after label
  const singleLineRegex = new RegExp(`(?:\${pattern})\\s*[:\\s]\\s*([^:\\r\\n]+)`, 'i');
  const m = text.match(singleLineRegex);
  if (m && m[1].trim()) return m[1].trim();

  // 2. Try label on its own line, value on next line
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const labelOnlyRegex = new RegExp(`^(?:\${pattern})\\s*[:]?$`, 'i');
    if (labelOnlyRegex.test(l)) {
      if (i + 1 < lines.length && !new RegExp(`^(?:ขออนุมัติ|M\\.V\\.|รหัส|ชื่อ|ตำแหน่ง|แผนก|วันที่|เวลา|หมายเหตุ)`, 'i').test(lines[i + 1])) {
        return lines[i + 1].trim();
      }
    }
  }
  return "";
}

function parseOtMessage(text: string): ParsedOt | null {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Check for shift intervals pattern: e.g. 00:00-08:00=8x1 or 08:00-16:00=8*3 or 00:00-08:00
  const shiftRegex = /(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})(?:\s*=\s*(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?))?/gi;
  const shifts: OtShiftItem[] = [];
  let match: RegExpExecArray | null;
  while ((match = shiftRegex.exec(text)) !== null) {
    let hours = match[3] ? parseFloat(match[3]) : 0;
    const multiplier = match[4] ? parseFloat(match[4]) : 1;
    if (!hours) {
      const [h1, m1] = match[1].split(":").map(Number);
      const [h2, m2] = match[2].split(":").map(Number);
      let diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (diffMinutes <= 0) diffMinutes += 24 * 60;
      hours = Math.round((diffMinutes / 60) * 10) / 10;
    }
    shifts.push({
      timeRange: `${match[1]}-${match[2]}`,
      hours,
      multiplier,
      shiftCode: multiplier >= 3 ? "OT-3X" : (multiplier > 1 ? "OT-1.5X" : "OT-1X")
    });
  }

  const hasOtKeyword = /ขออนุมัติทำงานล่วงเวลา|ทำงานล่วงเวลา|โอที|\bOT\b/i.test(text);
  if (shifts.length === 0 && !hasOtKeyword) {
    return null;
  }

  // 2. Extract Vessel Name
  let vesselName = "";
  const vesselMatch = text.match(/(?:M\.?V\.?|เรือ|MV)\s*[:"']?\s*([^"'\r\n]+)["']?/i);
  if (vesselMatch) {
    let raw = vesselMatch[1].trim().replace(/^["']|["']$/g, "");
    vesselName = raw.toUpperCase().startsWith("M.V.") ? raw : `M.V. ${raw}`;
  } else {
    const vLine = lines.find(l => /^M\.?V\.?/i.test(l));
    if (vLine) {
      const raw = vLine.replace(/^M\.?V\.?\s*["']?|["']$/gi, "").trim();
      vesselName = `M.V. ${raw}`;
    }
  }

  // 3. Extract Employee ID (รหัสพนักงาน)
  let employeeId = extractField(lines, text, "รหัสพนักงาน|รหัส|ID|Emp ID");
  if (!employeeId) {
    const numMatch = text.match(/\b\d{5,7}\b/);
    if (numMatch) employeeId = numMatch[0];
  }

  // 4. Extract Employee Name (ชื่อนามสกุล)
  let employeeName = extractField(lines, text, "ชื่อนามสกุล|ชื่อ-นามสกุล|ชื่อ");
  if (!employeeName) {
    const titleMatch = text.match(/(?:นาย\s+นาย|นาย|นางสาว|นาง|คุณ)\s*([^:\r\n]+)/);
    if (titleMatch) {
      employeeName = titleMatch[0].trim();
    }
  }
  employeeName = employeeName.replace(/^นาย\s+นาย\s+/g, "นาย ");

  // 5. Extract Position (ตำแหน่ง)
  let position = extractField(lines, text, "ตำแหน่ง|Position");

  // 6. Extract Department (แผนก)
  let department = extractField(lines, text, "แผนก|Department");

  // 7. Extract Date (วันที่)
  let date = "";
  let dateDisplayTh = "";
  const rawDateStr = extractField(lines, text, "วันที่|Date");
  const dateMatch = (rawDateStr ? rawDateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/) : null) || text.match(/(?:วันที่|Date)?\s*[:\s]?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, "0");
    const month = dateMatch[2].padStart(2, "0");
    let rawYear = parseInt(dateMatch[3], 10);
    dateDisplayTh = `${day}/${month}/${rawYear}`;
    let solarYear = rawYear;
    if (rawYear > 2500) {
      solarYear = rawYear - 543;
    }
    date = `${solarYear}-${month}-${day}`;
  } else {
    const today = new Date();
    date = today.toISOString().substring(0, 10);
    dateDisplayTh = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear() + 543}`;
  }

  // 8. Extract Note (หมายเหตุ)
  let customNote = extractField(lines, text, "หมายเหตุ|Note|เหตุผล");

  const totalHours = shifts.reduce((sum, s) => sum + s.hours, 0);

  return {
    vesselName: vesselName || "ทั่วไป",
    department: department || "ไม่ระบุแผนก",
    employeeName: employeeName || "พนักงาน",
    employeeId: employeeId || "ไม่ระบุรหัส",
    position: position || "-",
    customNote: customNote || "-",
    date,
    dateDisplayTh,
    shifts,
    totalHours
  };
}

export const onRequestOptions = async () => {
  return new Response(null, { headers: corsHeaders, status: 200 });
};

export const onRequestGet = async () => {
  return new Response(JSON.stringify({ 
    status: "ok", 
    service: "LINE OA Webhook Endpoint", 
    ready: true 
  }), { 
    headers: corsHeaders, 
    status: 200 
  });
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const channelSecret = env.LINE_CHANNEL_SECRET || DEFAULT_LINE_CHANNEL_SECRET;
  const channelAccessToken = env.LINE_CHANNEL_ACCESS_TOKEN || DEFAULT_LINE_ACCESS_TOKEN;

  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch (err) {
    return new Response(JSON.stringify({ error: "Cannot read request body" }), { status: 400, headers: corsHeaders });
  }

  const signature = request.headers.get("x-line-signature");

  // Verify HMAC-SHA256 signature
  const isValidSig = await verifyLineSignature(rawBody, signature, channelSecret);
  
  let payload: any = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = {};
  }

  const events = payload.events || [];

  // When LINE Console clicks "Verify", it sends events: []
  if (events.length === 0) {
    return new Response(JSON.stringify({ 
      status: "ok", 
      message: "LINE Webhook verified successfully" 
    }), { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  // If there are real events and signature is invalid, reject
  if (!isValidSig) {
    console.warn("Invalid LINE signature for non-empty events payload");
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401, headers: corsHeaders });
  }

  const db = env.DB;
  if (db) {
    try {
      await db.prepare("ALTER TABLE ot_daily_records ADD COLUMN vesselName TEXT DEFAULT ''").run();
      await db.prepare("ALTER TABLE ot_daily_records ADD COLUMN timeRange TEXT DEFAULT ''").run();
      await db.prepare("ALTER TABLE ot_daily_records ADD COLUMN multiplier REAL DEFAULT 1.0").run();
      await db.prepare("ALTER TABLE ot_daily_records ADD COLUMN source TEXT DEFAULT 'SYSTEM'").run();
      await db.prepare("ALTER TABLE ot_daily_records ADD COLUMN position TEXT DEFAULT ''").run();
    } catch (e) {
      // Columns may already exist
    }
  }

  for (const event of events) {
    if (event.type === "message" && event.message?.type === "text") {
      const text = event.message.text.trim();
      const replyToken = event.replyToken;

      const parsed = parseOtMessage(text);

      if (!parsed || parsed.shifts.length === 0) {
        // Helpful message with template
        await replyLineMessage(replyToken, [{
          type: "text",
          text: `สวัสดีครับ 👋 ระบบบันทึก OT อัตโนมัติ

หากต้องการยื่นขอ OT กรุณาส่งตามรูปแบบตัวอย่างดังนี้ครับ:

ขออนุมัติทำงานล่วงเวลา
M.V."PEDHOULAS TRADER"
รหัสพนักงาน 668126
ชื่อนามสกุล นาย สุทัศน์ พุทธเสน
ตำแหน่ง ช่างเครื่อง
แผนก ปากเรือ
วันที่ 04/10/2569
เวลา 00:00-08:00=8×1
เวลา 08:00-16:00=8×3
หมายเหตุ งานเทียบเรือ`
        }], channelAccessToken);
        continue;
      }
      // ============================================================
      // 1. Employee & Department Validation in D1
      // ============================================================
      let verifiedEmp: any = null;
      let verifiedDept: any = null;

      if (db) {
        try {
          // 1.1 Check Employee in D1
          verifiedEmp = await db.prepare(
            "SELECT id, name, deptId, role FROM employees WHERE id = ? OR id = ?"
          ).bind(parsed.employeeId, parsed.employeeId.padStart(7, "0")).first();

          if (!verifiedEmp) {
            // Check without leading zeros
            const unpaddedId = parsed.employeeId.replace(/^0+/, "");
            if (unpaddedId && unpaddedId !== parsed.employeeId) {
              verifiedEmp = await db.prepare(
                "SELECT id, name, deptId, role FROM employees WHERE id = ?"
              ).bind(unpaddedId).first();
            }
          }

          if (!verifiedEmp) {
            const notFoundMsg = [
              "⚠️ แจ้งเตือน: ไม่พบรหัสพนักงานในระบบ!",
              "━━━━━━━━━━━━━━━━━━━━",
              `🆔 รหัสพนักงาน: ${parsed.employeeId}`,
              "━━━━━━━━━━━━━━━━━━━━",
              "ระบบไม่พบข้อมูลรหัสพนักงานนี้ในฐานข้อมูลพนักงาน",
              "กรุณาตรวจสอบความถูกต้อง หรือติดต่อฝ่ายบุคคล (HR) ครับ"
            ].join("\n");

            await replyLineMessage(replyToken, [{ type: "text", text: notFoundMsg }], channelAccessToken);
            continue;
          }

          // 1.2 Get Department Info from D1
          if (verifiedEmp.deptId) {
            verifiedDept = await db.prepare(
              "SELECT id, name, nameTh FROM departments WHERE id = ? OR name = ? OR nameTh = ?"
            ).bind(verifiedEmp.deptId, verifiedEmp.deptId, verifiedEmp.deptId).first();
          }

          // 1.3 Validate Position & Department
          const normalizeText = (s: string) => (s || "").replace(/\s+/g, "").toLowerCase();
          const normalizeDept = (s: string) => (s || "").replace(/^(แผนก|dept\.?)/i, "").replace(/\s+/g, "").toLowerCase();

          // Position matching
          const hasInputPos = parsed.position && parsed.position !== '-' && parsed.position !== 'ไม่ระบุตำแหน่ง';
          const inputPosNorm = normalizeText(parsed.position);
          const sysPosNorm = normalizeText(verifiedEmp.role);
          const isPosMatch = hasInputPos && (
            inputPosNorm === sysPosNorm ||
            inputPosNorm.includes(sysPosNorm) ||
            sysPosNorm.includes(inputPosNorm)
          );

          // Department matching
          const hasInputDept = parsed.department && parsed.department !== '-' && parsed.department !== 'ไม่ระบุแผนก';
          const inputDeptNorm = normalizeDept(parsed.department);
          const deptCandidates = [
            verifiedEmp.deptId,
            verifiedDept?.id,
            verifiedDept?.name,
            verifiedDept?.nameTh
          ].filter(Boolean);

          const isDeptMatch = hasInputDept && deptCandidates.some((cand: string) => {
            const candNorm = normalizeDept(cand);
            return (
              candNorm === inputDeptNorm ||
              candNorm.includes(inputDeptNorm) ||
              inputDeptNorm.includes(candNorm)
            );
          });

          const displaySysDept = verifiedDept?.nameTh || verifiedDept?.name || verifiedEmp.deptId || "ไม่ระบุ";
          const displaySysRole = verifiedEmp.role || "ไม่ระบุ";

          if (!isPosMatch || !isDeptMatch) {
            const mismatchMsg = [
              "⚠️ แจ้งเตือน: ข้อมูลไม่ตรงกับระบบ!",
              "━━━━━━━━━━━━━━━━━━━━",
              `🆔 รหัสพนักงาน: ${verifiedEmp.id}`,
              `👤 พนักงาน: ${verifiedEmp.name}`,
              "",
              "❌ ข้อมูลที่คุณระบุ:",
              `  • ตำแหน่ง: ${hasInputPos ? parsed.position : "ไม่ได้ระบุ"}`,
              `  • แผนก: ${hasInputDept ? parsed.department : "ไม่ได้ระบุ"}`,
              "",
              "✅ ข้อมูลที่ถูกต้องในระบบ:",
              `  • ตำแหน่ง: ${displaySysRole}`,
              `  • แผนก: ${displaySysDept}`,
              "━━━━━━━━━━━━━━━━━━━━",
              "ระบบปฏิเสธการบันทึก กรุณาระบุตำแหน่งและแผนกให้ตรงกับข้อมูลในระบบ แล้วส่งใหม่อีกครั้งครับ"
            ].join("\n");

            await replyLineMessage(replyToken, [{ type: "text", text: mismatchMsg }], channelAccessToken);
            continue;
          }

          // Use verified official data from system
          parsed.employeeName = verifiedEmp.name || parsed.employeeName;
          parsed.position = displaySysRole;
          parsed.department = displaySysDept;
        } catch (e) {
          console.error("Employee validation error in D1:", e);
        }
      }

      const [yearStr, monthStr] = parsed.date.split("-");
      const recordYear = parseInt(yearStr, 10);
      const recordMonth = parseInt(monthStr, 10);

      // AI / Smart Duplicate Check in D1 Database
      const duplicates: string[] = [];
      if (db) {
        for (const shift of parsed.shifts) {
          try {
            const existing = await db.prepare(
              "SELECT id, otHours, timeRange FROM ot_daily_records WHERE employeeId = ? AND date = ? AND (timeRange = ? OR note LIKE ?)"
            ).bind(
              parsed.employeeId,
              parsed.date,
              shift.timeRange,
              `%${shift.timeRange}%`
            ).first();

            if (existing) {
              duplicates.push(`${shift.timeRange} (${shift.hours} ชม.)`);
            }
          } catch (e) {
            console.error("Duplicate check query error:", e);
          }
        }
      }

      // If duplicate found:
      if (duplicates.length > 0) {
        const warnMessage = [
          "⚠️ แจ้งเตือน: พบรายการขอ OT ซ้ำในระบบ!",
          "━━━━━━━━━━━━━━━━━━━━",
          `👤 พนักงาน: ${parsed.employeeName}`,
          `🆔 รหัส: ${parsed.employeeId}`,
          `📅 วันที่: ${parsed.dateDisplayTh}`,
          "❌ ช่วงเวลาที่บันทึกไปแล้ว:",
          ...duplicates.map(d => `  • ${d}`),
          "━━━━━━━━━━━━━━━━━━━━",
          "ระบบปฏิเสธการบันทึกซ้ำ เพื่อป้องกันข้อมูลซ้ำซ้อนบน Dashboard ครับ"
        ].join("\n");

        await replyLineMessage(replyToken, [{
          type: "text",
          text: warnMessage
        }], channelAccessToken);
        continue;
      }

      // If NOT duplicate: Insert each shift into D1
      if (db) {
        for (let i = 0; i < parsed.shifts.length; i++) {
          const s = parsed.shifts[i];
          const recordId = `LINE-${Date.now()}-${i + 1}`;
          const note = parsed.customNote && parsed.customNote !== '-' ? `${parsed.vesselName} (${s.timeRange} = ${s.hours}x${s.multiplier}) - ${parsed.customNote}` : `${parsed.vesselName} (${s.timeRange} = ${s.hours}x${s.multiplier})`;

          try {
            await db.prepare(`
              INSERT INTO ot_daily_records (
                id, year, month, date, employeeId, employeeName, deptId, shiftCode, otHours, note, vesselName, timeRange, multiplier, source, position
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'LINE_OA', ?)
            `).bind(
              recordId,
              recordYear,
              recordMonth,
              parsed.date,
              parsed.employeeId,
              parsed.employeeName,
              parsed.department,
              s.shiftCode,
              s.hours,
              note,
              parsed.vesselName,
              s.timeRange,
              s.multiplier,
              parsed.position
            ).run();
          } catch (e) {
            console.error("D1 Insert error:", e);
          }
        }
      }

      // Success confirmation message in requested user order
      const successMessage = [
        "✅ บันทึกขออนุมัติ OT เรียบร้อยแล้ว!",
        "━━━━━━━━━━━━━━━━━━━━",
        `🚢 ${parsed.vesselName}`,
        `🆔 รหัสพนักงาน: ${parsed.employeeId}`,
        `👤 ชื่อนามสกุล: ${parsed.employeeName}`,
        `💼 ตำแหน่ง: ${parsed.position}`,
        `🏢 แผนก: ${parsed.department}`,
        `📅 วันที่: ${parsed.dateDisplayTh}`,
        "⏰ เวลา:",
        ...parsed.shifts.map(s => `  • ${s.timeRange} = ${s.hours} ชม. (เรท x${s.multiplier})`),
        `⏱️ รวมชั่วโมง OT: ${parsed.totalHours} ชม.`,
        `📝 หมายเหตุ: ${parsed.customNote}`,
        "━━━━━━━━━━━━━━━━━━━━",
        "🌐 ข้อมูลอัปเดตขึ้น Dashboard 'ประวัติ OT จากกะทำงาน' ทันที"
      ].join("\n");

      await replyLineMessage(replyToken, [{
        type: "text",
        text: successMessage
      }], channelAccessToken);
    }
  }

  return new Response(JSON.stringify({ status: "ok" }), { 
    status: 200, 
    headers: corsHeaders 
  });
};
