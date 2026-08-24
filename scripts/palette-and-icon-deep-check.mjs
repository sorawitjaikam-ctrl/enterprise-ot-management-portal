import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

const srcDir = path.join(projectRoot, 'src');

function getTsxFiles(dir) {
  let files = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files = files.concat(getTsxFiles(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = getTsxFiles(srcDir);

console.log(`Analyzing color usage & Lucide icons across ${files.length} TypeScript/React files...`);

// Rainbow color keywords that might indicate un-migrated styling if used as primary decorative styling
const rainbowColors = [
  'purple-', 'violet-', 'fuchsia-', 'pink-', 'orange-', 'cyan-', 'amber-', 'lime-', 'yellow-'
];

let rainbowOccurrences = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const relPath = path.relative(projectRoot, file);

  lines.forEach((line, idx) => {
    // Check for inline rainbow styles
    for (const color of rainbowColors) {
      if (line.includes(color) && !line.includes('//') && !line.includes('*')) {
        rainbowOccurrences.push({
          file: relPath,
          line: idx + 1,
          color,
          snippet: line.trim()
        });
      }
    }
  });
}

console.log(`\nFound ${rainbowOccurrences.length} lines with potentially extraneous color classes:`);
rainbowOccurrences.slice(0, 30).forEach(r => {
  console.log(`[${r.file}:${r.line}] (${r.color}) -> ${r.snippet.substring(0, 100)}`);
});
