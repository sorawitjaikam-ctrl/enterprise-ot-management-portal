-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nameTh TEXT NOT NULL,
  manager TEXT DEFAULT '-',
  managerRole TEXT DEFAULT 'Section Manager',
  managerImg TEXT DEFAULT '',
  icon TEXT DEFAULT 'precision_manufacturing'
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  deptId TEXT NOT NULL,
  role TEXT DEFAULT 'Operator',
  targetOt REAL DEFAULT 48,
  actualOt REAL DEFAULT 0,
  otPct REAL DEFAULT 0,
  status TEXT DEFAULT 'On Track',
  groupName TEXT DEFAULT 'Group A',
  shifts TEXT DEFAULT '[]',
  prefix TEXT DEFAULT '',
  firstName TEXT DEFAULT '',
  lastName TEXT DEFAULT '',
  nickname TEXT DEFAULT '',
  division TEXT DEFAULT '',
  salary REAL DEFAULT 0,
  birthday TEXT DEFAULT '',
  age INTEGER DEFAULT 0,
  calculatedAge INTEGER DEFAULT 0,
  startDate TEXT DEFAULT '',
  tenure TEXT DEFAULT '',
  probationDate TEXT DEFAULT '',
  calendarType TEXT DEFAULT ''
);

-- Create ot_daily_records table
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
  note TEXT DEFAULT ''
);

-- Create leave_records table
CREATE TABLE IF NOT EXISTS leave_records (
  id TEXT PRIMARY KEY,
  employeeId TEXT NOT NULL,
  employeeName TEXT NOT NULL,
  deptId TEXT NOT NULL,
  date TEXT NOT NULL,
  leaveType TEXT NOT NULL,
  note TEXT DEFAULT ''
);

-- Create app_accounts table
CREATE TABLE IF NOT EXISTS app_accounts (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  deptId TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  canBackup INTEGER DEFAULT 0
);

-- Create audit_logs table
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
INSERT OR IGNORE INTO employees (id, name, deptId, role, targetOt, actualOt, otPct, status, groupName, shifts) VALUES
('EMP-101', 'นายสมชาย ใจดี', 'inter2', 'Operator', 48, 24, 50, 'On Track', 'Group A', '["M12","M12","O","O","A12","A12","N12","N12","O","O"]'),
('EMP-102', 'นายวิชัย สุขใจ', 'inter2', 'Technician', 48, 40, 83, 'On Track', 'Group A', '["M8","M12","O","O","A8","A12","N8","N12","O","O"]'),
('EMP-103', 'นางสาววิภา รักงาน', 'inter3', 'Operator', 48, 52, 108, 'Warning', 'Group B', '["M16","M12","O","O","A12","A16","N12","N12","O","O"]'),
('EMP-104', 'นายสมศักดิ์ มั่นคง', 'inter5', 'Senior Operator', 48, 58, 120, 'Warning', 'Group C', '["M16","M16","O","O","A16","A12","N16","N12","O","O"]'),
('EMP-105', 'นายอนันต์ ขยันยิ่ง', 'heavy', 'Mechanic', 48, 32, 67, 'On Track', 'Group A', '["M12","M8","O","O","A12","A8","N12","N8","O","O"]'),
('EMP-106', 'นายประสิทธิ์ ดีเลิศ', 'ecc', 'Electrician', 48, 18, 38, 'On Track', 'Group B', '["M8","M8","O","O","A8","A8","N8","N8","O","O"]');

-- Create job_value_records table
CREATE TABLE IF NOT EXISTS job_value_records (
  id TEXT PRIMARY KEY,
  empId TEXT NOT NULL,
  empName TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT DEFAULT '',
  status TEXT DEFAULT '',
  avgRevenue REAL DEFAULT 0,
  avgCost REAL DEFAULT 0,
  profit2026 REAL DEFAULT 0,
  profit2025 REAL DEFAULT 0,
  monthlyRevenue TEXT DEFAULT '[]',
  monthlyCost TEXT DEFAULT '[]',
  monthlyProfit TEXT DEFAULT '[]',
  updatedAt TEXT NOT NULL
);

