const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');

// We want to audit:
// 1. All src/ files
// 2. server.ts
// 3. functions/
// 4. index.html
// 5. public/ (manifest, html, etc.)
// 6. tests/
// 7. scripts/

const filesToScan = [];

function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!['node_modules', '.git', 'dist', '.wrangler', '.agents'].includes(e.name)) {
        collectFiles(full);
      }
    } else {
      if (/\.(tsx|ts|jsx|js|html|css|json|mjs|sql)$/.test(e.name)) {
        filesToScan.push(full);
      }
    }
  }
}

collectFiles(rootDir);

const reportItems = [];

// Emoji & symbol detector regex
const isEmojiOrSymbol = (cp) => {
  // Check emoji ranges
  if (cp >= 0x1F000 && cp <= 0x1FAFF) return true; // Emoticons, pictographs, symbols
  if (cp >= 0x2600 && cp <= 0x27BF) return true;   // Misc symbols, dingbats (⚡, ⚠️, ⚙, ✕, etc.)
  if (cp >= 0x2300 && cp <= 0x23FF) return true;   // Misc technical (⏰, ⏳, etc.)
  if (cp >= 0x2B50 && cp <= 0x2B55) return true;   // Stars, circles
  if (cp >= 0x25A0 && cp <= 0x25FF) return true;   // Geometric shapes (◀, ▶, 🟢, 🔴 etc.)
  if (cp >= 0x2190 && cp <= 0x21FF) return true;   // Arrows (➜ etc)
  if (cp >= 0x2700 && cp <= 0x27BF) return true;   // Dingbats
  if (cp >= 0x2B00 && cp <= 0x2BFF) return true;   // Misc symbols and arrows
  if (cp === 0xFE0E || cp === 0xFE0F) return true; // Variation selectors
  if (cp === 0x200D) return true;                  // ZWJ
  return false;
};

filesToScan.forEach(filePath => {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const charsFound = [];
    for (let i = 0; i < line.length; i++) {
      const cp = line.codePointAt(i);
      if (isEmojiOrSymbol(cp)) {
        const char = String.fromCodePoint(cp);
        charsFound.push({ char, cp: 'U+' + cp.toString(16).toUpperCase(), index: i });
        if (cp > 0xFFFF) i++; // skip low surrogate
      }
    }

    if (charsFound.length > 0) {
      reportItems.push({
        file: relPath,
        line: idx + 1,
        characters: charsFound.map(c => c.char).join(''),
        codePoints: charsFound.map(c => `${c.char} (${c.cp})`).join(', '),
        lineContent: line.trim()
      });
    }
  });
});

console.log(`Total audited lines with emojis/symbols: ${reportItems.length}`);
fs.writeFileSync(path.join(__dirname, 'exhaustive_audit.json'), JSON.stringify(reportItems, null, 2));

// Group by file
const grouped = {};
reportItems.forEach(item => {
  if (!grouped[item.file]) grouped[item.file] = [];
  grouped[item.file].push(item);
});

console.log('Summary by file:');
for (const [file, items] of Object.entries(grouped)) {
  console.log(`- ${file}: ${items.length} occurrences`);
}
