import React from 'react';
import { Download, FileSpreadsheet, X, Info } from 'lucide-react';

interface CsvTemplateHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const downloadCsvFile = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const escapeCsvField = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvLines = [
    headers.map(escapeCsvField).join(","),
    ...rows.map(row => row.map(escapeCsvField).join(","))
  ];

  const csvContent = "\uFEFF" + csvLines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const csvTemplatesList = [
  {
    id: "employee_roster",
    title: "1. แม่แบบรายชื่อพนักงาน (Employee Roster)",
    desc: "ไฟล์แม่แบบสำหรับเพิ่ม/แก้ไขรายชื่อพนักงาน ข้อมูลเงินเดือน สิทธิ์ OT วันเริ่มงาน และประเภทปฏิทิน",
    filename: "employee_roster_template.csv",
    badge: "พนักงาน & เงินเดือน",
    badgeBg: "bg-[#E8F3FA] text-[#0E3A66] border-[#9FCEE8]",
    headers: [
      "id", "prefix", "firstName", "lastName", "nickname", "role", "deptId", "division",
      "salary", "targetOt", "birthday", "age", "startDate", "tenure", "probationDate",
      "calendarType", "employmentStatus", "resignationDate", "groupName", "shifts"
    ],
    sampleRows: [
      [
        "EMP-101", "นาย", "สมชาย", "สายงาน", "ชาย", "ผู้ควบคุมงานขนถ่ายสินค้า", "inter2", "ฝ่ายการผลิต",
        25000, 48, "1990-05-15", 36, "2020-01-15", "6 ปี", "2020-05-15",
        "ปฏิทินกะ 4-on-2-off", "Active", "", "", '["M12","M12","A12","A12","OFF","OFF"]'
      ],
      [
        "EMP-102", "นางสาว", "วิภา", "รักงาน", "ภา", "พนักงานขับเครน", "inter3", "ฝ่ายปฏิบัติการ",
        22000, 48, "1993-08-20", 33, "2021-03-01", "5 ปี", "2021-07-01",
        "ปฏิทินกะ 4-on-2-off", "Active", "", "", '["A12","A12","N12","N12","OFF","OFF"]'
      ]
    ]
  },
  {
    id: "job_value",
    title: "2. แม่แบบคุณค่าตำแหน่งงาน & ผลตอบแทน (Job Value & Financials)",
    desc: "ไฟล์แม่แบบสำหรับนำเข้าค่า Revenue, Cost, Profit รายเดือนและสะสมรายปีของพนักงาน",
    filename: "job_value_financials_template.csv",
    badge: "คุณค่าตำแหน่งงาน & การเงิน",
    badgeBg: "bg-[#E8F6F0] text-[#1E9C6E] border-[#A5DCC5]",
    headers: [
      "empId", "empName", "Department", "Position", "Status",
      "Avg_Revenue", "Avg_Cost", "Profit_2026", "Profit_2025",
      "Revenue_Jan", "Revenue_Feb", "Revenue_Mar", "Revenue_Apr", "Revenue_May", "Revenue_Jun", "Revenue_Jul", "Revenue_Aug", "Revenue_Sep", "Revenue_Oct", "Revenue_Nov", "Revenue_Dec",
      "Cost_Jan", "Cost_Feb", "Cost_Mar", "Cost_Apr", "Cost_May", "Cost_Jun", "Cost_Jul", "Cost_Aug", "Cost_Sep", "Cost_Oct", "Cost_Nov", "Cost_Dec",
      "Profit_Jan", "Profit_Feb", "Profit_Mar", "Profit_Apr", "Profit_May", "Profit_Jun", "Profit_Jul", "Profit_Aug", "Profit_Sep", "Profit_Oct", "Profit_Nov", "Profit_Dec"
    ],
    sampleRows: [
      [
        "EMP-101", "สมชาย สายงาน", "INTER 2", "ผู้ควบคุมงานขนถ่ายสินค้า", "Active",
        450000, 260000, 2280000, 2100000,
        450000, 450000, 450000, 450000, 450000, 450000, 450000, 450000, 450000, 450000, 450000, 450000,
        260000, 260000, 260000, 260000, 260000, 260000, 260000, 260000, 260000, 260000, 260000, 260000,
        190000, 190000, 190000, 190000, 190000, 190000, 190000, 190000, 190000, 190000, 190000, 190000
      ]
    ]
  },
  {
    id: "shift_schedule",
    title: "3. แม่แบบตารางกะเทียบเรือรายเดือน (Shift Schedule Roster)",
    desc: "ไฟล์แม่แบบสำหรับวางแผนและจัดตารางกะปฏิบัติงานพนักงานประจำเดือน (Day1 - Day31)",
    filename: "shift_schedule_roster_template.csv",
    badge: "ตารางกะเทียบเรือ",
    badgeBg: "bg-[#E8F3FA] text-[#17538F] border-[#9FCEE8]",
    headers: [
      "empId", "empName", "deptId",
      "Day1", "Day2", "Day3", "Day4", "Day5", "Day6", "Day7", "Day8", "Day9", "Day10",
      "Day11", "Day12", "Day13", "Day14", "Day15", "Day16", "Day17", "Day18", "Day19", "Day20",
      "Day21", "Day22", "Day23", "Day24", "Day25", "Day26", "Day27", "Day28", "Day29", "Day30", "Day31"
    ],
    sampleRows: [
      [
        "EMP-101", "สมชาย สายงาน", "inter2",
        "M12", "M12", "A12", "A12", "OFF", "OFF", "N12", "N12", "M12", "M12",
        "OFF", "OFF", "A12", "A12", "N12", "N12", "OFF", "OFF", "M12", "M12",
        "A12", "A12", "OFF", "OFF", "N12", "N12", "M12", "M12", "OFF", "OFF", "M12"
      ]
    ]
  },
  {
    id: "leave_records",
    title: "4. แม่แบบประวัติวันลาพนักงาน (Leave Records)",
    desc: "ไฟล์แม่แบบสำหรับบันทึกการลางาน (ลาป่วย, ลากิจ, ลาพักร้อน) และจำนวนวันลาสะสม",
    filename: "leave_records_template.csv",
    badge: "ประวัติการลา",
    badgeBg: "bg-[#FCF3DE] text-[#D99B14] border-[#F3D98F]",
    headers: ["id", "empId", "empName", "deptId", "leaveType", "startDate", "endDate", "totalDays", "reason", "status"],
    sampleRows: [
      ["LV-001", "EMP-101", "สมชาย สายงาน", "inter2", "ลากิจ", "2026-08-10", "2026-08-11", 2, "ทำธุระส่วนตัว", "อนุมัติ"],
      ["LV-002", "EMP-102", "วิภา รักงาน", "inter3", "ลาป่วย", "2026-08-15", "2026-08-15", 1, "มีไข้สูง", "อนุมัติ"]
    ]
  },
  {
    id: "ot_history",
    title: "5. แม่แบบประวัติการทำงาน OT หน้าท่า (OT Daily Records)",
    desc: "ไฟล์แม่แบบสำหรับนำเข้าประวัติชั่วโมง OT และกะปฏิบัติงานรายวันของพนักงาน",
    filename: "ot_daily_records_template.csv",
    badge: "ประวัติ OT",
    badgeBg: "bg-[#F3F6F8] text-[#59656D] border-[#DCE4EA]",
    headers: ["id", "date", "employeeId", "employeeName", "deptId", "shiftCode", "otHours", "note"],
    sampleRows: [
      ["OT-001", "2026-08-01", "EMP-101", "สมชาย สายงาน", "inter2", "M12", 4, "คุมงานเทียบเรือ MV Double A"],
      ["OT-002", "2026-08-01", "EMP-102", "วิภา รักงาน", "inter3", "A12", 4, "ยกตู้สินค้าขึ้นเรือ Tug Boat"]
    ]
  }
];

