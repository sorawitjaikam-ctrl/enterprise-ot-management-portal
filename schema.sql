-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nameTh TEXT NOT NULL,
  manager TEXT DEFAULT '-',
  managerRole TEXT DEFAULT 'Section Manager',
  managerImg TEXT DEFAULT '',
  icon TEXT DEFAULT 'precision_manufacturing',
  pattern TEXT DEFAULT ''
);

-- Create employees table (Central Master Entity - Keyed by employee ID)
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,                 -- รหัสพนักงาน (เช่น 688172, EMP-101)
  positionId TEXT DEFAULT '',          -- รหัสกรอบตำแหน่ง (เช่น POS-001)
  name TEXT NOT NULL,                  -- ชื่อ-นามสกุล
  prefix TEXT DEFAULT '',
  firstName TEXT DEFAULT '',
  lastName TEXT DEFAULT '',
  nickname TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  deptId TEXT NOT NULL,                -- รหัสแผนก
  division TEXT DEFAULT 'ฝ่ายปฏิบัติการท่าเรือ',
  unit TEXT NOT NULL DEFAULT 'INTER 2',-- ทุ่น/ฝ่าย (INTER 2, INTER 3, INTER 5, INTER 7, Control Center, Improvement Engineering, Heavy Machine)
  role TEXT NOT NULL DEFAULT 'Operator',
  level TEXT NOT NULL DEFAULT 'Staff', -- ระดับตำแหน่ง (Worker - Worker, Worker - Skill, Staff, Officer, Engineer, Section Manager, Department Manager, Director)
  ocType TEXT NOT NULL DEFAULT 'OLD',  -- ประเภท OC (OLD / NEW)
  status TEXT NOT NULL DEFAULT 'Active',-- สถานะ (Active / Resigned / Vacant)
  employmentStatus TEXT DEFAULT 'Active',
  isMgr INTEGER DEFAULT 0,
  isEng INTEGER DEFAULT 0,
  
  salary REAL DEFAULT 0,
  startDate TEXT DEFAULT '',
  tenure TEXT DEFAULT '',
  probationDate TEXT DEFAULT '',
  birthday TEXT DEFAULT '',
  age INTEGER DEFAULT 0,
  calculatedAge INTEGER DEFAULT 0,
  calendarType TEXT DEFAULT 'ปฏิทินกะ 4-on-2-off',
  groupName TEXT DEFAULT 'Group A',
  shifts TEXT DEFAULT '[]',
  planShifts TEXT DEFAULT '[]',
  targetOt REAL DEFAULT 48,
  actualOt REAL DEFAULT 0,
  otPct REAL DEFAULT 0,
  
  -- Job Value metrics (Merged from job_value_records)
  avgRevenue REAL DEFAULT 0,
  avgCost REAL DEFAULT 0,
  profit2026 REAL DEFAULT 0,
  profit2025 REAL DEFAULT 0,
  monthlyRevenue TEXT DEFAULT '[]',
  monthlyCost TEXT DEFAULT '[]',
  monthlyProfit TEXT DEFAULT '[]',
  updatedAt TEXT DEFAULT ''
);

-- Create ot_daily_records table (Linked to employees via employeeId)
CREATE TABLE IF NOT EXISTS ot_daily_records (
  id TEXT PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  date TEXT NOT NULL,
  employeeId TEXT NOT NULL,
  employeeName TEXT NOT NULL,
  deptId TEXT NOT NULL,
  shiftCode TEXT NOT NULL,
  otHours REAL NOT NULL,
  note TEXT DEFAULT '',
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);

-- Create ot_requests table (Linked to employees via employeeId)
CREATE TABLE IF NOT EXISTS ot_requests (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  employeeName TEXT NOT NULL,
  deptId TEXT NOT NULL,
  date TEXT NOT NULL,
  hours REAL NOT NULL,
  reason TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  requestedAt TEXT DEFAULT '',
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);

-- Create leave_records table (Linked to employees via employeeId)
CREATE TABLE IF NOT EXISTS leave_records (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  employeeName TEXT NOT NULL,
  deptId TEXT NOT NULL,
  date TEXT NOT NULL,
  leaveType TEXT NOT NULL,
  note TEXT DEFAULT '',
  FOREIGN KEY (employeeId) REFERENCES employees(id)
);

-- Create accounts table (Linked to employees via employeeId)
CREATE TABLE IF NOT EXISTS accounts (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  deptId TEXT NOT NULL,
  employeeId TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  canBackup INTEGER DEFAULT 0
);

-- Create vessel_schedules table (Operational schedule)
CREATE TABLE IF NOT EXISTS vessel_schedules (
  id TEXT PRIMARY KEY,
  type TEXT DEFAULT 'vessel',
  planType TEXT DEFAULT 'actual',
  name TEXT NOT NULL,
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  deptId TEXT NOT NULL,
  tonnage REAL DEFAULT 0
);

