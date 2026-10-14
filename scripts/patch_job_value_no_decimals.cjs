const fs = require('fs');
const path = require('path');

function patchJobValueSpreadsheet(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Add formatInt and formatSignedInt helpers if not present
  if (!content.includes('export const formatInt')) {
    const helperCode = `
// Formatter strictly suppressing decimals (whole integers only)
export const formatInt = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return "-";
  return Math.round(Number(val)).toLocaleString("en-US", { maximumFractionDigits: 0 });
};

export const formatSignedInt = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return "-";
  const rounded = Math.round(Number(val));
  return (rounded > 0 ? "+" : "") + rounded.toLocaleString("en-US", { maximumFractionDigits: 0 });
};
`;
    content = content.replace('export default function JobValueSpreadsheetView', helperCode + '\nexport default function JobValueSpreadsheetView');
  }

  // 2. Patch handleFileUpload to round all inputs
  content = content.replace(
    'for (let c = 8; c <= 19; c++) mRev25.push(Number(row[c]) || 0);',
    'for (let c = 8; c <= 19; c++) mRev25.push(Math.round(Number(row[c]) || 0));'
  );
  content = content.replace(
    'for (let c = 21; c <= 32; c++) mProf25.push(Number(row[c]) || 0);',
    'for (let c = 21; c <= 32; c++) mProf25.push(Math.round(Number(row[c]) || 0));'
  );
  content = content.replace(
    'for (let c = 34; c <= 45; c++) mRev26.push(Number(row[c]) || 0);',
    'for (let c = 34; c <= 45; c++) mRev26.push(Math.round(Number(row[c]) || 0));'
  );
  content = content.replace(
    'for (let c = 47; c <= 58; c++) mProf26.push(Number(row[c]) || 0);',
    'for (let c = 47; c <= 58; c++) mProf26.push(Math.round(Number(row[c]) || 0));'
  );
  content = content.replace(
    'leaves2026: Number(row[72]) || 0,',
    'leaves2026: Math.round(Number(row[72]) || 0),'
  );
  content = content.replace(
    'leaves2025: Number(row[73]) || 0,',
    'leaves2025: Math.round(Number(row[73]) || 0),'
  );
  content = content.replace(
    'adjBeforeCap: Number(row[88]) || 0,',
    'adjBeforeCap: Math.round(Number(row[88]) || 0),'
  );
  content = content.replace(
    'adjBaseSalary: Number(row[89]) || 0,',
    'adjBaseSalary: Math.round(Number(row[89]) || 0),'
  );
  content = content.replace(
    'adjCapJv: Number(row[90]) || 0,',
    'adjCapJv: Math.round(Number(row[90]) || 0),'
  );

  // 3. Patch handleExportCsv
  content = content.replace(
    /r\.avgRev2025,\s*r\.avgProf2025,\s*r\.avgRev2026,\s*r\.avgProf2026,\s*r\.profitGrowth,/,
    'Math.round(r.avgRev2025),\n        Math.round(r.avgProf2025),\n        Math.round(r.avgRev2026),\n        Math.round(r.avgProf2026),\n        Math.round(r.profitGrowth),'
  );
  content = content.replace(
    /r\.leaves2025,\s*r\.leaves2026,/,
    'Math.round(r.leaves2025),\n        Math.round(r.leaves2026),'
  );
  content = content.replace(
    /r\.adjBaseSalary,\s*r\.adjCapJv,/,
    'Math.round(r.adjBaseSalary),\n        Math.round(r.adjCapJv),'
  );

  // 4. Patch KPI Cards
  content = content.replace(
    '{totalRev2026.toLocaleString()}',
    '{formatInt(totalRev2026)}'
  );
  content = content.replace(
    'ปี 2568: {totalRev2025.toLocaleString()} บาท/เดือน',
    'ปี 2568: {formatInt(totalRev2025)} บาท/เดือน'
  );
  content = content.replace(
    '{totalProf2026.toLocaleString()}',
    '{formatInt(totalProf2026)}'
  );
  content = content.replace(
    'ปี 2568: {totalProf2025.toLocaleString()} บาท/เดือน',
    'ปี 2568: {formatInt(totalProf2025)} บาท/เดือน'
  );
  content = content.replace(
    '{netGrowth >= 0 ? `+${netGrowth.toLocaleString()}` : netGrowth.toLocaleString()}',
    '{formatSignedInt(netGrowth)}'
  );

  // 5. Patch group header totals
  content = content.replace(
    '<span>รายได้ 26 รวม: <strong>{emps.reduce((s, e) => s + e.avgRev2026, 0).toLocaleString()}</strong> บาท</span>',
    '<span>รายได้ 26 รวม: <strong>{formatInt(emps.reduce((s, e) => s + e.avgRev2026, 0))}</strong> บาท</span>'
  );
  content = content.replace(
    '<span>กำไร 26 รวม: <strong>{emps.reduce((s, e) => s + e.avgProf2026, 0).toLocaleString()}</strong> บาท</span>',
    '<span>กำไร 26 รวม: <strong>{formatInt(emps.reduce((s, e) => s + e.avgProf2026, 0))}</strong> บาท</span>'
  );

  // 6. Patch Table Row numbers
  content = content.replace(
    '{emp.avgRev2025 > 0 ? emp.avgRev2025.toLocaleString() : "-"}',
    '{emp.avgRev2025 > 0 ? formatInt(emp.avgRev2025) : "-"}'
  );
  content = content.replace(
    '{emp.avgProf2025 !== 0 ? emp.avgProf2025.toLocaleString() : "-"}',
    '{emp.avgProf2025 !== 0 ? formatInt(emp.avgProf2025) : "-"}'
  );
  content = content.replace(
    '{emp.avgRev2026 > 0 ? emp.avgRev2026.toLocaleString() : "-"}',
    '{emp.avgRev2026 > 0 ? formatInt(emp.avgRev2026) : "-"}'
  );
  content = content.replace(
    '{emp.avgProf2026 !== 0 ? emp.avgProf2026.toLocaleString() : "-"}',
    '{emp.avgProf2026 !== 0 ? formatInt(emp.avgProf2026) : "-"}'
  );
  content = content.replace(
    '{isPositive ? `+${emp.profitGrowth.toLocaleString()}` : emp.profitGrowth.toLocaleString()}',
    '{formatSignedInt(emp.profitGrowth)}'
  );
  content = content.replace(
    '<td className="px-2.5 py-2.5 text-center font-mono text-slate-600 text-[11px]">{emp.leaves2025}</td>',
    '<td className="px-2.5 py-2.5 text-center font-mono text-slate-600 text-[11px]">{formatInt(emp.leaves2025)}</td>'
  );
  content = content.replace(
    '<td className="px-2.5 py-2.5 text-center font-mono font-bold text-slate-800 text-[11px]">{emp.leaves2026}</td>',
    '<td className="px-2.5 py-2.5 text-center font-mono font-bold text-slate-800 text-[11px]">{formatInt(emp.leaves2026)}</td>'
  );
  content = content.replace(
    '{emp.adjBaseSalary > 0 ? emp.adjBaseSalary.toLocaleString() : "-"}',
    '{emp.adjBaseSalary > 0 ? formatInt(emp.adjBaseSalary) : "-"}'
  );
  content = content.replace(
    '{emp.adjCapJv > 0 ? emp.adjCapJv.toLocaleString() : "-"}',
    '{emp.adjCapJv > 0 ? formatInt(emp.adjCapJv) : "-"}'
  );

  // 7. Patch Drilldown Modal
  content = content.replace(
    '{drilldownEmp.profitGrowthStatus} ({drilldownEmp.profitGrowth > 0 ? `+${drilldownEmp.profitGrowth.toLocaleString()}` : drilldownEmp.profitGrowth.toLocaleString()} บาท)',
    '{drilldownEmp.profitGrowthStatus} ({formatSignedInt(drilldownEmp.profitGrowth)} บาท)'
  );
  content = content.replace(
    'รายได้เฉลี่ย: <strong>{drilldownEmp.avgRev2026.toLocaleString()}</strong>',
    'รายได้เฉลี่ย: <strong>{formatInt(drilldownEmp.avgRev2026)}</strong>'
  );
  content = content.replace(
    'กำไรเฉลี่ย: <strong className="text-emerald-700 font-extrabold">{drilldownEmp.avgProf2026.toLocaleString()}</strong>',
    'กำไรเฉลี่ย: <strong className="text-emerald-700 font-extrabold">{formatInt(drilldownEmp.avgProf2026)}</strong>'
  );
  content = content.replace(
    '{v > 0 ? v.toLocaleString() : "-"}',
    '{v > 0 ? formatInt(v) : "-"}'
  );
  content = content.replace(
    '{v !== 0 ? v.toLocaleString() : "-"}',
    '{v !== 0 ? formatInt(v) : "-"}'
  );
  content = content.replace(
    'รายได้เฉลี่ย: <strong>{drilldownEmp.avgRev2025.toLocaleString()}</strong>',
    'รายได้เฉลี่ย: <strong>{formatInt(drilldownEmp.avgRev2025)}</strong>'
  );
  content = content.replace(
    'กำไรเฉลี่ย: <strong className="text-[#17538F] font-extrabold">{drilldownEmp.avgProf2025.toLocaleString()}</strong>',
    'กำไรเฉลี่ย: <strong className="text-[#17538F] font-extrabold">{formatInt(drilldownEmp.avgProf2025)}</strong>'
  );

  // Handle remaining occurrences in modal (there are 2 rows of rev and 2 of profit in modal)
  content = content.replace(
    '{v > 0 ? v.toLocaleString() : "-"}',
    '{v > 0 ? formatInt(v) : "-"}'
  );
  content = content.replace(
    '{v !== 0 ? v.toLocaleString() : "-"}',
    '{v !== 0 ? formatInt(v) : "-"}'
  );

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Successfully patched ${filePath}`);
}

const targetPath = process.argv[2] || path.resolve(__dirname, '../src/components/JobValueSpreadsheetView.tsx');
patchJobValueSpreadsheet(targetPath);
