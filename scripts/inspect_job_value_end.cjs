const path = require('path');
const XLSX = require(path.join(__dirname, '../node_modules/xlsx'));

const filePath = path.join(__dirname, '../Job value.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

for (let r = 40; r < data.length; r++) {
  console.log(`Row ${r + 1}:`, JSON.stringify(data[r]?.slice(0, 15)));
}
