const path = require('path');
const XLSX = require(path.join(__dirname, '../node_modules/xlsx'));

const filePath = path.join(__dirname, '../Job value.xlsx');
const workbook = XLSX.readFile(filePath, { cellStyles: true, cellFormula: true, cellDates: true });
const sheet = workbook.Sheets[workbook.SheetNames[0]];

const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('--- Row 1 ---');
console.log(data[0]?.filter(Boolean));

console.log('\n--- Row 2 ---');
console.log(data[1]?.filter(Boolean));

console.log('\n--- Row 3 ---');
console.log(data[2]?.filter(Boolean));

console.log('\n--- Row 4 (Column Headers) ---');
data[3].forEach((col, idx) => {
  if (col !== undefined && col !== null && col !== '') {
    // Check if col is excel date
    let dateStr = '';
    if (typeof col === 'number' && col > 40000 && col < 50000) {
      const d = XLSX.SSF.parse_date_code(col);
      dateStr = ` -> (${d.y}-${d.m}-${d.d})`;
    }
    console.log(`Col ${idx} [${XLSX.utils.encode_col(idx)}]: "${String(col).replace(/\r\n/g, ' ')}"${dateStr} (Group: ${data[2]?.[idx] || ''})`);
  }
});

console.log('\n--- Merges ---');
console.log(sheet['!merges']?.slice(0, 30));

console.log('\n--- Distinct Sections/Categories in Rows (Column 0 / 1 / 2) ---');
data.forEach((row, i) => {
  if (row && row.length > 0 && typeof row[0] === 'string' && isNaN(Number(row[0]))) {
    console.log(`Row ${i + 1}: Section Header -> "${row[0]}"`);
  }
});
