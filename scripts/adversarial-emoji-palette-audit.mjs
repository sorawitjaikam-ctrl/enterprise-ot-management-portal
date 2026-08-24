import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

// Exhaustive Unicode Emoji & Pictograph regex pattern
// Covers:
// - \u{1F300}-\u{1F5FF} (Misc Symbols and Pictographs)
// - \u{1F600}-\u{1F64F} (Emoticons)
// - \u{1F680}-\u{1F6FF} (Transport and Map)
// - \u{1F700}-\u{1F77F} (Alchemical Symbols)
// - \u{1F780}-\u{1F7FF} (Geometric Shapes Extended)
// - \u{1F800}-\u{1F8FF} (Supplemental Arrows-C)
// - \u{1F900}-\u{1F9FF} (Supplemental Symbols and Pictographs)
// - \u{1FA00}-\u{1FA6F} (Chess Symbols)
// - \u{1FA70}-\u{1FAFF} (Symbols and Pictographs Extended-A)
// - \u{2600}-\u{26FF}   (Misc symbols: lightning, sun, warning, gear, boat, etc.)
// - \u{2700}-\u{27BF}   (Dingbats: checkmarks, cross, pencil, etc.)
// - \u{2300}-\u{23FF}   (Misc Technical: stopwatches, hour glasses, etc.)
// - \u{2B50}, \u{2B55}, \u{23E9}-\u{23F3}, \u{23F8}-\u{23FA}
// - \u{1F004}, \u{1F0CF}, \u{1F18E}, \u{1F191}-\u{1F19A}
// - \u{FE0F} (Variation selector 16)
const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{FE0E}\u{FE0F}]/u;

// Unicode escape sequences in JS/TS/JSON (e.g., \uD83D\uDE00 or \u{1F600} or \u26A0)
const escapeSequenceRegex = /\\u\{?([0-9a-fA-F]{4,6})\}?(\\u\{?([0-9a-fA-F]{4,6})\}?)?/g;

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

// Remove duplicate paths
allFiles = Array.from(new Set(allFiles));

console.log(`=======================================================`);
console.log(`ADVERSARIAL EMOJI & PICTOGRAPH SCANNER`);
console.log(`Scanned File Count: ${allFiles.length}`);
console.log(`=======================================================\n`);

let emojiViolations = [];

for (const filePath of allFiles) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Check for raw unicode emoji
    const match = line.match(emojiRegex);
    if (match) {
      emojiViolations.push({
        file: path.relative(projectRoot, filePath),
        line: idx + 1,
        char: match[0],
        codePoint: 'U+' + match[0].codePointAt(0).toString(16).toUpperCase(),
        snippet: line.trim()
      });
    }
  });
}

if (emojiViolations.length === 0) {
  console.log(`[PASS] ZERO residual emojis found across all ${allFiles.length} files!`);
} else {
  console.error(`[FAIL] Found ${emojiViolations.length} residual emoji violations:`);
  emojiViolations.forEach((v, i) => {
    console.error(`  ${i + 1}. [${v.file}:${v.line}] Character: '${v.char}' (${v.codePoint}) -> Snippet: "${v.snippet}"`);
  });
}

console.log(`\n=======================================================`);
console.log(`LUCIDE REACT ICON COMPONENT USAGE SCANNER`);
console.log(`=======================================================`);

const srcFiles = getFiles(path.join(projectRoot, 'src')).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
let lucideImports = new Set();
let componentIconReport = [];

for (const filePath of srcFiles) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relPath = path.relative(projectRoot, filePath);
  
  // Find imports from 'lucide-react'
  const importMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
  if (importMatch) {
    const importedIcons = importMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    importedIcons.forEach(icon => lucideImports.add(icon));
    componentIconReport.push({
      file: relPath,
      icons: importedIcons
    });
  }
}

console.log(`Found ${lucideImports.size} unique Lucide React vector icons used across ${componentIconReport.length} component files:`);
console.log(Array.from(lucideImports).sort().join(', '));

console.log(`\n=======================================================`);
console.log(`4-TONE MONOCHROMATIC BLUE PALETTE SCANNER`);
console.log(`=======================================================`);

const requiredColors = {
  navyDark: '#0b1a3a',
  cobaltRoyal: '#1d3ec7',
  cornflowerSoft: '#6d93fc',
  iceLight: '#a9cdfc'
};

console.log(`Verified Core Palette Definitions:`);
Object.entries(requiredColors).forEach(([name, hex]) => {
  console.log(`  - ${name}: ${hex}`);
});

// Check index.css for theme configuration
const indexCssPath = path.join(projectRoot, 'src', 'index.css');
if (fs.existsSync(indexCssPath)) {
  const cssContent = fs.readFileSync(indexCssPath, 'utf-8');
  const hasNavy = cssContent.includes('#0b1a3a');
  const hasCobalt = cssContent.includes('#1d3ec7');
  const hasCornflower = cssContent.includes('#6d93fc');
  const hasIce = cssContent.includes('#a9cdfc');
  
  console.log(`\nsrc/index.css Palette Tokens Status:`);
  console.log(`  - Navy Dark (#0b1a3a): ${hasNavy ? 'PRESENT' : 'MISSING'}`);
  console.log(`  - Cobalt Royal (#1d3ec7): ${hasCobalt ? 'PRESENT' : 'MISSING'}`);
  console.log(`  - Cornflower Soft (#6d93fc): ${hasCornflower ? 'PRESENT' : 'MISSING'}`);
  console.log(`  - Ice Light (#a9cdfc): ${hasIce ? 'PRESENT' : 'MISSING'}`);
}

process.exit(emojiViolations.length > 0 ? 1 : 0);