-- Create audit_logs table (System audit trail)
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  username TEXT NOT NULL,
  action TEXT NOT NULL,
  targetType TEXT NOT NULL,
  targetId TEXT NOT NULL,
  detail TEXT DEFAULT ''
);

-- Insert initial departments
INSERT OR IGNORE INTO departments (id, name, nameTh, manager, managerRole, icon) VALUES
('inter2', 'INTER 2', 'แผนก INTER 2', 'คุณสมชาย', 'Section Manager', 'precision_manufacturing'),
('inter3', 'INTER 3', 'แผนก INTER 3', 'คุณวิภา', 'Section Manager', 'precision_manufacturing'),
('inter5', 'INTER 5', 'แผนก INTER 5', 'คุณอนันต์', 'Section Manager', 'precision_manufacturing'),
('inter7', 'INTER 7', 'แผนก INTER 7', 'คุณสมศักดิ์', 'Section Manager', 'precision_manufacturing'),
('heavy', 'Heavy Machine', 'แผนก Heavy Machine', 'คุณศักดิ์ชัย', 'Section Manager', 'settings'),
('ecc', 'ECC', 'แผนก ECC', 'คุณประสิทธิ์', 'Section Manager', 'electrical_services');

-- Insert initial employees
INSERT OR IGNORE INTO employees (
  id, positionId, name, deptId, unit, role, level, ocType, status,
  targetOt, actualOt, otPct, groupName, shifts, avgRevenue, avgCost, profit2026, profit2025
) VALUES
('EMP-101', 'POS-001', 'นายสมชาย ใจดี', 'inter2', 'INTER 2', 'Operator', 'Staff', 'OLD', 'Active', 48, 24, 50, 'Group A', '["M12","M12","O","O","A12","A12","N12","N12","O","O"]', 185000, 110000, 900000, 820000),
('EMP-102', 'POS-002', 'นายวิชัย สุขใจ', 'inter2', 'INTER 2', 'Technician', 'Worker - Skill', 'OLD', 'Active', 48, 40, 83, 'Group A', '["M8","M12","O","O","A8","A12","N8","N12","O","O"]', 210000, 125000, 1020000, 940000),
('EMP-103', 'POS-003', 'นางสาววิภา รักงาน', 'inter3', 'INTER 3', 'Operator', 'Staff', 'OLD', 'Active', 48, 52, 108, 'Group B', '["M16","M12","O","O","A12","A16","N12","N12","O","O"]', 175000, 105000, 840000, 780000),
('EMP-104', 'POS-004', 'นายสมศักดิ์ มั่นคง', 'inter5', 'INTER 5', 'Senior Operator', 'Worker - Skill', 'OLD', 'Active', 48, 58, 120, 'Group C', '["M16","M16","O","O","A16","A12","N16","N12","O","O"]', 240000, 140000, 1200000, 1100000),
('EMP-105', 'POS-005', 'นายอนันต์ ขยันยิ่ง', 'heavy', 'Heavy Machine', 'Mechanic', 'Worker - Skill', 'OLD', 'Active', 48, 32, 67, 'Group A', '["M12","M8","O","O","A12","A8","N12","N8","O","O"]', 220000, 130000, 1080000, 1000000),
('EMP-106', 'POS-006', 'นายประสิทธิ์ ดีเลิศ', 'ecc', 'Control Center', 'Electrician', 'Worker - Skill', 'OLD', 'Active', 48, 18, 38, 'Group B', '["M8","M8","O","O","A8","A8","N8","N8","O","O"]', 195000, 115000, 960000, 890000);

-- Insert initial accounts
INSERT OR IGNORE INTO accounts (username, password, name, role, deptId, employeeId, canBackup) VALUES
('admin', 'admin123', 'ผู้ดูแลระบบ', 'ผู้ดูแลระบบ', 'all', '', 1),
('hr', 'hr1234', 'HR Manager', 'HR', 'all', '', 1),
('hr_sec', 'hrsec1234', 'HR Section Manager', 'HR Section Manager', 'all', '', 1),
('op_dir', 'opdir1234', 'Operation Director', 'Operation Dir', 'all', '', 0),
('op_dept', 'opdept1234', 'Operation Department', 'Operation Depart', 'all', '', 0),
('inter2_mgr', 'i2mgr1234', 'Section Manager INTER2', 'Section Manager', 'inter2', 'EMP-101', 0),
('inter3_mgr', 'i3mgr1234', 'Section Manager INTER3', 'Section Manager', 'inter3', 'EMP-103', 0),
('inter5_mgr', 'i5mgr1234', 'Section Manager INTER5', 'Section Manager', 'inter5', 'EMP-104', 0),
('inter7_mgr', 'i7mgr1234', 'Section Manager INTER7', 'Section Manager', 'inter7', '', 0),
('heavy_mgr', 'hvmgr1234', 'Section Manager Heavy', 'Section Manager', 'heavy', 'EMP-105', 0),
('ecc_mgr', 'eccmgr1234', 'Section Manager ECC', 'Section Manager', 'ecc', 'EMP-106', 0);

