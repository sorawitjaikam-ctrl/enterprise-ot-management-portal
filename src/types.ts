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
  role: string;
  targetOt: number;
  actualOt: number;
  otPct: number;
  status: "On Track" | "Warning";
  groupName: string;
  shifts: string[]; // List of 10 items e.g., ["M", "M", "O", "O", "A", "A", "A", "A", "O", "O"] or "⚠"
  
  // New fields from Data .csv
  prefix?: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  division?: string;
  salary?: number;
  birthday?: string;
  age?: number;
  calculatedAge?: number;
  startDate?: string;
  tenure?: string;
  probationDate?: string;
  calendarType?: string;
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

export interface LeaveRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  deptId: string;
  date: string;
  leaveType: string;
  note: string;
}

export interface AppState {
  departments: Department[];
  employees: Employee[];
  shiftConfig: ShiftConfig;
  otTrendData: OtTrendData;
  leaveRecords?: LeaveRecord[];
}
