const path = require('path');
const XLSX = require(path.join(__dirname, '../node_modules/xlsx'));

const filePath = path.join(__dirname, '../Job value.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('Total rows in sheet:', data.length);

let currentGroup = '';
const employees = [];

for (let r = 4; r < data.length; r++) {
  const row = data[r];
  if (!row || row.length === 0) continue;
  
  // If it's a section header
  if (typeof row[0] === 'string' && (row[1] === undefined || row[1] === null || row[1] === '')) {
    currentGroup = row[0].trim();
    console.log(`\n=== GROUP: ${currentGroup} (Row ${r + 1}) ===`);
    continue;
  }
  
  if (row[1]) {
    const emp = {
      rowIdx: r + 1,
      group: currentGroup,
      no: row[0],
      empId: row[1],
      name: row[2],
      dept: row[3],
      type: row[4],
      level: row[5],
      role: row[6],
      startDate: row[7],
      rev2025Avg: Math.round(row[20] || 0),
      prof2025Avg: Math.round(row[33] || 0),
      rev2026Avg: Math.round(row[46] || 0),
      prof2026Avg: Math.round(row[59] || 0),
      profitGrowth: Math.round(row[61] || 0),
      rank67: row[63],
      rank67Fraction: row[64],
      rank69: row[65],
      rank69Fraction: row[66],
      eval69: row[67],
      eval68: row[70],
      leaves69: row[72],
      leaves68: row[73],
      criteria1_1: row[75],
      adjStatus: row[87],
      adjBeforeCap: row[88],
      adjBaseSalary: row[89],
      adjCapJv: row[90],
      note: row[91]
    };
    employees.push(emp);
    console.log(`[${emp.empId}] ${emp.name} | Dept: ${emp.dept} | Role: ${emp.role} | Rev25: ${emp.rev2025Avg.toLocaleString()} | Prof25: ${emp.prof2025Avg.toLocaleString()} | Rev26: ${emp.rev2026Avg.toLocaleString()} | Prof26: ${emp.prof2026Avg.toLocaleString()} | Diff: ${emp.profitGrowth.toLocaleString()} | Rank69: ${emp.rank69Fraction} | ${emp.criteria1_1}`);
  }
}

console.log(`\nTotal parsed employees: ${employees.length}`);