-- Insert initial accounts
INSERT OR IGNORE INTO app_accounts (username, password, name, role, deptId, canBackup) VALUES
('admin', 'admin123', 'ผู้ดูแลระบบ', 'ผู้ดูแลระบบ', 'all', 1),
('hr', 'hr1234', 'HR Manager', 'HR', 'all', 1),
('hr_sec', 'hrsec1234', 'HR Section Manager', 'HR Section Manager', 'all', 1),
('op_dir', 'opdir1234', 'Operation Director', 'Operation Dir', 'all', 0),
('op_dept', 'opdept1234', 'Operation Department', 'Operation Depart', 'all', 0),
('inter2_mgr', 'i2mgr1234', 'Section Manager INTER2', 'Section Manager', 'inter2', 0),
('inter3_mgr', 'i3mgr1234', 'Section Manager INTER3', 'Section Manager', 'inter3', 0),
('inter5_mgr', 'i5mgr1234', 'Section Manager INTER5', 'Section Manager', 'inter5', 0),
('inter7_mgr', 'i7mgr1234', 'Section Manager INTER7', 'Section Manager', 'inter7', 0),
('heavy_mgr', 'hvmgr1234', 'Section Manager Heavy', 'Section Manager', 'heavy', 0),
('ecc_mgr', 'eccmgr1234', 'Section Manager ECC', 'Section Manager', 'ecc', 0);

-- Insert initial job value records linked by empId
INSERT OR IGNORE INTO job_value_records (id, empId, empName, department, position, status, avgRevenue, avgCost, profit2026, profit2025, monthlyRevenue, monthlyCost, monthlyProfit, updatedAt) VALUES
('JV-EMP-101', 'EMP-101', 'นายสมชาย ใจดี', 'INTER 2', 'Operator', 'Active', 185000, 110000, 900000, 820000, '[180000,182000,185000,188000,190000,185000,187000,186000,184000,189000,191000,188000]', '[108000,109000,110000,112000,111000,110000,112000,110000,109000,111000,113000,110000]', '[72000,73000,75000,76000,79000,75000,75000,76000,75000,78000,78000,78000]', '2026-08-04T17:00:00.000Z'),
('JV-EMP-102', 'EMP-102', 'นายวิชัย สุขใจ', 'INTER 2', 'Technician', 'Active', 210000, 125000, 1020000, 940000, '[205000,208000,210000,215000,212000,210000,214000,211000,209000,216000,218000,213000]', '[123000,124000,125000,128000,126000,125000,127000,125000,124000,127000,129000,126000]', '[82000,84000,85000,87000,86000,85000,87000,86000,85000,89000,89000,87000]', '2026-08-04T17:00:00.000Z'),
('JV-EMP-103', 'EMP-103', 'นางสาววิภา รักงาน', 'INTER 3', 'Operator', 'Active', 175000, 105000, 840000, 780000, '[170000,172000,175000,178000,176000,175000,177000,174000,173000,179000,180000,176000]', '[103000,104000,105000,107000,106000,105000,106000,104000,103000,107000,108000,105000]', '[67000,68000,70000,71000,70000,70000,71000,70000,70000,72000,72000,71000]', '2026-08-04T17:00:00.000Z'),
('JV-EMP-104', 'EMP-104', 'นายสมศักดิ์ มั่นคง', 'INTER 5', 'Senior Operator', 'Active', 240000, 140000, 1200000, 1100000, '[235000,238000,240000,245000,242000,240000,244000,241000,239000,246000,248000,243000]', '[138000,139000,140000,143000,141000,140000,142000,140000,139000,143000,145000,142000]', '[97000,99000,100000,102000,101000,100000,102000,101000,100000,103000,103000,101000]', '2026-08-04T17:00:00.000Z'),
('JV-EMP-105', 'EMP-105', 'นายอนันต์ ขยันยิ่ง', 'Heavy Machine', 'Mechanic', 'Active', 220000, 130000, 1080000, 1000000, '[215000,218000,220000,225000,222000,220000,224000,221000,219000,226000,228000,223000]', '[128000,129000,130000,133000,131000,130000,132000,130000,129000,133000,135000,132000]', '[87000,89000,90000,92000,91000,90000,92000,91000,90000,93000,93000,91000]', '2026-08-04T17:00:00.000Z'),
('JV-EMP-106', 'EMP-106', 'นายประสิทธิ์ ดีเลิศ', 'ECC', 'Electrician', 'Active', 195000, 115000, 960000, 890000, '[190000,192000,195000,198000,196000,195000,197000,194000,193000,199000,200000,196000]', '[113000,114000,115000,117000,116000,115000,116000,114000,113000,117000,118000,115000]', '[77000,78000,80000,81000,80000,80000,81000,80000,80000,82000,82000,81000]', '2026-08-04T17:00:00.000Z');
