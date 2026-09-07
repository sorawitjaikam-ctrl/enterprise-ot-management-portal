import { CompanyHoliday, DepartmentRestDayPolicy } from "../types";

/**
 * 15 วันหยุดตามประเพณีของบริษัท ประจำปี 2569 (Company Traditional Holidays 2026)
 * สอดคล้องตามเกณฑ์กฎหมายแรงงานไทย (อย่างน้อย 13 วันต่อปี)
 */
export const DEFAULT_COMPANY_HOLIDAYS_2026: CompanyHoliday[] = [
  { id: "hol-01", date: "2026-01-01", nameTh: "วันขึ้นปีใหม่", nameEn: "New Year's Day", isCustom: false },
  { id: "hol-02", date: "2026-03-03", nameTh: "วันมาฆบูชา", nameEn: "Makha Bucha Day", isCustom: false },
  { id: "hol-03", date: "2026-04-06", nameTh: "วันพระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช และวันที่ระลึกมหาจักรีบรมราชวงศ์", nameEn: "Chakri Memorial Day", isCustom: false },
  { id: "hol-04", date: "2026-04-13", nameTh: "วันสงกรานต์", nameEn: "Songkran Festival", isCustom: false },
  { id: "hol-05", date: "2026-04-14", nameTh: "วันสงกรานต์", nameEn: "Songkran Festival", isCustom: false },
  { id: "hol-06", date: "2026-04-15", nameTh: "วันสงกรานต์", nameEn: "Songkran Festival", isCustom: false },
  { id: "hol-07", date: "2026-05-01", nameTh: "วันแรงงานแห่งชาติ", nameEn: "National Labour Day", isCustom: false },
  { id: "hol-08", date: "2026-05-04", nameTh: "วันฉัตรมงคล", nameEn: "Coronation Day", isCustom: false },
  { id: "hol-09", date: "2026-05-31", nameTh: "วันวิสาขบูชา", nameEn: "Visakha Bucha Day", isCustom: false },
  { id: "hol-10", date: "2026-07-28", nameTh: "วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว", nameEn: "King Maha Vajiralongkorn's Birthday", isCustom: false },
  { id: "hol-11", date: "2026-07-29", nameTh: "วันอาสาฬหบูชา", nameEn: "Asanha Bucha Day", isCustom: false },
  { id: "hol-12", date: "2026-08-12", nameTh: "วันแม่แห่งชาติ / วันเฉลิมพระชนมพรรษาสมเด็จพระบรมราชชนนีพันปีหลวง", nameEn: "The Queen Mother's Birthday / Mother's Day", isCustom: false },
  { id: "hol-13", date: "2026-10-13", nameTh: "วันนวมินทรมหาราช", nameEn: "King Bhumibol Adulyadej The Great Memorial Day", isCustom: false },
  { id: "hol-14", date: "2026-10-23", nameTh: "วันปิยมหาราช", nameEn: "Chulalongkorn Memorial Day", isCustom: false },
  { id: "hol-15", date: "2026-12-05", nameTh: "วันพ่อแห่งชาติ / วันคล้ายวันพระบรมราชสมภพ ร.9", nameEn: "King Bhumibol Adulyadej The Great's Birthday / Father's Day", isCustom: false },
];

/**
 * นโยบายวันหยุดประจำสัปดาห์เริ่มต้น (Default Weekly Rest Day Policies)
 * แต่ละแผนกสามารถกำหนดได้ เช่น วันอาทิตย์ (sunday_only), เสาร์-อาทิตย์ (sat_sun), หรือหมุนเวียน (rotating_6_1)
 */
export const DEFAULT_DEPARTMENT_REST_POLICIES: DepartmentRestDayPolicy[] = [
  { deptId: "inter2", policyType: "sunday_only", customRestDays: [0] },
  { deptId: "inter3", policyType: "sunday_only", customRestDays: [0] },
  { deptId: "inter5", policyType: "sunday_only", customRestDays: [0] },
  { deptId: "inter7", policyType: "sunday_only", customRestDays: [0] },
  { deptId: "heavy", policyType: "sunday_only", customRestDays: [0] },
  { deptId: "ecc", policyType: "sunday_only", customRestDays: [0] },
];

/**
 * ฟังก์ชันตรวจสอบว่าวันที่ระบุตรงกับวันหยุดตามประเพณีของบริษัทหรือไม่
 */
export const isDateCompanyHoliday = (dateStr: string, holidays: CompanyHoliday[] = DEFAULT_COMPANY_HOLIDAYS_2026): boolean => {
  if (!dateStr || !Array.isArray(holidays)) return false;
  return holidays.some(h => h.date === dateStr);
};

/**
 * ดึงข้อมูลวันหยุดตามประเพณีของวันที่ระบุ
 */
export const getCompanyHolidayForDate = (dateStr: string, holidays: CompanyHoliday[] = DEFAULT_COMPANY_HOLIDAYS_2026): CompanyHoliday | undefined => {
  if (!dateStr || !Array.isArray(holidays)) return undefined;
  return holidays.find(h => h.date === dateStr);
};

/**
 * ฟังก์ชันตรวจสอบว่าวันที่ระบุตรงกับวันหยุดประจำสัปดาห์ตามนโยบายของแผนกหรือไม่
 * dayOfWeek: 0 = อาทิตย์, 1 = จันทร์, ..., 6 = เสาร์
 */
export const isDateWeeklyRestDay = (
  dayOfWeek: number,
  deptId?: string,
  policies: DepartmentRestDayPolicy[] = DEFAULT_DEPARTMENT_REST_POLICIES
): boolean => {
  if (!deptId || !Array.isArray(policies)) {
    return dayOfWeek === 0;
  }
  const cleanDeptId = deptId.trim().toLowerCase().replace(/\s+/g, "");
  const policy = policies.find(p => p.deptId.trim().toLowerCase().replace(/\s+/g, "") === cleanDeptId);
  if (!policy) {
    return dayOfWeek === 0;
  }

  if (policy.policyType === "sat_sun") {
    return dayOfWeek === 0 || dayOfWeek === 6;
  }
  if (policy.policyType === "custom" && Array.isArray(policy.customRestDays)) {
    return policy.customRestDays.includes(dayOfWeek);
  }
  return dayOfWeek === 0;
};
