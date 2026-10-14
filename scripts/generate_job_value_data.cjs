const path = require('path');
const fs = require('fs');
const XLSX = require(path.join(__dirname, '../node_modules/xlsx'));

const filePath = path.join(__dirname, '../Job value.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

let currentGroup = '';
const records = [];

for (let r = 4; r < data.length; r++) {
  const row = data[r];
  if (!row || row.length === 0) continue;
  
  if (typeof row[0] === 'string' && (row[1] === undefined || row[1] === null || row[1] === '')) {
    currentGroup = row[0].trim();
    continue;
  }
  
  if (row[1]) {
    // 2025 monthly rev (cols 8 to 19), profit (cols 21 to 32)
    const mRev25 = [];
    const mProf25 = [];
    for (let c = 8; c <= 19; c++) mRev25.push(Number(row[c]) || 0);
    for (let c = 21; c <= 32; c++) mProf25.push(Number(row[c]) || 0);

    // 2026 monthly rev (cols 34 to 45), profit (cols 47 to 58)
    const mRev26 = [];
    const mProf26 = [];
    for (let c = 34; c <= 45; c++) mRev26.push(Number(row[c]) || 0);
    for (let c = 47; c <= 58; c++) mProf26.push(Number(row[c]) || 0);

    // Format start date if numeric
    let startDateFormatted = '';
    if (row[7]) {
      if (typeof row[7] === 'number') {
        const d = XLSX.SSF.parse_date_code(row[7]);
        startDateFormatted = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
      } else {
        startDateFormatted = String(row[7]);
      }
    }

    records.push({
      no: Number(row[0]) || records.length + 1,
      empId: String(row[1]).trim(),
      name: String(row[2] || '').trim(),
      dept: String(row[3] || '').trim(),
      group: currentGroup,
      type: String(row[4] || '').trim(),
      level: String(row[5] || '').trim(),
      role: String(row[6] || '').trim(),
      startDate: startDateFormatted,
      
      // 2025
      monthlyRev2025: mRev25,
      monthlyProf2025: mProf25,
      avgRev2025: Math.round(Number(row[20]) || 0),
      avgProf2025: Math.round(Number(row[33]) || 0),

      // 2026
      monthlyRev2026: mRev26,
      monthlyProf2026: mProf26,
      avgRev2026: Math.round(Number(row[46]) || 0),
      avgProf2026: Math.round(Number(row[59]) || 0),

      // Growth
      profitGrowth: Math.round(Number(row[61]) || 0),
      profitGrowthStatus: row[75] || (Number(row[61]) > 0 ? "กำไรต่อยอด" : "ไม่ต่อยอด"),

      // Rankings
      rank2025: row[63] || null,
      rank2025Fraction: row[64] ? String(row[64]).trim() : '',
      rank2026: row[65] || null,
      rank2026Fraction: row[66] ? String(row[66]).trim() : '',

      // Evaluations & leaves
      eval2026: row[67] ? String(row[67]).trim() : '',
      rankSubgroup: row[68] || null,
      rankMainGroup: row[69] || null,
      eval2025: row[70] ? String(row[70]).trim() : '',
      leaves2026: Number(row[72]) || 0,
      leaves2025: Number(row[73]) || 0,

      // Criteria flags
      criteria1_1: row[75] || (Number(row[61]) > 0 ? "กำไรต่อยอด" : "ไม่ต่อยอด"),
      criteria1_2: row[76] || '',
      criteria1_3: row[77] || '',
      criteria1_4: row[78] || '',
      criteria1_5: row[79] || '',
      criteria2_1: row[81] || '',
      criteria2_2: row[82] || '',
      criteria3_1: row[84] || '',
      criteria3_2: row[85] || '',

      // Adjustment summary
      adjStatus: row[87] ? String(row[87]).trim() : (Number(row[61]) > 0 ? "ปรับ" : "ไม่ปรับ"),
      adjBeforeCap: Number(row[88]) || 0,
      adjBaseSalary: Number(row[89]) || 0,
      adjCapJv: Number(row[90]) || 0,
      note: row[91] ? String(row[91]).trim() : ''
    });
  }
}

const outTs = `// Auto-generated from "Job value.xlsx" - reflects exact corporate spreadsheet structure
export interface DetailedJobValueEmployee {
  no: number;
  empId: string;
  name: string;
  dept: string;
  group: string;
  type: string;
  level: string;
  role: string;
  startDate: string;
  
  monthlyRev2025: number[];
  monthlyProf2025: number[];
  avgRev2025: number;
  avgProf2025: number;

  monthlyRev2026: number[];
  monthlyProf2026: number[];
  avgRev2026: number;
  avgProf2026: number;

  profitGrowth: number;
  profitGrowthStatus: string;

  rank2025: number | null;
  rank2025Fraction: string;
  rank2026: number | null;
  rank2026Fraction: string;

  eval2026: string;
  rankSubgroup: any;
  rankMainGroup: any;
  eval2025: string;
  leaves2026: number;
  leaves2025: number;

  criteria1_1: string;
  criteria1_2: string;
  criteria1_3: string;
  criteria1_4: string;
  criteria1_5: string;
  criteria2_1: string;
  criteria2_2: string;
  criteria3_1: string;
  criteria3_2: string;

  adjStatus: string;
  adjBeforeCap: number;
  adjBaseSalary: number;
  adjCapJv: number;
  note: string;
}

export const INITIAL_JOB_VALUE_EXCEL_RECORDS: DetailedJobValueEmployee[] = ${JSON.stringify(records, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/jobValueExcelData.ts'), outTs, 'utf8');
console.log('Saved src/data/jobValueExcelData.ts with', records.length, 'records');
