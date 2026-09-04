export interface Department {
  id: string;
  name: string;
  nameTh: string;
  manager: string;
  managerRole: string;
  managerImg: string;
  employeesCount: number;
  otHours: number;
  budgetUsed: number;
  budgetUsedChange: number;
  budgetUsedChangePct: number;
  budgetUtilization: number;
  status: "On Track" | "Warning";
  icon: string;
}

export interface Employee {
  id: string;
  name: string;
  deptId: string;
  department?: string;
  role: string;
  targetOt: number;
  actualOt: number;
  otPct: number;
  status: "On Track" | "Warning" | string;
  groupName: string;
  shifts: any;     // Actual shifts — กะที่เข้าทำงานจริง (ใช้คำนวณ OT)
  planShifts?: any; // Plan shifts — ตารางที่วางล่วงหน้า (ไม่ใช้คำนวณ OT)
  
  // New fields from Data .csv
  prefix?: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  avatar?: string;
  division?: string;
  salary?: number;
  birthday?: string;
  age?: number;
  calculatedAge?: number;
  startDate?: string;
  tenure?: string;
  probationDate?: string;
  calendarType?: string;
  resignationDate?: string;
  employmentStatus?: "Active" | "Resigned" | "Inactive" | "Retired" | "ทำงานปกติ" | "ลาออก" | "เกษียณ" | "พ้นสภาพ" | string;
  sickLeaveUsed?: number;
  personalLeaveUsed?: number;
  vacationLeaveUsed?: number;
}

export interface ShiftConfig {
  pattern: string;
  currentMonth: string;
  currentDept: string;
}

export interface OtTrendData {
  months: string[];
  lastYear: number[];
  currentYear: number[];
}

export interface JobValueRecord {
  id: string;
  empId: string;
  empName: string;
  deptId?: string;
  department: string;
  position: string;
  status?: string;
  avgRevenue: number;
  avgCost: number;
  profit2026: number;
  profit2025: number;
  monthlyRevenue: number[];
  monthlyCost: number[];
  monthlyProfit: number[];
  updatedAt?: string;
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  deptId: string;
  date: string;
  leaveType: string;
  note: string;
}

export interface VesselSchedule {
  id: string;
  type: "vessel" | "crane" | "pm" | "cm";
  planType: "plan" | "actual";
  name: string;
  startDate: string;
  endDate: string;
  deptId: string;
  color?: string;
  tonnage?: number | string;
}

export interface AppState {
  departments: Department[];
  employees: Employee[];
  shiftConfig: ShiftConfig;
  otTrendData: OtTrendData;
  leaveRecords?: LeaveRecord[];
  vesselSchedules?: VesselSchedule[];
  d1Connected?: boolean;
}
