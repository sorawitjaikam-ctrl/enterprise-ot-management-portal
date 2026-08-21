import { Department, Employee, VesselSchedule, LeaveRecord, JobValueRecord, ShiftConfig, OtTrendData } from '../../src/types';

export const mockDepartments: Department[] = [
  {
    id: "inter2",
    name: "INTER 2",
    nameTh: "ฝ่ายปฏิบัติการเทียบเรือ 2",
    manager: "นายธนกร สมบูรณ์",
    managerRole: "ผู้จัดการแผนก",
    managerImg: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    employeesCount: 15,
    otHours: 120,
    budgetUsed: 36000,
    budgetUsedChange: 5,
    budgetUsedChangePct: 3.2,
    budgetUtilization: 24,
    status: "On Track",
    icon: "Anchor"
  },
  {
    id: "inter3",
    name: "INTER 3",
    nameTh: "ฝ่ายปฏิบัติการเทียบเรือ 3",
    manager: "นางสาวพิมพา สุขใจ",
    managerRole: "ผู้จัดการแผนก",
    managerImg: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    employeesCount: 18,
    otHours: 480,
    budgetUsed: 144000,
    budgetUsedChange: 12,
    budgetUsedChangePct: 8.5,
    budgetUtilization: 96,
    status: "Warning",
    icon: "Ship"
  },
  {
    id: "inter5",
    name: "INTER 5",
    nameTh: "ฝ่ายปฏิบัติการเทียบเรือ 5",
    manager: "นายวิศรุต เกียรติดำรง",
    managerRole: "ผู้จัดการแผนก",
    managerImg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    employeesCount: 12,
    otHours: 95,
    budgetUsed: 28500,
    budgetUsedChange: -2,
    budgetUsedChangePct: -1.5,
    budgetUtilization: 19,
    status: "On Track",
    icon: "Navigation"
  },
  {
    id: "inter7",
    name: "INTER 7",
    nameTh: "ฝ่ายปฏิบัติการเทียบเรือ 7",
    manager: "นายชวลิต มณีโชติ",
    managerRole: "ผู้จัดการแผนก",
    managerImg: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    employeesCount: 14,
    otHours: 110,
    budgetUsed: 33000,
    budgetUsedChange: 1,
    budgetUsedChangePct: 0.8,
    budgetUtilization: 22,
    status: "On Track",
    icon: "Compass"
  },
  {
    id: "heavy",
    name: "Heavy Machine",
    nameTh: "ฝ่ายเครื่องจักรกลหนักและเครน",
    manager: "นายสมเกียรติ พรประเสริฐ",
    managerRole: "หัวหน้าฝ่ายช่างกล",
    managerImg: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face",
    employeesCount: 22,
    otHours: 520,
    budgetUsed: 156000,
    budgetUsedChange: 18,
    budgetUsedChangePct: 11.2,
    budgetUtilization: 100,
    status: "Warning",
    icon: "Truck"
  },
  {
    id: "ecc",
    name: "ECC",
    nameTh: "ศูนย์ควบคุมอุปกรณ์และระบบไฟฟ้า",
    manager: "นายกิตติคุณ มิ่งขวัญ",
    managerRole: "หัวหน้าส่วนควบคุม",
    managerImg: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    employeesCount: 10,
    otHours: 65,
    budgetUsed: 19500,
    budgetUsedChange: -4,
    budgetUsedChangePct: -3.0,
    budgetUtilization: 13,
    status: "On Track",
    icon: "Zap"
  }
];

