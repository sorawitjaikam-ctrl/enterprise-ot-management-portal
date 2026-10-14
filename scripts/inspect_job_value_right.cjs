const path = require('path');
const XLSX = require(path.join(__dirname, '../node_modules/xlsx'));

const filePath = path.join(__dirname, '../Job value.xlsx');
const workbook = XLSX.readFile(filePath, { cellFormula: true });
const sheet = workbook.Sheets[workbook.SheetNames[0]];

const range = XLSX.utils.decode_range(sheet['!ref']);
console.log('Columns: from 0 to', range.e.c);

// Print all non-empty columns with their header names
const headersRow3 = [];
const headersRow4 = [];
for (let c = range.s.c; c <= range.e.c; c++) {
  const r3 = sheet[XLSX.utils.encode_cell({ r: 2, c: c })]?.v;
  const r4 = sheet[XLSX.utils.encode_cell({ r: 3, c: c })]?.v;
  headersRow3[c] = r3 || '';
  headersRow4[c] = r4 || '';
}

for (let c = 60; c <= range.e.c; c++) {
  const cellR6 = sheet[XLSX.utils.encode_cell({ r: 5, c: c })];
  const colLetter = XLSX.utils.encode_col(c);
  console.log(`Col ${c} [${colLetter}] | Group: "${headersRow3[c]}" | Header: "${String(headersRow4[c]).replace(/\r\n/g, ' ')}" | R6 Val: ${cellR6?.v} | R6 Form: ${cellR6?.f || ''}`);
}
