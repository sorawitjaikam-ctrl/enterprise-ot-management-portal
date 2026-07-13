import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// Initial Mock database state (persisted in server memory)
let appState = {
  departments: [
    { id: "mfg", name: "Manufacturing", nameTh: "ฝ่ายผลิต (Manufacturing)", manager: "สมชาย พ.", managerRole: "Mfg Director", managerImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvnZYNBjBkeCOTamuBRImZeOreen3v6-c3XRgPZStiBJsooAt2tZfWOe-JglYng3d76RoGxGaD3OZu9O5cWJcNPS8GtIGgWb9y-W_vl5-54d6BPr6AZoFtC3zcTDO8x_zSR1HqqCTOLB1Fk_CsHu1G_gg04kKnbZKFzqtoUg5w4U2LKAYkfmakE59OAlawYLhFBOG4RqdcpJoTpxwf-Qk7EiCDxOLHY2rhXvnmjCXhU--ouDzu8lv-Gw", employeesCount: 142, otHours: 420.5, budgetUsed: 126150, budgetUsedChange: 5200, budgetUsedChangePct: 4.2, budgetUtilization: 85, status: "On Track", icon: "precision_manufacturing" },
    { id: "qa", name: "Quality Assurance", nameTh: "ฝ่ายตรวจสอบคุณภาพ (Quality Assurance)", manager: "สุนิสา ร.", managerRole: "QA Lead", managerImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfa-Va6432wLuwuCbKZ3EOPg3eCXfvvHiwL1woy-BIKcHNVkOMnohhkoRbfOOUysRlxiwrPFrYuxshKtxmlLDoLElzIsIMt0rR3mdVQ5MgFojB5oD1XzQ735Xd2CHBzlFzBugvnQvlEAGUaRlenDPkjpDM8ajsTup1vyucCI_EOMT0zwOV1AhwqCaEKEftdDiOtiFXptD6dIbVPk_M6B8KacXTbCsv7PgxJmN_hfoPuPNBTEPc-Uufyg", employeesCount: 68, otHours: 310.2, budgetUsed: 93060, budgetUsedChange: 8450, budgetUsedChangePct: 9.1, budgetUtilization: 98, status: "Warning", icon: "verified" },
    { id: "log", name: "Logistics", nameTh: "ฝ่ายคลังสินค้า (Logistics)", manager: "วิชัย ก.", managerRole: "Logistics Mgr", managerImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuBS7GW61eXgnSKpdsavi1aRZYl9uX0Csq70SKyc-Sn5qBGOo_TwiOxitFxbE-a19DM10o-N5XZptW0rpX7YAekGh7z36XXv0ZWmCWTW_e-JKB9UxzwbqUfR8xsuefLlsZFsT2Vf8oU7IwGavhQqplT0Z3xmK5ydtzxK8__a_dahXdu0BDufiwJwAHxKa0npqAy4M-hw7wl2e88aOOWQNjcuXWNZY9b_HLZQ1goE7EX5-GodqradS90O2A", employeesCount: 85, otHours: 255.8, budgetUsed: 76740, budgetUsedChange: -2150, budgetUsedChangePct: -2.8, budgetUtilization: 62, status: "On Track", icon: "local_shipping" },
    { id: "it", name: "IT", nameTh: "ไอที (IT)", manager: "ศศิธร ส.", managerRole: "IT Lead", managerImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf5UhzQFkBl2tAqPIfYe5tF5JObtrReGu_lohxjpxav5OEjcmmCJhPclOvd2pYN5Q63ircrUY62HYEtYICs05VEFPgL0t4CQSbr1dUS_veJddqwvCz2hrMENO5DyK5fUo9Lx_K8EQj_RXIf9a91CYGwMUZftntpoCZ5n7RUAnxYNIsXz71ttH1VvWFLTpEggMdONt3b-WOccq3oi4S33bsL6DAyTg_90K2vzyRwxDzf3Isscur4MrcuQ", employeesCount: 32, otHours: 320.0, budgetUsed: 96000, budgetUsedChange: 1200, budgetUsedChangePct: 1.25, budgetUtilization: 50, status: "On Track", icon: "terminal" },
    { id: "sales", name: "Sales", nameTh: "ฝ่ายขาย (Sales)", manager: "จตุพล พ.", managerRole: "Sales Mgr", managerImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf5UhzQFkBl2tAqPIfYe5tF5JObtrReGu_lohxjpxav5OEjcmmCJhPclOvd2pYN5Q63ircrUY62HYEtYICs05VEFPgL0t4CQSbr1dUS_veJddqwvCz2hrMENO5DyK5fUo9Lx_K8EQj_RXIf9a91CYGwMUZftntpoCZ5n7RUAnxYNIsXz71ttH1VvWFLTpEggMdONt3b-WOccq3oi4S33bsL6DAyTg_90K2vzyRwxDzf3Isscur4MrcuQ", employeesCount: 45, otHours: 245.0, budgetUsed: 73500, budgetUsedChange: -3100, budgetUsedChangePct: -4.0, budgetUtilization: 38, status: "On Track", icon: "trending_up" },
    { id: "hr", name: "HR", nameTh: "ฝ่ายบุคคล (HR)", manager: "สิทธิศักดิ์ พ.", managerRole: "HR Director", managerImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf5UhzQFkBl2tAqPIfYe5tF5JObtrReGu_lohxjpxav5OEjcmmCJhPclOvd2pYN5Q63ircrUY62HYEtYICs05VEFPgL0t4CQSbr1dUS_veJddqwvCz2hrMENO5DyK5fUo9Lx_K8EQj_RXIf9a91CYGwMUZftntpoCZ5n7RUAnxYNIsXz71ttH1VvWFLTpEggMdONt3b-WOccq3oi4S33bsL6DAyTg_90K2vzyRwxDzf3Isscur4MrcuQ", employeesCount: 20, otHours: 177.0, budgetUsed: 53100, budgetUsedChange: 4500, budgetUsedChangePct: 9.2, budgetUtilization: 25, status: "On Track", icon: "group" }
  ],
  employees: [
    { id: "T-1041", name: "สมชาย ใจดี", deptId: "mfg", role: "Senior Tech", targetOt: 48, actualOt: 42.5, otPct: 88, status: "On Track", groupName: "ทีม ก. (ช่างเทคนิคอาวุโส)", shifts: ["O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O"] },
    { id: "T-1042", name: "วิภาดา สุขใจ", deptId: "mfg", role: "Senior Tech", targetOt: 48, actualOt: 35.0, otPct: 73, status: "On Track", groupName: "ทีม ก. (ช่างเทคนิคอาวุโส)", shifts: ["M8", "M12", "O", "O", "A8", "A12", "M16", "M16", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8"] },
    { id: "T-1043", name: "วิชัย นามสมมติ", deptId: "mfg", role: "Lead Operator", targetOt: 48, actualOt: 42.5, otPct: 88, status: "On Track", groupName: "ทีม ก. (ช่างเทคนิคอาวุโส)", shifts: ["M8", "M8", "M12", "O", "O", "M8", "M12", "M16", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8"] },
    { id: "T-1044", name: "อารยา รักดี", deptId: "mfg", role: "Senior Tech", targetOt: 48, actualOt: 74.5, otPct: 155, status: "Warning", groupName: "ทีม ก. (ช่างเทคนิคอาวุโส)", shifts: ["A8", "A12", "A12", "A8", "O", "O", "N8", "N12", "N16", "OND", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O"] },
    { id: "T-1045", name: "นครินทร์ แสนสุข", deptId: "mfg", role: "Technician", targetOt: 48, actualOt: 28.0, otPct: 58, status: "On Track", groupName: "ทีม ก. (ช่างเทคนิคอาวุโส)", shifts: ["O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8", "M12", "M12"] },
    { id: "T-1046", name: "ประเสริฐ ยอดเยี่ยม", deptId: "mfg", role: "Technician", targetOt: 48, actualOt: 32.0, otPct: 67, status: "On Track", groupName: "ทีม ก. (ช่างเทคนิคอาวุโส)", shifts: ["A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "M8", "M8", "M12", "M12", "O", "O"] },
    { id: "T-1047", name: "สุรศักดิ์ ทวีสิน", deptId: "mfg", role: "Technician", targetOt: 48, actualOt: 44.0, otPct: 92, status: "On Track", groupName: "ทีม ก. (ช่างเทคนิคอาวุโส)", shifts: ["M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O"] },
    { id: "T-1048", name: "นัฐพล ตั้งมั่น", deptId: "mfg", role: "Technician", targetOt: 48, actualOt: 52.0, otPct: 108, status: "Warning", groupName: "ทีม ก. (ช่างเทคนิคอาวุโส)", shifts: ["M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "M8", "M8"] },
    { id: "T-1049", name: "ธนพล รักชาติ", deptId: "mfg", role: "Operator", targetOt: 48, actualOt: 40.0, otPct: 83, status: "On Track", groupName: "ทีม ก. (ช่างเทคนิคอาวุโส)", shifts: ["O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "M8", "M8", "M12", "M12"] },
    { id: "T-1050", name: "พิชิตพงษ์ อาจหาญ", deptId: "mfg", role: "Operator", targetOt: 48, actualOt: 38.0, otPct: 79, status: "On Track", groupName: "ทีม ก. (ช่างเทคนิคอาวุโส)", shifts: ["A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "M8", "M8", "M12", "M12", "O", "O"] },
    { id: "T-1051", name: "ธีรยุทธ ชาญชัย", deptId: "mfg", role: "Operator", targetOt: 48, actualOt: 45.0, otPct: 94, status: "On Track", groupName: "ทีม ก. (ช่างเทคนิคอาวุโส)", shifts: ["M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O"] },
    { id: "T-1052", name: "อนันต์ รุ่งเรือง", deptId: "mfg", role: "Operator", targetOt: 48, actualOt: 48.0, otPct: 100, status: "On Track", groupName: "ทีม ก. (ช่างเทคนิคอาวุโส)", shifts: ["M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "M8", "M8"] },
    { id: "T-1053", name: "สุชาติ ดีเลิศ", deptId: "mfg", role: "Operator", targetOt: 48, actualOt: 50.0, otPct: 104, status: "Warning", groupName: "ทีม ก. (ช่างเทคนิคอาวุโส)", shifts: ["O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "M8", "M8", "M12", "M12"] },
    { id: "T-1054", name: "สมยศ มุ่งมั่น", deptId: "mfg", role: "Operator", targetOt: 48, actualOt: 36.0, otPct: 75, status: "On Track", groupName: "ทีม ก. (ช่างเทคนิคอาวุโส)", shifts: ["A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "M8", "M8", "M12", "M12", "O", "O"] },
    { id: "T-1055", name: "นิวัฒน์ เพียรพยายาม", deptId: "mfg", role: "Operator", targetOt: 48, actualOt: 41.0, otPct: 85, status: "On Track", groupName: "ทีม ก. (ช่างเทคนิคอาวุโส)", shifts: ["M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O"] },
    { id: "O-2104", name: "นที วงศ์ษา", deptId: "log", role: "Operator", targetOt: 48, actualOt: 49.5, otPct: 103, status: "Warning", groupName: "ทีม ข. (โอเปอเรเตอร์)", shifts: ["N8", "N12", "N16", "N16", "O", "O", "M8", "M8", "OND", "D", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O"] },
    { id: "O-2105", name: "ประสิทธิ์ มีชัย", deptId: "log", role: "Operator", targetOt: 48, actualOt: 33.5, otPct: 70, status: "On Track", groupName: "ทีม ข. (โอเปอเรเตอร์)", shifts: ["M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O"] },
    { id: "O-2106", name: "อนุชิต คำดี", deptId: "log", role: "Operator", targetOt: 48, actualOt: 45.5, otPct: 95, status: "On Track", groupName: "ทีม ข. (โอเปอเรเตอร์)", shifts: ["M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "M8", "M8"] },
    { id: "I-3044", name: "ศศิธร สุขใจ", deptId: "it", role: "System Admin", targetOt: 48, actualOt: 32.0, otPct: 67, status: "On Track", groupName: "ทีม ไอทีสนับสนุน", shifts: ["M8", "M12", "O", "M8", "M8", "O", "O", "M8", "M8", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8"] },
    { id: "S-4011", name: "จตุพล พร้อมเพรียง", deptId: "sales", role: "Account Exec", targetOt: 48, actualOt: 26.5, otPct: 55, status: "On Track", groupName: "ทีม ขายภูมิภาค", shifts: ["O", "O", "M8", "M12", "M12", "O", "O", "M8", "M8", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8"] },
    { id: "Q-5044", name: "สุนิสา รักงาน", deptId: "qa", role: "QA Specialist", targetOt: 48, actualOt: 48.5, otPct: 101, status: "Warning", groupName: "ทีม ควบคุมคุณภาพ", shifts: ["M8", "M12", "M8", "M8", "O", "O", "A8", "A12", "A8", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8"] },
    { id: "Q-5045", name: "ปิยะพงษ์ แก้วสะอาด", deptId: "qa", role: "QA Inspector", targetOt: 48, actualOt: 39.0, otPct: 81, status: "On Track", groupName: "ทีม ควบคุมคุณภาพ", shifts: ["M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O", "N8", "N8", "N12", "N12", "O", "O", "M8", "M8", "M12", "M12", "O", "O", "A8", "A8", "A12", "A12", "O", "O"] }
  ],
  requests: [
    { id: "REQ-001", employeeId: "O-2104", name: "นที วงศ์ษา", dept: "Logistics", date: "2023-11-10", hours: 4, reason: "จัดระเบียบคลังสินค้าด่วนเพื่อรองรับสินค้าใหม่เข้าเช้าวันรุ่งขึ้น", status: "Pending", urgency: "High" },
    { id: "REQ-002", employeeId: "T-1205", name: "อารยา รักดี", dept: "Manufacturing", date: "2023-11-08", hours: 8, reason: "ซ่อมบำรุงเครื่องจักรหลักขัดข้องกระทันหันในไลน์ผลิต A", status: "Approved", urgency: "Critical" },
    { id: "REQ-003", employeeId: "T-1042", name: "สมชาย ใจดี", dept: "Manufacturing", date: "2023-11-12", hours: 4, reason: "อยู่กะเช้าเพิ่มเติมเนื่องจากทีมงานลาป่วยกะทันหัน", status: "Pending", urgency: "Medium" }
  ],
  shiftConfig: {
    pattern: "4-on-2-off",
    currentMonth: "พฤศจิกายน 2023",
    currentDept: "mfg"
  },
  otTrendData: {
    months: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."],
    lastYear: [40, 55, 70, 60, 45, 80],
    currentYear: [35, 45, 85, 50, 40, 75]
  }
};

// Fallback in-memory user accounts
let appAccounts = [
  { username: "admin", password: "admin123", name: "คุณสิทธิศักดิ์ พ.", role: "ผู้ดูแลระบบ", deptId: "all", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf5UhzQFkBl2tAqPIfYe5tF5JObtrReGu_lohxjpxav5OEjcmmCJhPclOvd2pYN5Q63ircrUY62HYEtYICs05VEFPgL0t4CQSbr1dUS_veJddqwvCz2hrMENO5DyK5fUo9Lx_K8EQj_RXIf9a91CYGwMUZftntpoCZ5n7RUAnxYNIsXz71ttH1VvWFLTpEggMdONt3b-WOccq3oi4S33bsL6DAyTg_90K2vzyRwxDzf3Isscur4MrcuQ" },
  { username: "mfg_mgr", password: "mfg_mgr123", name: "คุณสมชาย พ.", role: "หัวหน้าฝ่ายผลิต", deptId: "mfg", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvnZYNBjBkeCOTamuBRImZeOreen3v6-c3XRgPZStiBJsooAt2tZfWOe-JglYng3d76RoGxGaD3OZu9O5cWJcNPS8GtIGgWb9y-W_vl5-54d6BPr6AZoFtC3zcTDO8x_zSR1HqqCTOLB1Fk_CsHu1G_gg04kKnbZKFzqtoUg5w4U2LKAYkfmakE59OAlawYLhFBOG4RqdcpJoTpxwf-Qk7EiCDxOLHY2rhXvnmjCXhU--ouDzu8lv-Gw" },
  { username: "qa_mgr", password: "qa_mgr123", name: "คุณสุนิสา ร.", role: "หัวหน้าฝ่ายตรวจสอบคุณภาพ", deptId: "qa", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfa-Va6432wLuwuCbKZ3EOPg3eCXfvvHiwL1woy-BIKcHNVkOMnohhkoRbfOOUysRlxiwrPFrYuxshKtxmlLDoLElzIsIMt0rR3mdVQ5MgFojB5oD1XzQ735Xd2CHBzlFzBugvnQvlEAGUaRlenDPkjpDM8ajsTup1vyucCI_EOMT0zwOV1AhwqCaEKEftdDiOtiFXptD6dIbVPk_M6B8KacXTbCsv7PgxJmN_hfoPuPNBTEPc-Uufyg" },
  { username: "log_mgr", password: "log_mgr123", name: "คุณวิชัย ก.", role: "หัวหน้าฝ่ายคลังสินค้า", deptId: "log", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBS7GW61eXgnSKpdsavi1aRZYl9uX0Csq70SKyc-Sn5qBGOo_TwiOxitFxbE-a19DM10o-N5XZptW0rpX7YAekGh7z36XXv0ZWmCWTW_e-JKB9UxzwbqUfR8xsuefLlsZFsT2Vf8oU7IwGavhQqplT0Z3xmK5ydtzxK8__a_dahXdu0BDufiwJwAHxKa0npqAy4M-hw7wl2e88aOOWQNjcuXWNZY9b_HLZQ1goE7EX5-GodqradS90O2A" },
  { username: "it_mgr", password: "it_mgr123", name: "คุณศศิธร ส.", role: "หัวหน้าฝ่ายไอที", deptId: "it", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf5UhzQFkBl2tAqPIfYe5tF5JObtrReGu_lohxjpxav5OEjcmmCJhPclOvd2pYN5Q63ircrUY62HYEtYICs05VEFPgL0t4CQSbr1dUS_veJddqwvCz2hrMENO5DyK5fUo9Lx_K8EQj_RXIf9a91CYGwMUZftntpoCZ5n7RUAnxYNIsXz71ttH1VvWFLTpEggMdONt3b-WOccq3oi4S33bsL6DAyTg_90K2vzyRwxDzf3Isscur4MrcuQ" },
  { username: "sales_mgr", password: "sales_mgr123", name: "คุณจตุพล พ.", role: "หัวหน้าฝ่ายขาย", deptId: "sales", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf5UhzQFkBl2tAqPIfYe5tF5JObtrReGu_lohxjpxav5OEjcmmCJhPclOvd2pYN5Q63ircrUY62HYEtYICs05VEFPgL0t4CQSbr1dUS_veJddqwvCz2hrMENO5DyK5fUo9Lx_K8EQj_RXIf9a91CYGwMUZftntpoCZ5n7RUAnxYNIsXz71ttH1VvWFLTpEggMdONt3b-WOccq3oi4S33bsL6DAyTg_90K2vzyRwxDzf3Isscur4MrcuQ" }
];

const DB_FILE = path.join(process.cwd(), "db.json");

// Save state to local db.json
const saveLocalDb = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify({ appState, appAccounts }, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save local DB:", err);
  }
};

// Load state from local db.json
const loadLocalDb = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      if (data.appState) appState = data.appState;
      if (data.appAccounts) appAccounts = data.appAccounts;
      console.log("Loaded persistent local state from db.json");
    } else {
      saveLocalDb(); // Create initial file
    }
  } catch (err) {
    console.error("Failed to load local DB, using in-memory state:", err);
  }
};

// Load persistent DB immediately
loadLocalDb();

// Cloudflare D1 Helper functions
const isD1Enabled = () => {
  return !!(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_DATABASE_ID);
};

const queryD1 = async (sql: string, params: any[] = []): Promise<any> => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const dbId = process.env.CLOUDFLARE_DATABASE_ID;

  if (!accountId || !apiToken || !dbId) {
    throw new Error("Missing Cloudflare D1 credentials");
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sql, params })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`D1 Query failed: ${response.statusText} - ${errorText}`);
  }

  const data: any = await response.json();
  if (!data.success) {
    throw new Error(`D1 API returned error: ${JSON.stringify(data.errors)}`);
  }

  const queryResult = data.result[0];
  if (!queryResult.success) {
    throw new Error(`SQL execution error: ${JSON.stringify(queryResult.errors || data.errors)}`);
  }

  return queryResult.results || [];
};

const initD1Database = async () => {
  if (!isD1Enabled()) {
    console.log("Cloudflare D1 is not enabled (missing env variables). Running in offline mock mode.");
    return;
  }

  console.log("Initializing Cloudflare D1 database tables...");
  try {
    // Create departments table
    await queryD1(`
      CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        name TEXT,
        nameTh TEXT,
        manager TEXT,
        managerRole TEXT,
        managerImg TEXT,
        employeesCount INTEGER,
        otHours REAL,
        budgetUsed REAL,
        budgetUsedChange REAL,
        budgetUsedChangePct REAL,
        budgetUtilization REAL,
        status TEXT,
        icon TEXT
      )
    `);

    // Create employees table
    await queryD1(`
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT,
        deptId TEXT,
        role TEXT,
        targetOt REAL,
        actualOt REAL,
        otPct REAL,
        status TEXT,
        groupName TEXT,
        shifts TEXT
      )
    `);

    // Create requests table
    await queryD1(`
      CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        employeeId TEXT,
        name TEXT,
        dept TEXT,
        date TEXT,
        hours REAL,
        reason TEXT,
        status TEXT,
        urgency TEXT
      )
    `);

    // Create shift_config table
    await queryD1(`
      CREATE TABLE IF NOT EXISTS shift_config (
        pattern TEXT,
        currentMonth TEXT,
        currentDept TEXT
      )
    `);

    // Create ot_trend_data table
    await queryD1(`
      CREATE TABLE IF NOT EXISTS ot_trend_data (
        month TEXT,
        lastYear REAL,
        currentYear REAL
      )
    `);

    // Create accounts table
    await queryD1(`
      CREATE TABLE IF NOT EXISTS accounts (
        username TEXT PRIMARY KEY,
        password TEXT,
        name TEXT,
        role TEXT,
        deptId TEXT,
        avatar TEXT
      )
    `);

    // Check if departments has records, if not, seed them
    const depts = await queryD1("SELECT id FROM departments LIMIT 1");
    if (depts.length === 0) {
      console.log("Seeding initial D1 database data...");

      // Seed accounts
      for (const acc of appAccounts) {
        await queryD1(`
          INSERT INTO accounts (username, password, name, role, deptId, avatar)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [acc.username, acc.password, acc.name, acc.role, acc.deptId, acc.avatar]);
      }

      // Seed departments
      for (const d of appState.departments) {
        await queryD1(`
          INSERT INTO departments (id, name, nameTh, manager, managerRole, managerImg, employeesCount, otHours, budgetUsed, budgetUsedChange, budgetUsedChangePct, budgetUtilization, status, icon)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [d.id, d.name, d.nameTh, d.manager, d.managerRole, d.managerImg, d.employeesCount, d.otHours, d.budgetUsed, d.budgetUsedChange, d.budgetUsedChangePct, d.budgetUtilization, d.status, d.icon]);
      }

      // Seed employees
      for (const e of appState.employees) {
        await queryD1(`
          INSERT INTO employees (id, name, deptId, role, targetOt, actualOt, otPct, status, groupName, shifts)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [e.id, e.name, e.deptId, e.role, e.targetOt, e.actualOt, e.otPct, e.status, e.groupName, JSON.stringify(e.shifts)]);
      }

      // Seed requests
      for (const r of appState.requests) {
        await queryD1(`
          INSERT INTO requests (id, employeeId, name, dept, date, hours, reason, status, urgency)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [r.id, r.employeeId, r.name, r.dept, r.date, r.hours, r.reason, r.status, r.urgency]);
      }

      // Seed shift_config
      const sc = appState.shiftConfig;
      await queryD1(`
        INSERT INTO shift_config (pattern, currentMonth, currentDept)
        VALUES (?, ?, ?)
      `, [sc.pattern, sc.currentMonth, sc.currentDept]);

      // Seed ot_trend_data
      const td = appState.otTrendData;
      for (let i = 0; i < td.months.length; i++) {
        await queryD1(`
          INSERT INTO ot_trend_data (month, lastYear, currentYear)
          VALUES (?, ?, ?)
        `, [td.months[i], td.lastYear[i], td.currentYear[i]]);
      }
      console.log("Database seeded successfully.");
    }
    console.log("D1 Database initialization completed.");
  } catch (error) {
    console.error("Failed to initialize or seed D1 database:", error);
  }
};

// 0. Authentication Route
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    let account;
    if (isD1Enabled()) {
      const rows = await queryD1("SELECT * FROM accounts WHERE username = ?", [username]);
      if (rows && rows.length > 0) {
        account = rows[0];
      }
    } else {
      account = appAccounts.find(a => a.username === username);
    }

    if (account && password === account.password) {
      res.json({ success: true, user: account });
    } else {
      res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/update-profile", async (req, res) => {
  const { username, name, avatar, password } = req.body;
  try {
    let account;
    if (isD1Enabled()) {
      if (password) {
        await queryD1("UPDATE accounts SET name = ?, avatar = ?, password = ? WHERE username = ?", [name, avatar, password, username]);
      } else {
        await queryD1("UPDATE accounts SET name = ?, avatar = ? WHERE username = ?", [name, avatar, username]);
      }
      const rows = await queryD1("SELECT * FROM accounts WHERE username = ?", [username]);
      account = rows[0];
    } else {
      const idx = appAccounts.findIndex(a => a.username === username);
      if (idx !== -1) {
        appAccounts[idx].name = name;
        appAccounts[idx].avatar = avatar;
        if (password) {
          appAccounts[idx].password = password;
        }
        account = appAccounts[idx];
        saveLocalDb();
      }
    }

    if (account) {
      res.json({ success: true, user: account });
    } else {
      res.status(404).json({ error: "ไม่พบบัญชีผู้ใช้" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// User Management Routes
app.get("/api/accounts", async (req, res) => {
  try {
    let accountsList;
    if (isD1Enabled()) {
      accountsList = await queryD1("SELECT username, name, role, deptId, avatar FROM accounts");
    } else {
      accountsList = appAccounts.map(({ password, ...rest }) => rest);
    }
    res.json(accountsList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/update-account-permission", async (req, res) => {
  const { targetUsername, role, deptId } = req.body;
  try {
    if (isD1Enabled()) {
      await queryD1("UPDATE accounts SET role = ?, deptId = ? WHERE username = ?", [role, deptId, targetUsername]);
    } else {
      const idx = appAccounts.findIndex(a => a.username === targetUsername);
      if (idx !== -1) {
        appAccounts[idx].role = role;
        appAccounts[idx].deptId = deptId;
        saveLocalDb();
      }
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/reset-account-password", async (req, res) => {
  const { targetUsername, newPassword } = req.body;
  try {
    if (isD1Enabled()) {
      await queryD1("UPDATE accounts SET password = ? WHERE username = ?", [newPassword, targetUsername]);
    } else {
      const idx = appAccounts.findIndex(a => a.username === targetUsername);
      if (idx !== -1) {
        appAccounts[idx].password = newPassword;
        saveLocalDb();
      }
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/edit-account", async (req, res) => {
  const { originalUsername, username, name, role, deptId, avatar } = req.body;
  try {
    if (isD1Enabled()) {
      if (originalUsername !== username) {
        const existing = await queryD1("SELECT username FROM accounts WHERE username = ?", [username]);
        if (existing && existing.length > 0) {
          return res.status(400).json({ error: "ชื่อผู้ใช้นี้มีผู้ใช้งานอื่นอยู่แล้ว" });
        }
      }
      await queryD1(`
        UPDATE accounts 
        SET username = ?, name = ?, role = ?, deptId = ?, avatar = ? 
        WHERE username = ?
      `, [username, name, role, deptId, avatar, originalUsername]);
    } else {
      if (originalUsername !== username) {
        const existing = appAccounts.some(a => a.username === username);
        if (existing) {
          return res.status(400).json({ error: "ชื่อผู้ใช้นี้มีผู้ใช้งานอื่นอยู่แล้ว" });
        }
      }
      const idx = appAccounts.findIndex(a => a.username === originalUsername);
      if (idx !== -1) {
        appAccounts[idx].username = username;
        appAccounts[idx].name = name;
        appAccounts[idx].role = role;
        appAccounts[idx].deptId = deptId;
        appAccounts[idx].avatar = avatar;
        saveLocalDb();
      }
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// OT Trend Data management
app.get("/api/ot-trend", async (req, res) => {
  try {
    if (isD1Enabled()) {
      const rows = await queryD1("SELECT * FROM ot_trend_data ORDER BY rowid ASC");
      res.json(rows);
    } else {
      const td = appState.otTrendData;
      const rows = td.months.map((m: string, i: number) => ({
        month: m,
        lastYear: td.lastYear[i],
        currentYear: td.currentYear[i]
      }));
      res.json(rows);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/update-ot-trend", async (req, res) => {
  const { rows } = req.body; // Array of { month, lastYear, currentYear }
  if (!Array.isArray(rows)) {
    return res.status(400).json({ error: "rows must be an array" });
  }
  try {
    if (isD1Enabled()) {
      await queryD1("DELETE FROM ot_trend_data");
      for (const row of rows) {
        await queryD1(
          "INSERT INTO ot_trend_data (month, lastYear, currentYear) VALUES (?, ?, ?)",
          [row.month, Number(row.lastYear) || 0, Number(row.currentYear) || 0]
        );
      }
    } else {
      appState.otTrendData = {
        months: rows.map((r: any) => r.month),
        lastYear: rows.map((r: any) => Number(r.lastYear) || 0),
        currentYear: rows.map((r: any) => Number(r.currentYear) || 0)
      };
      saveLocalDb();
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1. Get current portal state
app.get("/api/portal-state", async (req, res) => {
  try {
    if (isD1Enabled()) {
      const departments = await queryD1("SELECT * FROM departments");
      const employeesRaw = await queryD1("SELECT * FROM employees");
      const requests = await queryD1("SELECT * FROM requests ORDER BY id DESC");
      const shiftConfigRaw = await queryD1("SELECT * FROM shift_config LIMIT 1");
      const otTrendDataRaw = await queryD1("SELECT * FROM ot_trend_data");

      const employees = employeesRaw.map((e: any) => ({
        ...e,
        shifts: JSON.parse(e.shifts)
      }));

      // Dynamically compute department stats from actual employee & request data
      const enrichedDepartments = departments.map((dept: any) => {
        const deptEmployees = employees.filter((e: any) => e.deptId === dept.id);
        const employeesCount = deptEmployees.length;

        // Sum actualOt from employees in this dept
        const otHours = deptEmployees.reduce((sum: number, e: any) => sum + (e.actualOt || 0), 0);

        // Budget = otHours * 300 baht/hr
        const budgetUsed = Math.round(otHours * 300);
        const budgetMax = 150000;
        const budgetUtilization = budgetMax > 0 ? Math.min(100, Math.round((budgetUsed / budgetMax) * 100)) : 0;
        const status = budgetUtilization > 95 ? "Warning" : "On Track";

        return {
          ...dept,
          employeesCount,
          otHours: Math.round(otHours * 10) / 10,
          budgetUsed,
          budgetUtilization,
          status
        };
      });

      const shiftConfig = shiftConfigRaw[0] || {
        pattern: "4-on-2-off",
        currentMonth: "พฤศจิกายน 2023",
        currentDept: "mfg"
      };

      const otTrendData = {
        months: otTrendDataRaw.map((t: any) => t.month),
        lastYear: otTrendDataRaw.map((t: any) => t.lastYear),
        currentYear: otTrendDataRaw.map((t: any) => t.currentYear)
      };

      res.json({
        departments: enrichedDepartments,
        employees,
        requests,
        shiftConfig,
        otTrendData
      });
    } else {
      // Offline mode: compute dynamically from appState too
      const enriched = appState.departments.map(dept => {
        const deptEmployees = appState.employees.filter(e => e.deptId === dept.id);
        const employeesCount = deptEmployees.length;
        const otHours = Math.round(deptEmployees.reduce((sum, e) => sum + (e.actualOt || 0), 0) * 10) / 10;
        const budgetUsed = Math.round(otHours * 300);
        const budgetMax = 150000;
        const budgetUtilization = budgetMax > 0 ? Math.min(100, Math.round((budgetUsed / budgetMax) * 100)) : 0;
        const status = budgetUtilization > 95 ? "Warning" : "On Track";
        return { ...dept, employeesCount, otHours, budgetUsed, budgetUtilization, status };
      });
      res.json({ ...appState, departments: enriched });
    }
  } catch (error: any) {
    console.error("Error fetching D1 portal state:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Save shift list updates
app.post("/api/save-shifts", async (req, res) => {
  try {
    const { employees } = req.body;
    if (Array.isArray(employees)) {
      if (isD1Enabled()) {
        for (const emp of employees) {
          await queryD1(
            "UPDATE employees SET shifts = ? WHERE id = ?",
            [JSON.stringify(emp.shifts), emp.id]
          );
        }
        const employeesRaw = await queryD1("SELECT * FROM employees");
        const updatedEmployees = employeesRaw.map((e: any) => ({
          ...e,
          shifts: JSON.parse(e.shifts)
        }));
        res.json({ success: true, message: "บันทึกตารางกะสำเร็จ", employees: updatedEmployees });
      } else {
        appState.employees = appState.employees.map(emp => {
          const updated = employees.find((e: any) => e.id === emp.id);
          if (updated) {
            return { ...emp, shifts: updated.shifts };
          }
          return emp;
        });
        saveLocalDb();
        res.json({ success: true, message: "บันทึกตารางกะสำเร็จ", employees: appState.employees });
      }
    } else {
      res.status(400).json({ error: "Invalid payload" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Add employee
app.post("/api/add-employee", async (req, res) => {
  try {
    const { id, name, deptId, role, groupName, targetOt } = req.body;
    const empId = id || "T-" + Math.floor(1000 + Math.random() * 9000);
    const empName = name || "พนักงานใหม่";
    const empDeptId = deptId || "mfg";
    const empRole = role || "General Operator";
    const empTargetOt = Number(targetOt) || 48;
    const empGroupName = groupName || "ทีม ก. (ช่างเทคนิคอาวุโส)";
    const empShifts = ["O", "O", "O", "O", "O", "O", "O", "O", "O", "O"];

    const newEmp = {
      id: empId,
      name: empName,
      deptId: empDeptId,
      role: empRole,
      targetOt: empTargetOt,
      actualOt: 0,
      otPct: 0,
      status: "On Track",
      groupName: empGroupName,
      shifts: empShifts
    };

    if (isD1Enabled()) {
      await queryD1(`
        INSERT INTO employees (id, name, deptId, role, targetOt, actualOt, otPct, status, groupName, shifts)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [empId, empName, empDeptId, empRole, empTargetOt, 0, 0, "On Track", empGroupName, JSON.stringify(empShifts)]);

      await queryD1(
        "UPDATE departments SET employeesCount = employeesCount + 1 WHERE id = ?",
        [empDeptId]
      );
    } else {
      appState.employees.push(newEmp);
      const dept = appState.departments.find(d => d.id === empDeptId);
      if (dept) {
        dept.employeesCount += 1;
      }
      saveLocalDb();
    }

    res.json({ success: true, employee: newEmp });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3.5 Clear Mock Data
app.post("/api/clear-mock-data", async (req, res) => {
  try {
    if (isD1Enabled()) {
      await queryD1("DELETE FROM employees");
      await queryD1("DELETE FROM requests");
      await queryD1(`
        UPDATE departments 
        SET employeesCount = 0, 
            otHours = 0, 
            budgetUsed = 0, 
            budgetUtilization = 0,
            status = 'On Track'
      `);
    } else {
      appState.employees = [];
      appState.requests = [];
      appState.departments.forEach(d => {
        d.employeesCount = 0;
        d.otHours = 0;
        d.budgetUsed = 0;
        d.budgetUtilization = 0;
        d.status = 'On Track';
      });
      saveLocalDb();
    }
    res.json({ success: true, message: "ล้างข้อมูลตัวอย่างเสร็จสิ้น" });
  } catch (error: any) {
    console.error("Clear database error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Submit New Request
app.post("/api/add-request", async (req, res) => {
  try {
    const { employeeId, date, hours, reason, urgency } = req.body;

    let emp: any;
    let deptName = "Other";

    if (isD1Enabled()) {
      const emps = await queryD1("SELECT * FROM employees WHERE id = ? LIMIT 1", [employeeId]);
      if (emps.length === 0) {
        return res.status(404).json({ error: "ไม่พบพนักงานดังกล่าว" });
      }
      emp = emps[0];
      const depts = await queryD1("SELECT * FROM departments WHERE id = ? LIMIT 1", [emp.deptId]);
      if (depts.length > 0) {
        deptName = depts[0].name;
      }
    } else {
      emp = appState.employees.find(e => e.id === employeeId);
      if (!emp) {
        return res.status(404).json({ error: "ไม่พบพนักงานดังกล่าว" });
      }
      deptName = appState.departments.find(d => d.id === emp.deptId)?.name || "Other";
    }

    const reqCount = isD1Enabled()
      ? (await queryD1("SELECT count(*) as count FROM requests"))[0].count
      : appState.requests.length;

    const newReqId = "REQ-" + String(reqCount + 1).padStart(3, '0');
    const reqHours = Number(hours) || 4;
    const reqDate = date || new Date().toISOString().split('T')[0];
    const reqReason = reason || "ต้องการทำโอทีเพิ่มเติมเนื่องจากปริมาณงานสูง";
    const reqUrgency = urgency || "Medium";

    const newReq = {
      id: newReqId,
      employeeId,
      name: emp.name,
      dept: deptName,
      date: reqDate,
      hours: reqHours,
      reason: reqReason,
      status: "Pending",
      urgency: reqUrgency
    };

    if (isD1Enabled()) {
      await queryD1(`
        INSERT INTO requests (id, employeeId, name, dept, date, hours, reason, status, urgency)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [newReqId, employeeId, emp.name, deptName, reqDate, reqHours, reqReason, "Pending", reqUrgency]);
    } else {
      appState.requests.unshift(newReq);
      saveLocalDb();
    }

    res.json({ success: true, request: newReq });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Update request status
app.post("/api/update-request", async (req, res) => {
  try {
    const { requestId, status } = req.body;

    if (isD1Enabled()) {
      const requests = await queryD1("SELECT * FROM requests WHERE id = ? LIMIT 1", [requestId]);
      if (requests.length > 0) {
        const reqItem = requests[0];
        await queryD1("UPDATE requests SET status = ? WHERE id = ?", [status, requestId]);

        if (status === "Approved") {
          const emps = await queryD1("SELECT * FROM employees WHERE id = ? LIMIT 1", [reqItem.employeeId]);
          if (emps.length > 0) {
            const emp = emps[0];
            const newActualOt = emp.actualOt + reqItem.hours;
            const newOtPct = Math.round((newActualOt / emp.targetOt) * 100);
            const newEmpStatus = newActualOt > emp.targetOt ? "Warning" : "On Track";

            await queryD1(
              "UPDATE employees SET actualOt = ?, otPct = ?, status = ? WHERE id = ?",
              [newActualOt, newOtPct, newEmpStatus, reqItem.employeeId]
            );

            const depts = await queryD1("SELECT * FROM departments WHERE id = ? LIMIT 1", [emp.deptId]);
            if (depts.length > 0) {
              const dept = depts[0];
              const newOtHours = dept.otHours + reqItem.hours;
              const newBudgetUsed = dept.budgetUsed + reqItem.hours * 300;
              const newBudgetUtilization = Math.round((newBudgetUsed / 150000) * 100);
              const newDeptStatus = newBudgetUtilization > 95 ? "Warning" : "On Track";

              await queryD1(
                "UPDATE departments SET otHours = ?, budgetUsed = ?, budgetUtilization = ?, status = ? WHERE id = ?",
                [newOtHours, newBudgetUsed, newBudgetUtilization, newDeptStatus, emp.deptId]
              );
            }
          }
        }
      }

      const allRequests = await queryD1("SELECT * FROM requests ORDER BY id DESC");
      res.json({ success: true, requests: allRequests });
    } else {
      const reqItem = appState.requests.find(r => r.id === requestId);
      if (reqItem) {
        reqItem.status = status;
        if (status === "Approved") {
          const emp = appState.employees.find(e => e.id === reqItem.employeeId);
          if (emp) {
            emp.actualOt += reqItem.hours;
            emp.otPct = Math.round((emp.actualOt / emp.targetOt) * 100);
            if (emp.actualOt > emp.targetOt) {
              emp.status = "Warning";
            }
            const dept = appState.departments.find(d => d.id === emp.deptId);
            if (dept) {
              dept.otHours += reqItem.hours;
              dept.budgetUsed += reqItem.hours * 300;
              dept.budgetUtilization = Math.round((dept.budgetUsed / 150000) * 100);
              if (dept.budgetUtilization > 95) {
                dept.status = "Warning";
              }
            }
          }
        }
        saveLocalDb();
      }
      res.json({ success: true, requests: appState.requests });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Edit employee
app.post("/api/edit-employee", async (req, res) => {
  try {
    const { id, name, deptId, role, groupName, targetOt } = req.body;
    if (!id) {
      return res.status(400).json({ error: "ไม่ระบุรหัสพนักงาน" });
    }

    const newTargetOt = Number(targetOt) || 48;

    if (isD1Enabled()) {
      // Find current employee to check old department
      const currentEmps = await queryD1("SELECT deptId FROM employees WHERE id = ? LIMIT 1", [id]);
      if (currentEmps.length === 0) {
        return res.status(404).json({ error: "ไม่พบพนักงานดังกล่าว" });
      }
      const oldDeptId = currentEmps[0].deptId;

      // Update employee
      await queryD1(
        "UPDATE employees SET name = ?, deptId = ?, role = ?, groupName = ?, targetOt = ?, otPct = ROUND((actualOt / ?) * 100), status = CASE WHEN actualOt > ? THEN 'Warning' ELSE 'On Track' END WHERE id = ?",
        [name, deptId, role, groupName, newTargetOt, newTargetOt, newTargetOt, id]
      );

      // If department changed, update counts
      if (oldDeptId !== deptId) {
        await queryD1("UPDATE departments SET employeesCount = employeesCount - 1 WHERE id = ?", [oldDeptId]);
        await queryD1("UPDATE departments SET employeesCount = employeesCount + 1 WHERE id = ?", [deptId]);
      }
    } else {
      const empIndex = appState.employees.findIndex(e => e.id === id);
      if (empIndex === -1) {
        return res.status(404).json({ error: "ไม่พบพนักงานดังกล่าว" });
      }

      const emp = appState.employees[empIndex];
      const oldDeptId = emp.deptId;

      emp.name = name || emp.name;
      emp.deptId = deptId || emp.deptId;
      emp.role = role || emp.role;
      emp.groupName = groupName || emp.groupName;
      emp.targetOt = newTargetOt;
      emp.otPct = Math.round((emp.actualOt / emp.targetOt) * 100);
      emp.status = emp.actualOt > emp.targetOt ? "Warning" : "On Track";

      // If department changed, update counts
      if (oldDeptId !== deptId) {
        const oldDept = appState.departments.find(d => d.id === oldDeptId);
        if (oldDept) oldDept.employeesCount = Math.max(0, oldDept.employeesCount - 1);

        const newDept = appState.departments.find(d => d.id === deptId);
        if (newDept) newDept.employeesCount += 1;
      }
      saveLocalDb();
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Gemini API Smart OT Audit and Optimization Advisor
app.post("/api/audit-report", async (req, res) => {
  try {
    const ai = getGeminiClient();

    let employeesData: any[] = [];
    let deptsData: any[] = [];

    if (isD1Enabled()) {
      const emps = await queryD1("SELECT * FROM employees");
      employeesData = emps.map((e: any) => ({
        ...e,
        shifts: JSON.parse(e.shifts)
      }));
      deptsData = await queryD1("SELECT * FROM departments");
    } else {
      employeesData = appState.employees;
      deptsData = appState.departments;
    }

    if (!ai) {
      const araya = employeesData.find(e => e.name.includes("อารยา"));
      const arayaOt = araya ? araya.actualOt : 74.5;
      const qaDept = deptsData.find(d => d.id === "qa");
      const qaUtil = qaDept ? qaDept.budgetUtilization : 98;

      return res.json({
        report: `### 🤖 ข้อผิดพลาด: ไม่พบ API Key (Gemini API Key missing)

ขอแนะนำให้ตรวจสอบความถูกต้องและตั้งค่า \`GEMINI_API_KEY\` ในแถบ **Settings > Secrets** บน AI Studio UI

**บทสรุปเบื้องต้นแบบจำลอง (Offline Audit Analysis):**
1. **พนักงานเกินเวลาเป้าหมาย (Overtime Violations):** คุณ **อารยา รักดี** ทำชั่วโมง OT รวม ${arayaOt} ชั่วโมง (เป้าหมายไม่เกิน 48 ชม.) ซึ่งมีความเสี่ยงด้านสุขภาพและกฎหมายแรงงานไทย
2. **งบประมาณรายแผนกคลาวด์:** แผนก **ตรวจสอบคุณภาพ (QA)** มีอัตราการใช้งบสะสมถึง ${qaUtil}% (ใกล้เคียงงบประมาณสูงสุดที่ตั้งไว้) แนะนำให้ลดหรือสลับกะพนักงานบางราย
3. **การแก้ไขข้อแนะนำ:** ควรสลับกะเป็นระบบกมลเพื่อปรับสมดุลกำลังพล`
      });
    }

    const formattedEmployees = employeesData.map(e =>
      `- ${e.name} (${e.id}) [${e.role}]: Actual OT = ${e.actualOt} hrs, Target = ${e.targetOt} hrs, Status = ${e.status}, Shifts: [${e.shifts.join(", ")}]`
    ).join("\n");

    const formattedDepts = deptsData.map(d =>
      `- ${d.nameTh}: OT Hours = ${d.otHours} hrs, Budget Used = ${d.budgetUsed} THB, Utilization = ${d.budgetUtilization}%, Status = ${d.status}`
    ).join("\n");

    const prompt = `คุณคือผู้เชี่ยวชาญด้านระบบทรัพยากรบุคคล การจัดการกะทำงาน (Shift Scheduling) และกฎหมายแรงงานสำหรับการทำงานในโรงงานอุตสาหกรรม (Operational Technology - OT)
นี่คือข้อมูลสถานะตารางทำงานและโอทีของบริษัทในพฤศจิกายน 2023:

[ข้อมูลแผนกและงบประมาณ]
${formattedDepts}

[ข้อมูลพนักงานและการทำ OT]
${formattedEmployees}

กรุณาวิเคราะห์ข้อมูลข้างต้น และเขียนรายงานการตรวจสอบ (OT & Shift Audit Report) เป็นภาษาไทย โดยระบุหัวข้อต่อไปนี้ด้วยน้ำเสียงมืออาชีพ สรุปประเด็น สั้น กระชับ แต่อ่านเข้าใจง่าย:
1. **สรุปความเสี่ยงและพฤติกรรมผิดกฎระเบียบ (Risk Summary)**: วิเคราะห์เรื่องพนักงานที่มี OT เกินขีดจำกัด (เช่น อารยา รักดี 74.5 ชม. เกิน 48 ชม. และความเสี่ยงต่อกฎหมายแรงงานไทยที่จำกัดไม่เกิน 36 ชม./สัปดาห์ หรือความเหนื่อยล้าทางกาย)
2. **วิเคราะห์งบประมาณที่เกินเกณฑ์ (Budget Overruns)**: ระบุแผนกที่มีอัตราการใช้งบประมาณสูงใกล้ขีดจำกัด (เช่น แผนก QA ที่ 98%)
3. **ข้อเสนอแนะอัจฉริยะในการจัดสรรกะใหม่ (AI-Driven Scheduling Reallocation)**: แนะนำแนวทางการปรับตารางทำงาน สลับกะ สลับกะเช้า/บ่าย/ดึก (M, A, N, O) หรือสลับกำลังพลจากแผนกอื่นที่มีกำลังพลเหลือ เพื่อลดความเมื่อยล้าและรักษาระดับการควบคุมงบประมาณอย่างสมบูรณ์แบบ

กรุณาเขียนรายงานเป็น Markdown ที่ใช้สัญลักษณ์ที่สวยงาม (เช่น ⚠️, 📊, 💡) มีเลย์เอาท์ที่สะอาดเรียบร้อย น่าอ่าน`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ report: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite server integrations
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Initialize D1 database tables if enabled
  await initD1Database();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