export default function CsvTemplateHubModal({ isOpen, onClose }: CsvTemplateHubModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0E3A66]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded border border-[#DCE4EA] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-lg flex flex-col font-sans animate-in fade-in zoom-in-95 duration-100">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#DCE4EA] bg-white text-[#0E3A66] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E8F3FA] border border-[#DCE4EA] rounded text-[#0E3A66]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0E3A66]">ศูนย์ดาวน์โหลดแม่แบบไฟล์ CSV (CSV Template Hub)</h2>
              <p className="text-xs text-[#59656D]">แม่แบบ CSV มาตรฐานสำหรับนำเข้าข้อมูลในระบบ</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#6A7B87] hover:text-[#0E3A66] hover:bg-[#F3F6F8] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh] bg-[#F3F6F8]">
          <div className="bg-[#E8F3FA] border border-[#9FCEE8] rounded p-3 flex items-start gap-2.5 text-xs text-[#0E3A66]">
            <Info className="w-4 h-4 text-[#2E90CB] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">คำแนะนำการใช้งาน:</span>
              <p className="mt-0.5 text-[#59656D]">
                ดาวน์โหลดแม่แบบ `.csv` แล้วแก้ไขข้อมูลโดยห้ามเปลี่ยนชื่อหัวคอลัมน์แถวแรก (Header) บันทึกเป็น `.csv` (UTF-8) ก่อนนำเข้าสู่ระบบ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {csvTemplatesList.map((tmpl) => (
              <div 
                key={tmpl.id} 
                className="bg-white p-4 rounded border border-[#DCE4EA] flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tmpl.badgeBg}`}>
                      {tmpl.badge}
                    </span>
                    <span className="text-[10px] font-mono text-[#6A7B87]">{tmpl.filename}</span>
                  </div>
                  <h3 className="text-xs font-bold text-[#0E3A66]">
                    {tmpl.title}
                  </h3>
                  <p className="text-xs text-[#59656D] leading-relaxed">
                    {tmpl.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#DCE4EA] flex items-center justify-between">
                  <span className="text-[11px] text-[#6A7B87]">
                    {tmpl.headers.length} คอลัมน์
                  </span>
                  <button
                    type="button"
                    onClick={() => downloadCsvFile(tmpl.filename, tmpl.headers, tmpl.sampleRows)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0E3A66] hover:bg-[#17538F] text-white rounded text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลดแม่แบบ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#DCE4EA] bg-[#F3F6F8] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              csvTemplatesList.forEach((tmpl, i) => {
                setTimeout(() => {
                  downloadCsvFile(tmpl.filename, tmpl.headers, tmpl.sampleRows);
                }, i * 300);
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F3F6F8] text-[#333B41] border border-[#DCE4EA] rounded text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#0E3A66]" />
            <span>ดาวน์โหลดแม่แบบทั้งหมด (All CSVs)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#0E3A66] hover:bg-[#17538F] text-white rounded text-xs font-bold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
