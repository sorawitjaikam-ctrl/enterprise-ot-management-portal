import React from 'react';
import { Download, FileSpreadsheet, X, CheckCircle, Info } from 'lucide-react';

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
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    headers: [
      "id", "prefix", "firstName", "lastName", "nickname", "role", "deptId", "division",
      "salary", "targetOt", "birthday", "age", "startDate", "tenure", "probationDate",
      "calendarType", "employmentStatus", "resignationDate", "groupName", "shifts"
    ],
    sampleRows: [
      [
        "EMP-101", "นาย", "สมชาย", "สายงาน", "ชาย", "ผู้ควบคุมงานขนถ่ายสินค้า", "inter2", "ฝ่ายการผลิต",
        25000, 48, "1990-05-15", 36, "2020-01-15", "6 ปี", "2020-05-15",
        "ปฏิทินกะ 4-on-2-off", "Active", "", "Group A", '["M12","M12","A12","A12","OFF","OFF"]'
      ],
      [
        "EMP-102", "นางสาว", "วิภา", "รักงาน", "ภา", "พนักงานขับเครน", "inter3", "ฝ่ายปฏิบัติการ",
        22000, 48, "1993-08-20", 33, "2021-03-01", "5 ปี", "2021-07-01",
        "ปฏิทินกะ 4-on-2-off", "Active", "", "Group B", '["A12","A12","N12","N12","OFF","OFF"]'
      ]
    ]
  },
  {
    id: "job_value",
    title: "2. แม่แบบคุณค่าตำแหน่งงาน & ผลตอบแทน (Job Value & Financials)",
    desc: "ไฟล์แม่แบบสำหรับนำเข้าค่า Revenue, Cost, Profit รายเดือนและสะสมรายปีของพนักงาน",
    filename: "job_value_financials_template.csv",
    badge: "คุณค่าตำแหน่งงาน & การเงิน",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
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
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
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
        "A12", "A12", "OFF", "OFF", "N12", "N12", "M12", "M12", "OFF"
      ]
    ]
  },
  {
    id: "leave_records",
    title: "4. แม่แบบประวัติวันลาพนักงาน (Leave Records)",
    desc: "ไฟล์แม่แบบสำหรับบันทึกการลางาน (ลาป่วย, ลากิจ, ลาพักร้อน) และจำนวนวันลาสะสม",
    filename: "leave_records_template.csv",
    badge: "ประวัติการลา",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
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
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex justify-between items-center relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-3 bg-blue-600/30 border border-blue-400/30 rounded-2xl text-blue-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">ศูนย์ดาวน์โหลดแม่แบบไฟล์ CSV (CSV Template Hub)</h2>
              <p className="text-xs text-slate-300">รวบรวมไฟล์แม่แบบ CSV มาตรฐานสำหรับนำเข้าข้อมูล (Import) ในทุกระบบ</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh] bg-slate-50">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-800">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">คำแนะนำการใช้งานไฟล์ CSV:</span>
              <p className="mt-0.5 text-slate-600">
                ดาวน์โหลดไฟล์แม่แบบ `.csv` ด้านล่าง แล้วเปิดด้วย Microsoft Excel หรือ Google Sheets เพื่อแก้ไขข้อมูล โดยห้ามแก้ไขชื่อหัวคอลัมน์ในแถวแรก (Header) เมื่อแก้ไขเสร็จแล้วให้บันทึกเป็นไฟล์ `.csv` (UTF-8) ก่อนกดอัพโหลดในระบบ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {csvTemplatesList.map((tmpl) => (
              <div 
                key={tmpl.id} 
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${tmpl.badgeBg}`}>
                      {tmpl.badge}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{tmpl.filename}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {tmpl.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {tmpl.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {tmpl.headers.length} คอลัมน์มาตรฐาน
                  </span>
                  <button
                    type="button"
                    onClick={() => downloadCsvFile(tmpl.filename, tmpl.headers, tmpl.sampleRows)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
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
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              csvTemplatesList.forEach((tmpl, i) => {
                setTimeout(() => {
                  downloadCsvFile(tmpl.filename, tmpl.headers, tmpl.sampleRows);
                }, i * 300);
              });
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>ดาวน์โหลดแม่แบบทั้งหมด (Zip/All CSVs)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
