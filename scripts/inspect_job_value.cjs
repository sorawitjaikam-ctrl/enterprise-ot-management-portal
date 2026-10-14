const path = require('path');
const XLSX = require(path.join(__dirname, '../node_modules/xlsx'));

const filePath = path.join(__dirname, '../Job value.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('All Sheet names in workbook:');
workbook.SheetNames.forEach((name, i) => console.log(`  [${i}] "${name}"`));

// Let's inspect the first sheet (or any relevant sheets)
workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`\n================ Sheet "${sheetName}" ================`);
  console.log(`Dimensions: ${sheet['!ref']}`);
  for (let i = 0; i < Math.min(6, data.length); i++) {
    console.log(`Row ${i + 1} (${data[i]?.length || 0} cols):`, JSON.stringify(data[i]));
  }
});
