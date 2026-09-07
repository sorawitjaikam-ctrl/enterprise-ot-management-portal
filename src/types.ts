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

export interface DailyShiftAuditRow {
  day: number;
  dateStr: string;
  dayOfWeekTh: string;
  isHolidayOrRestDay: boolean;
  shiftCode: string;
  planShiftCode?: string;
  actualShiftCode?: string;
  normalOtHours: number;
  holidayWorkHours: number;
  holidayOtHours: number;
  dailyPayThb: number;
  explanation: string;
}

export interface EmployeeJobValueBreakdown {
  employeeId: string;
  employeeName?: string;
  role?: string;
  department?: string;
  baseSalary: number;
  hourlyRate: number;
  monthlyOtHours: number;
  monthlyOtPay: number;
  normalOtPay?: number;
  holidayWorkPay?: number;
  holidayOtPay?: number;
  totalLaborCost: number;
  monthlyRevenue: number;
  operationalValueAdd: number;
  revenueCostRatio: number;
  profitMarginPct?: number;
  dailyAuditTrail?: DailyShiftAuditRow[];
}

export interface RoleJobValueSummary {
  role: string;
  headcount: number;
  totalBaseSalary: number;
  avgBaseSalary: number;
  totalOtHours: number;
  totalOtPay: number;
  totalLaborCost: number;
  totalRevenue: number;
  operationalValueAdd: number;
  revenueCostRatio: number;
  profitMarginPct: number;
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

export interface CompanyHoliday {
  id: string;
  date: string; // YYYY-MM-DD
  nameTh: string;
  nameEn: string;
  isCustom?: boolean;
}

export interface DepartmentRestDayPolicy {
  deptId: string;
  policyType: "sunday_only" | "sat_sun" | "rotating_6_1" | "custom";
  customRestDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
}

export interface AppState {
  departments: Department[];
  employees: Employee[];
  shiftConfig: ShiftConfig;
  otTrendData: OtTrendData;
  leaveRecords?: LeaveRecord[];
  vesselSchedules?: VesselSchedule[];
  companyHolidays?: CompanyHoliday[];
  restDayPolicies?: DepartmentRestDayPolicy[];
  d1Connected?: boolean;
}
