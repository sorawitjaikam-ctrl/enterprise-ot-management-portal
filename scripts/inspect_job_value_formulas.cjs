const path = require('path');
const XLSX = require(path.join(__dirname, '../node_modules/xlsx'));

const filePath = path.join(__dirname, '../Job value.xlsx');
const workbook = XLSX.readFile(filePath, { cellFormula: true });
const sheet = workbook.Sheets[workbook.SheetNames[0]];

const range = XLSX.utils.decode_range(sheet['!ref']);
console.log('Range:', sheet['!ref']);

// Sample some formulas from row 6 (first employee)
console.log('--- Formulas for Row 6 (Row index 5) ---');
for (let c = range.s.c; c <= range.e.c; c++) {
  const addr = XLSX.utils.encode_cell({ r: 5, c: c });
  const cell = sheet[addr];
  if (cell && cell.f) {
    console.log(`Cell ${addr} [Col ${c}]: formula = "${cell.f}", value = ${cell.v}`);
  }
}

// Sample some formulas from row 7
console.log('\n--- Formulas for Row 7 (Row index 6) ---');
for (let c = range.s.c; c <= range.e.c; c++) {
  const addr = XLSX.utils.encode_cell({ r: 6, c: c });
  const cell = sheet[addr];
  if (cell && cell.f) {
    console.log(`Cell ${addr} [Col ${c}]: formula = "${cell.f}", value = ${cell.v}`);
  }
}
