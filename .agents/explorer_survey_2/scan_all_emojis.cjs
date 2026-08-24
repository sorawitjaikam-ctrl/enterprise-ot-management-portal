const fs = require('fs');
const path = require('path');

// Regex for emojis and unicode symbol pictographs
// Using Unicode property escapes and explicit code point ranges
const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u{1F000}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{2300}-\u{23FF}]|[\u{2B50}-\u{2B55}]|[\u{200D}]|[\u{FE0E}-\u{FE0F}]|[\u{25A0}-\u{25FF}]|[\u{2190}-\u{21FF}]|[\u{2700}-\u{27BF}]|[\u{2900}-\u{297F}]|[\u{2B00}-\u{2BFF}])/gu;

// Characters to exclude if purely technical or standard mathematical/typography:
// e.g. standard dashes, single quotes, etc.
// But we want to flag symbols like ✕, ◀, ▶, ➜, ⚡, 🏖️, 👤, 🟢, 🔴, 🏷️, 🌙, ⚠️, 🔄, ✅, 💡, 📊, 🚢, etc.

const rootDir = path.resolve(__dirname, '../../');
const results = [];

function scanFile(filePath) {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  if (relPath.startsWith('.agents/') && !relPath.startsWith('.agents/ORIGINAL_REQUEST.md')) {
    return; // skip agent metadata logs
  }
  if (relPath.startsWith('node_modules/') || relPath.startsWith('.git/') || relPath.startsWith('dist/') || relPath.startsWith('.wrangler/')) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, lineIdx) => {
    // Look for emojis
    const matches = [];
    let match;
    const regex = new RegExp(emojiRegex);
    while ((match = regex.exec(line)) !== null) {
      matches.push({
        char: match[0],
        index: match.index,
        codePoint: 'U+' + match[0].codePointAt(0).toString(16).toUpperCase()
      });
    }

    if (matches.length > 0) {
      results.push({
        file: relPath,
        line: lineIdx + 1,
        matches: matches.map(m => m.char),
        codePoints: matches.map(m => m.codePoint),
        content: line.trim()
      });
    }
  });
}

function traverse(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist' && entry.name !== '.wrangler') {
        traverse(full);
      }
    } else {
      if (/\.(tsx|ts|jsx|js|html|css|json|md|sql|mjs)$/.test(entry.name)) {
        scanFile(full);
      }
    }
  }
}

traverse(rootDir);

console.log(`Found ${results.length} lines with potential emojis/symbols across project.`);
fs.writeFileSync(path.join(__dirname, 'all_detected_emojis.json'), JSON.stringify(results, null, 2));

// Summary per file
const fileCount = {};
results.forEach(r => {
  fileCount[r.file] = (fileCount[r.file] || 0) + 1;
});
console.log('Per file count:', JSON.stringify(fileCount, null, 2));
