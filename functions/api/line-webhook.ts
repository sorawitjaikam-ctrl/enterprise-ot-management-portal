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

function parseOtMessage(text: string): ParsedOt | null {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Check for shift intervals pattern: e.g. 00:00-08:00=8x1 or 08:00-16:00=8*3
  const shiftRegex = /(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})\s*=\s*(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)/gi;
  const shifts: OtShiftItem[] = [];
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

  // 3. Extract Department
  let department = "";
  const deptMatch = text.match(/แผนก\s*[:\s]?\s*([^\r\n]+)/i);
  if (deptMatch) {
    department = deptMatch[1].trim();
  }

  // 4. Extract Employee Name
  let employeeName = "";
  const nameMatch = text.match(/(?:นาย\s+นาย|นาย|นางสาว|นาง|คุณ)\s*([^\r\n]+)/);
  if (nameMatch) {
    let cleanName = nameMatch[0].trim();
    cleanName = cleanName.replace(/^นาย\s+นาย\s+/g, "นาย ");
    employeeName = cleanName;
  }

  // 5. Extract Employee ID
  let employeeId = "";
  const idMatch = text.match(/(?:รหัส|ID|Emp ID)\s*[:\s]?\s*([A-Za-z0-9\-]+)/i);
  if (idMatch) {
    employeeId = idMatch[1].trim();
  } else {
    const numMatch = text.match(/\b\d{5,7}\b/);
    if (numMatch) employeeId = numMatch[0];
  }

  // 6. Extract Date
  let date = "";
  let dateDisplayTh = "";
  const dateMatch = text.match(/(?:วันที่|Date)\s*[:\s]?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i);
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

  const totalHours = shifts.reduce((sum, s) => sum + s.hours, 0);

  return {
    vesselName: vesselName || "ทั่วไป",
    department: department || "ไม่ระบุแผนก",
    employeeName: employeeName || "พนักงาน",
    employeeId: employeeId || "ไม่ระบุรหัส",
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
          text: `สวัสดีครับ 👋 ระบบบันทึก OT อัตโนมัติ\n\nหากต้องการยื่นขอ OT กรุณาส่งตามรูปแบบตัวอย่างดังนี้ครับ:\n\nขออนุมัติทำงานล่วงเวลา\nM.V."PEDHOULAS TRADER"\nแผนก ปากเรือ\nนาย สุทัศน์ พุทธเสน\nรหัส 668126\nวันที่ 04/10/2569\n00:00-08:00=8×1\n08:00-16:00=8×3`
        }], channelAccessToken);
        continue;
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
          const note = `${parsed.vesselName} (${s.timeRange} = ${s.hours}x${s.multiplier})`;

          try {
            await db.prepare(`
              INSERT INTO ot_daily_records (
                id, year, month, date, employeeId, employeeName, deptId, shiftCode, otHours, note, vesselName, timeRange, multiplier, source
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'LINE_OA')
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
              s.multiplier
            ).run();
          } catch (e) {
            console.error("D1 Insert error:", e);
          }
        }
      }

      // Success confirmation message back to user
      const successMessage = [
        "✅ บันทึกขออนุมัติ OT เรียบร้อยแล้ว!",
        "━━━━━━━━━━━━━━━━━━━━",
        `🚢 เรือ/หน้างาน: ${parsed.vesselName}`,
        `🏢 แผนก: ${parsed.department}`,
        `👤 พนักงาน: ${parsed.employeeName}`,
        `🆔 รหัส: ${parsed.employeeId}`,
        `📅 วันที่ปฏิบัติงาน: ${parsed.dateDisplayTh}`,
        "━━━━━━━━━━━━━━━━━━━━",
        "⏰ รายการเวลาทำงาน:",
        ...parsed.shifts.map(s => `  • ${s.timeRange} = ${s.hours} ชม. (เรท x${s.multiplier})`),
        "━━━━━━━━━━━━━━━━━━━━",
        `⏱️ รวมชั่วโมง OT: ${parsed.totalHours} ชม.`,
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
