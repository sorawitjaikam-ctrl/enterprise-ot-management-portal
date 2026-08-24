import fs from 'fs';
import path from 'path';

// Regex matching Unicode emoji ranges and presentation forms
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{25B2}\u{25BC}\u{25C0}\u{25B6}]/u;

const scannedDirs = ['src', 'tests', 'public'];
let violationCount = 0;

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist' && entry.name !== '.agents') {
        scan(fullPath);
      }
    } else if (/\.(tsx?|jsx?|html|css|json)$/i.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const matches = line.match(emojiRegex);
        if (matches) {
          console.error(`[EMOJI VIOLATION] ${fullPath}:${idx + 1} -> ${matches[0]} (line: ${line.trim().slice(0, 80)})`);
          violationCount++;
        }
      });
    }
  }
}

for (const d of scannedDirs) {
  scan(d);
}

// Also check index.html
if (fs.existsSync('index.html')) {
  const content = fs.readFileSync('index.html', 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const matches = line.match(emojiRegex);
    if (matches) {
      console.error(`[EMOJI VIOLATION] index.html:${idx + 1} -> ${matches[0]} (line: ${line.trim().slice(0, 80)})`);
      violationCount++;
    }
  });
}

if (violationCount === 0) {
  console.log('✅ ZERO EMOJIS FOUND: Codebase is 100% emoji-free!');
  process.exit(0);
} else {
  console.error(`❌ Total violations found: ${violationCount}`);
  process.exit(1);
}
