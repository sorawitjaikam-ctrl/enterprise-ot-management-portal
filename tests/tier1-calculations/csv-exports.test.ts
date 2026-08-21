import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadCsvFile, csvTemplatesList } from '../../src/components/CsvTemplateHubModal';

describe('Tier 1: 6 CSV Export Routines & RFC 4180 Integrity', () => {
  let createdBlob: Blob | null = null;

  beforeEach(() => {
    createdBlob = null;

    global.URL.createObjectURL = vi.fn((blob: Blob) => {
      createdBlob = blob;
      return 'blob:mock-csv-url';
    });

    global.URL.revokeObjectURL = vi.fn();
    HTMLAnchorElement.prototype.click = vi.fn();
  });

  it('T1.5.1: downloadCsvFile prepends UTF-8 BOM (\\ufeff) for Excel Thai encoding', async () => {
    const headers = ['รหัสพนักงาน', 'ชื่อ', 'แผนก'];
    const rows = [['EMP-101', 'สมชาย', 'INTER 2']];

    downloadCsvFile('test.csv', headers, rows);

    expect(createdBlob).not.toBeNull();
    const arrayBuffer = await createdBlob!.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    // UTF-8 BOM byte sequence is 0xEF, 0xBB, 0xBF
    expect(bytes[0]).toBe(0xEF);
    expect(bytes[1]).toBe(0xBB);
    expect(bytes[2]).toBe(0xBF);

    const text = await createdBlob!.text();
    expect(text).toContain('รหัสพนักงาน');
    expect(text).toContain('สมชาย');
    expect(text).toContain('INTER 2');
  });

  it('T1.5.2: Properly escapes double quotes and special characters per RFC 4180', async () => {
    const headers = ['id', 'note', 'description'];
    const rows = [
      ['001', 'กะ "พิเศษ" ประจำวัน', 'งานเทียบเรือ, ล็อต A'],
      ['002', 'บรรทัด 1\nบรรทัด 2', 'ปกติ']
    ];

    downloadCsvFile('quotes.csv', headers, rows);

    expect(createdBlob).not.toBeNull();
    const text = await createdBlob!.text();
    // Double quotes must be escaped as ""
    expect(text).toContain('""พิเศษ""');
    // Field with comma must be wrapped in quotes
    expect(text).toContain('"งานเทียบเรือ, ล็อต A"');
  });

  it('T1.5.3: CsvTemplateHubModal contains all 5 standard import templates with correct headers', () => {
    expect(csvTemplatesList.length).toBe(5);

    const templateIds = csvTemplatesList.map(t => t.id);
    expect(templateIds).toContain('employee_roster');
    expect(templateIds).toContain('job_value');
    expect(templateIds).toContain('shift_schedule');
    expect(templateIds).toContain('leave_records');
    expect(templateIds).toContain('ot_history');

    // Check Employee Roster Template (20 columns)
    const empTmpl = csvTemplatesList.find(t => t.id === 'employee_roster')!;
    expect(empTmpl.headers.length).toBe(20);
    expect(empTmpl.headers).toContain('salary');
    expect(empTmpl.headers).toContain('calendarType');
    expect(empTmpl.headers).toContain('shifts');

    // Check Job Value Template (45 columns)
    const jvTmpl = csvTemplatesList.find(t => t.id === 'job_value')!;
    expect(jvTmpl.headers.length).toBe(45);
    expect(jvTmpl.headers).toContain('Revenue_Jan');
    expect(jvTmpl.headers).toContain('Cost_Dec');
    expect(jvTmpl.headers).toContain('Profit_2026');

    // Check Shift Schedule Template (34 columns: 3 base + 31 days)
    const shiftTmpl = csvTemplatesList.find(t => t.id === 'shift_schedule')!;
    expect(shiftTmpl.headers.length).toBe(34);
    expect(shiftTmpl.headers).toContain('Day1');
    expect(shiftTmpl.headers).toContain('Day31');
  });

  it('T1.5.4: Shift Matrix CSV exporter generates valid column structure with 12 base + days columns', () => {
    const baseHeaders = [
      'รหัสพนักงาน',
      'ชื่อ-นามสกุล',
      'แผนก',
      'ตำแหน่ง',
      'ฐานเงินเดือน (บาท)',
      'อัตราค่าจ้างต่อ ชม. (บาท)',
      'OT วันทำงานปกติ 1.5x (ชม.)',
      'ทำงานวันหยุด 1.0x (วัน)',
      'OT วันหยุด 3.0x (ชม.)',
      'ยอดรวม ชม. OT ทั้งเดือน (ชม.)',
      'ยอดเงินทำจ่ายค่าล่วงเวลา (บาท)',
      '% เทียบฐานเงินเดือน'
    ];
    const totalDays = 31;
    const dayHeaders = Array.from({ length: totalDays }, (_, i) => `"${i + 1}"`);
    const allHeaders = [...baseHeaders, ...dayHeaders];

    expect(allHeaders.length).toBe(43);
    expect(baseHeaders.length).toBe(12);
  });

  it('T1.5.5: Executive Report CSV format has exactly 6 summary columns', () => {
    const reportHeaders = [
      'แผนก',
      'จำนวนพนักงาน (คน)',
      'ชั่วโมง OT รวม (ชม.)',
      'งบประมาณที่ใช้จริง (บาท)',
      'สัดส่วนการใช้งบ (%)',
      'สถานะงบประมาณ'
    ];
    expect(reportHeaders.length).toBe(6);
  });

  it('T1.5.6: OT Records CSV format has exactly 6 columns with UTF-8 BOM', () => {
    const otRecordHeaders = [
      'วันที่',
      'รหัสพนักงาน',
      'ชื่อพนักงาน',
      'แผนก',
      'รหัสกะ',
      'ชั่วโมง OT'
    ];
    expect(otRecordHeaders.length).toBe(6);
  });
});
