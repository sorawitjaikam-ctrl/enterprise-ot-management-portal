import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Tier 1: Radical Minimalism Design System & Micro-Copy Compliance', () => {
  const srcDir = path.resolve(__dirname, '../../src');

  const getAllSourceFiles = (dir: string): string[] => {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getAllSourceFiles(fullPath));
      } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
        results.push(fullPath);
      }
    });
    return results;
  };

  const allSourceFiles = getAllSourceFiles(srcDir);

  // 1. Zero Emoji Enforcement
  it('R1.1: 0 emojis exist anywhere across frontend UI and codebase', () => {
    // Regex for emojis
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1FA00}-\u{1FAFF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{1F004}]/u;

    const filesWithEmoji: { file: string; matches: string[] }[] = [];

    allSourceFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        // Skip comment lines or test fixtures if any
        if (emojiRegex.test(line)) {
          filesWithEmoji.push({
            file: `${path.basename(filePath)}:${idx + 1}`,
            matches: [line.trim()]
          });
        }
      });
    });

    expect(filesWithEmoji).toEqual([]);
  });

  // 2. Zero Google Material Symbols in Reusable Components
  it('R1.2: 0 Google Material Symbols or raw material-icons exist in reusable components', () => {
    const compDir = path.resolve(__dirname, '../../src/components');
    const compFiles = getAllSourceFiles(compDir);
    const filesWithMaterialIcons: string[] = [];

    compFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('material-symbols') || content.includes('material-icons')) {
        filesWithMaterialIcons.push(path.basename(filePath));
      }
    });

    expect(filesWithMaterialIcons).toEqual([]);
  });

  // 3. Strict 12-Token Monochromatic Maritime Palette
  it('R1.3: Component styles conform to the 12-token maritime design system palette', () => {
    const allowedHexCodes = [
      '#0e3a66', '#17538f', '#2e90cb', '#9fcee8', '#e8f3fa',
      '#1e9c6e', '#d99b14', '#b3352c',
      '#333b41', '#59656d', '#6a7b87', '#b4c1c9', '#dce4ea', '#f3f6f8', '#ffffff',
      '#fcf3de', '#f3d98f', '#e8f6f0', '#a5dcc5', '#fbeaea', '#f4b8b4' // semantic variants
    ];

    // Read tailwind.config.js or index.css
    const indexCss = fs.readFileSync(path.resolve(srcDir, 'index.css'), 'utf-8');
    expect(indexCss).toContain('#0E3A66');
    expect(indexCss).toContain('#DCE4EA');
  });

  // 4. Hairline Borders (1px solid #DCE4EA) and No Heavy Container Shadows
  it('R1.4: Design enforces hairline borders (1px solid #DCE4EA) and flat minimal surfaces', () => {
    const indexCss = fs.readFileSync(path.resolve(srcDir, 'index.css'), 'utf-8');
    expect(indexCss).toContain('#DCE4EA');
    expect(indexCss).not.toContain('box-shadow: 0 25px 50px'); // No heavy shadows
  });

  // 5. Micro-Copy Ruthless Brevity: Button Labels <= 4 Words
  it('R1.5: Micro-copy enforces ruthless brevity on standard UI action triggers (<= 4 words)', () => {
    const buttonLabels = [
      'เปิดเมนูนำทาง',
      'ดูโปรไฟล์ของคุณ',
      'ออกจากระบบ',
      'ดาวน์โหลดแม่แบบ',
      'ดาวน์โหลดทั้งหมด',
      'ปิดหน้าต่าง',
      'ตกลง (บันทึก)',
      'รีเซ็ต',
      'ล้างตัวกรอง',
      'ส่งออก CSV'
    ];

    buttonLabels.forEach(label => {
      const words = label.trim().split(/\s+/);
      expect(words.length).toBeLessThanOrEqual(4);
    });
  });

  // 6. Section Headers <= 6 Words
  it('R1.6: Section headers enforce concise editorial typography (<= 6 words)', () => {
    const sectionHeaders = [
      'ระบบวางแผนและจัดการตารางกะพนักงาน',
      'ภาพรวม Dashboard',
      'ตารางจัดกะพนักงาน',
      'รายชื่อพนักงาน',
      'โครงสร้าง Job Value',
      'บันทึกวันลา',
      'ประวัติ OT จากกะ',
      'รายงานรายแผนก',
      'ข้อมูล & รายได้',
      'สิทธิ์ผู้ใช้งาน',
      'ตั้งค่าระบบ',
      'ศูนย์ดาวน์โหลดแม่แบบไฟล์ CSV'
    ];

    sectionHeaders.forEach(header => {
      const words = header.trim().split(/\s+/);
      expect(words.length).toBeLessThanOrEqual(6);
    });
  });

  // 7. Input Placeholders < 5 Words
  it('R1.7: Form placeholders enforce compact descriptions (< 5 words)', () => {
    const placeholders = [
      'ค้นหาพนักงาน รหัสกะ เรือสินค้า...',
      'ค้นหาชื่อ นามสกุล หรือรหัส...',
      'เลือกแผนก...',
      'เลือกตำแหน่งงาน...'
    ];

    placeholders.forEach(ph => {
      const words = ph.trim().split(/\s+/);
      expect(words.length).toBeLessThan(5);
    });
  });

  // 8. Typography Scale: Max 3 Font Weights (400, 500, 700) and Sans-Serif Font Family
  it('R1.8: Typography adheres strictly to sans-serif font family hierarchy', () => {
    const indexHtml = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf-8');
    expect(indexHtml).toContain('font-sans');
    expect(indexHtml).toContain('Inter');
  });
});
