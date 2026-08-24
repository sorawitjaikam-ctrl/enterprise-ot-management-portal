import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

const targetDirs = ['src', 'public', 'functions', 'scripts', 'tests'];
const targetFiles = ['server.ts', 'index.html', 'schema.sql', 'db.json', 'worker.ts', 'PROJECT.md', 'README.md'];

const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.woff', '.woff2', '.ttf', '.eot', '.lock', '.cjs', '.map'];

function getFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== '.agents') {
        results = results.concat(getFiles(filePath));
      }
    } else {
      const ext = path.extname(filePath).toLowerCase();
      if (!binaryExtensions.includes(ext)) {
        results.push(filePath);
      }
    }
  }
  return results;
}

let allFiles = [];
for (const dir of targetDirs) {
  allFiles = allFiles.concat(getFiles(path.join(projectRoot, dir)));
}
for (const file of targetFiles) {
  const p = path.join(projectRoot, file);
  if (fs.existsSync(p)) allFiles.push(p);
}
allFiles = Array.from(new Set(allFiles));

console.log(`Deep Non-ASCII Character Audit across ${allFiles.length} files...`);

// Allowed non-ASCII ranges:
// - Thai: 0E00-0E7F
// - Latin-1 Supplement (accented letters, quotes, etc.): 0080-00FF
// - General Punctuation: 2000-206F (dash, curly quotes, bullets, etc.)
// - Currency: 20A0-20CF (฿ is in Thai block 0E3F)
// - Arrows / box drawing if used in diagrams: 2190-21FF, 2500-257F

const suspiciousSymbols = [];

for (const filePath of allFiles) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, lineIdx) => {
    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const codePoint = line.codePointAt(charIdx);
      // Skip surrogate second half
      if (codePoint >= 0xDC00 && codePoint <= 0xDFFF) continue;
      
      // If codePoint > 127, check what it is
      if (codePoint > 127) {
        // Thai block: 0E00 to 0E7F
        const isThai = codePoint >= 0x0E00 && codePoint <= 0x0E7F;
        // Standard quotes/dashes:
        const isStandardPunct = (codePoint >= 0x2010 && codePoint <= 0x2026) || codePoint === 0x00A0 || codePoint === 0x00B0 || codePoint === 0x00D7 || codePoint === 0x2212;
        
        if (!isThai && !isStandardPunct) {
          // Check if it's emoji, pictograph, dingbat, symbol, etc.
          suspiciousSymbols.push({
            file: path.relative(projectRoot, filePath),
            line: lineIdx + 1,
            char: String.fromCodePoint(codePoint),
            codePoint: 'U+' + codePoint.toString(16).toUpperCase(),
            snippet: line.trim()
          });
        }
      }
    }
  });
}

console.log(`Found ${suspiciousSymbols.length} non-ASCII / non-Thai symbols:`);
suspiciousSymbols.slice(0, 50).forEach(s => {
  console.log(`[${s.file}:${s.line}] ${s.char} (${s.codePoint}) in: ${s.snippet.substring(0, 80)}`);
});