export const mockEmployees: Employee[] = [
  {
    id: "EMP-101",
    name: "นายสมชาย สายงาน",
    prefix: "นาย",
    firstName: "สมชาย",
    lastName: "สายงาน",
    nickname: "ชาย",
    deptId: "inter2",
    division: "ฝ่ายการผลิต",
    role: "ผู้ควบคุมงานขนถ่ายสินค้า",
    salary: 24000,
    targetOt: 48,
    actualOt: 40,
    otPct: 25.0,
    status: "On Track",
    groupName: "กะ 1",
    birthday: "1990-05-15",
    age: 36,
    calculatedAge: 36,
    startDate: "2020-01-15",
    tenure: "6 ปี",
    probationDate: "2020-05-15",
    calendarType: "ปฏิทินกะ 4-on-2-off",
    employmentStatus: "Active",
    shifts: [
      "M12", "M12", "A12", "A12", "OFF", "OFF", "N12", "N12", "M12", "M12",
      "OFF", "OFF", "A12", "A12", "N12", "N12", "OFF", "OFF", "M12", "M12",
      "A12", "A12", "OFF", "OFF", "N12", "N12", "M12", "M12", "OFF", "OFF", "M12"
    ],
    planShifts: [
      "M8", "M8", "A8", "A8", "OFF", "OFF", "N8", "N8", "M8", "M8",
      "OFF", "OFF", "A8", "A8", "N8", "N8", "OFF", "OFF", "M8", "M8",
      "A8", "A8", "OFF", "OFF", "N8", "N8", "M8", "M8", "OFF", "OFF", "M8"
    ]
  },
  {
    id: "EMP-102",
    name: "นางสาววิภา รักงาน",
    prefix: "นางสาว",
    firstName: "วิภา",
    lastName: "รักงาน",
    nickname: "ภา",
    deptId: "inter3",
    division: "ฝ่ายปฏิบัติการ",
    role: "พนักงานขับเครน",
    salary: 15000,
    targetOt: 48,
    actualOt: 48,
    otPct: 33.33,
    status: "Warning",
    groupName: "กะ 2",
    birthday: "1993-08-20",
    age: 33,
    calculatedAge: 33,
    startDate: "2021-03-01",
    tenure: "5 ปี",
    probationDate: "2021-07-01",
    calendarType: "ปฏิทินกะ 4-on-2-off",
    employmentStatus: "Active",
    shifts: [
      "A12", "A12", "N12", "N12", "OFF", "OFF", "M12", "M12", "A12", "A12",
      "OFF", "OFF", "N12", "N12", "M12", "M12", "OFF", "OFF", "A12", "A12",
      "N12", "N12", "OFF", "OFF", "M12", "M12", "A12", "A12", "OFF", "OFF", "N12"
    ],
    planShifts: [
      "A12", "A12", "N12", "N12", "OFF", "OFF", "M12", "M12", "A12", "A12",
      "OFF", "OFF", "N12", "N12", "M12", "M12", "OFF", "OFF", "A12", "A12",
      "N12", "N12", "OFF", "OFF", "M12", "M12", "A12", "A12", "OFF", "OFF", "N12"
    ]
  },
  {
    id: "EMP-103",
    name: "นายอนุชา แก้วกล้า",
    prefix: "นาย",
    firstName: "อนุชา",
    lastName: "แก้วกล้า",
    nickname: "นุ",
    deptId: "inter2",
    division: "ฝ่ายการผลิต",
    role: "ช่างเทคนิคประจำเรือ",
    salary: 30000,
    targetOt: 36,
    actualOt: 16,
    otPct: 26.67,
    status: "On Track",
    groupName: "กะ 1",
    birthday: "1988-11-10",
    age: 38,
    calculatedAge: 38,
    startDate: "2018-06-01",
    tenure: "8 ปี",
    probationDate: "2018-10-01",
    calendarType: "ปฏิทินกะ 4-on-2-off",
    employmentStatus: "Active",
    shifts: [
      "OND", "OFF", "M8", "M8", "M8", "M8", "OFF", "OND", "M8", "M8",
      "M8", "M8", "OFF", "OFF", "M8", "M8", "M8", "M8", "OFF", "OFF",
      "M8", "M8", "M8", "M8", "OFF", "OFF", "M8", "M8", "M8", "M8", "OFF"
    ]
  },
  {
    id: "EMP-104",
    name: "นายประวิทย์ ทรงชัย",
    prefix: "นาย",
    firstName: "ประวิทย์",
    lastName: "ทรงชัย",
    nickname: "วิทย์",
    deptId: "heavy",
    division: "ฝ่ายเครื่องจักร",
    role: "หัวหน้างานซ่อมบำรุง",
    salary: 48000,
    targetOt: 60,
    actualOt: 56,
    otPct: 51.67,
    status: "Warning",
    groupName: "กะ 3",
    birthday: "1982-03-25",
    age: 44,
    calculatedAge: 44,
    startDate: "2015-09-15",
    tenure: "11 ปี",
    probationDate: "2016-01-15",
    calendarType: "ปฏิทินกะ 4-on-2-off",
    employmentStatus: "Active",
    shifts: [
      "M16", "M16", "OFF", "OFF", "M12", "M12", "N16", "N16", "OFF", "OFF",
      "M12", "M12", "M16", "M16", "OFF", "OFF", "M12", "M12", "N16", "N16",
      "OFF", "OFF", "M12", "M12", "M16", "M16", "OFF", "OFF", "M12", "M12", "OFF"
    ]
  }
];

export const mockVesselSchedules: VesselSchedule[] = [
  {
    id: "VESSEL-001",
    type: "vessel",
    planType: "plan",
    name: "MV Double A Trader (Berth 1)",
    startDate: "2026-08-01",
    endDate: "2026-08-05",
    deptId: "inter2",
    color: "#3b82f6"
  },
  {
    id: "VESSEL-002",
    type: "vessel",
    planType: "actual",
    name: "MV Double A Trader (Berth 1) Actual",
    startDate: "2026-08-01",
    endDate: "2026-08-06",
    deptId: "inter2",
    color: "#10b981"
  },
  {
    id: "CRANE-001",
    type: "crane",
    planType: "actual",
    name: "Gantry Crane 01 Maintenance",
    startDate: "2026-08-10",
    endDate: "2026-08-14",
    deptId: "heavy",
    color: "#f59e0b"
  }
];

export const mockLeaveRecords: LeaveRecord[] = [
  {
    id: "LV-001",
    employeeId: "EMP-101",
    employeeName: "นายสมชาย สายงาน",
    deptId: "inter2",
    date: "2026-08-10",
    leaveType: "ลากิจ",
    note: "ทำธุระส่วนตัว"
  },
  {
    id: "LV-002",
    employeeId: "EMP-102",
    employeeName: "นางสาววิภา รักงาน",
    deptId: "inter3",
    date: "2026-08-15",
    leaveType: "ลาป่วย",
    note: "มีไข้สูง"
  }
];

export const mockShiftConfig: ShiftConfig = {
  pattern: "4-on-2-off",
  currentMonth: "2026-08",
  currentDept: "inter2"
};

export const mockOtTrendData: OtTrendData = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  lastYear: [120, 140, 130, 160, 180, 190, 210, 200, 180, 170, 160, 150],
  currentYear: [130, 150, 145, 170, 195, 205, 220, 215, 190, 180, 175, 165]
};
