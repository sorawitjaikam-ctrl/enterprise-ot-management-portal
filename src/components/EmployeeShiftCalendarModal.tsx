import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  X, 
  Calendar as CalendarIcon, 
  Check, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  CalendarDays,
  CalendarRange,
  Zap,
  Layers,
  Copy,
  Sliders,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { Employee } from "../types";

export interface CustomShiftType {
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  workHours: number;
  otHours: number;
  bgClass: string;
  borderClass: string;
  textClass: string;
  isCustom?: boolean;
}

// Built-in shift presets matching the company's official shift matrix & legend
export const DEFAULT_SHIFT_PRESETS: CustomShiftType[] = [
  {
    code: "M8",
    name: "กะเช้า 8 ชม. (07:00 - 15:00)",
    startTime: "07:00",
    endTime: "15:00",
    workHours: 8,
    otHours: 0,
    bgClass: "bg-[#CFE2F3]",
    borderClass: "border-[#9FC5E8]",
    textClass: "text-black font-bold"
  },
  {
    code: "A8",
    name: "กะบ่าย 8 ชม. (15:00 - 23:00)",
    startTime: "15:00",
    endTime: "23:00",
    workHours: 8,
    otHours: 0,
    bgClass: "bg-[#FFF2CC]",
    borderClass: "border-[#FFE599]",
    textClass: "text-black font-bold"
  },
  {
    code: "N8",
    name: "กะดึก 8 ชม. (23:00 - 07:00)",
    startTime: "23:00",
    endTime: "07:00",
    workHours: 8,
    otHours: 0,
    bgClass: "bg-[#FCE5CD]",
    borderClass: "border-[#F9CB9C]",
    textClass: "text-black font-bold"
  },
  {
    code: "M12",
    name: "กะเช้า 8 OT 4 (07:00 - 19:00)",
    startTime: "07:00",
    endTime: "19:00",
    workHours: 12,
    otHours: 4,
    bgClass: "bg-[#CFE2F3]",
    borderClass: "border-[#9FC5E8]",
    textClass: "text-[#2563EB] font-black"
  },
  {
    code: "A12",
    name: "กะบ่าย 8 OT 4 (15:00 - 03:00)",
    startTime: "15:00",
    endTime: "03:00",
    workHours: 12,
    otHours: 4,
    bgClass: "bg-[#FFE599]",
    borderClass: "border-[#FFD966]",
    textClass: "text-black font-bold"
  },
  {
    code: "N12",
    name: "กะดึก 8 OT 4 (19:00 - 07:00)",
    startTime: "19:00",
    endTime: "07:00",
    workHours: 12,
    otHours: 4,
    bgClass: "bg-[#FCE5CD]",
    borderClass: "border-[#F9CB9C]",
    textClass: "text-[#E60000] font-black"
  },
  {
    code: "M16",
    name: "กะเช้า 8 OT 8 (07:00 - 23:00)",
    startTime: "07:00",
    endTime: "23:00",
    workHours: 16,
    otHours: 8,
    bgClass: "bg-[#0B5394]",
    borderClass: "border-[#073763]",
    textClass: "text-white font-black"
  },
  {
    code: "N16",
    name: "กะดึก 8 OT 8 (19:00 - 11:00)",
    startTime: "19:00",
    endTime: "11:00",
    workHours: 16,
    otHours: 8,
    bgClass: "bg-[#E60000]",
    borderClass: "border-[#990000]",
    textClass: "text-white font-black"
  },
  {
    code: "D",
    name: "กะกลางวันปกติ (08:00 - 17:00)",
    startTime: "08:00",
    endTime: "17:00",
    workHours: 8,
    otHours: 0,
    bgClass: "bg-[#D9D9D9]",
    borderClass: "border-[#B7B7B7]",
    textClass: "text-[#333333] font-bold"
  },
  {
    code: "OND",
    name: "วันหยุด ON DUTY (OT 8h)",
    startTime: "08:00",
    endTime: "17:00",
    workHours: 8,
    otHours: 8,
    bgClass: "bg-[#00FFFF]",
    borderClass: "border-[#00D2D2]",
    textClass: "text-black font-black"
  },
  {
    code: "OFF",
    name: "วันหยุดประจำสัปดาห์ (Off)",
    startTime: "-",
    endTime: "-",
    workHours: 0,
    otHours: 0,
    bgClass: "bg-white",
    borderClass: "border-[#DCE4EA]",
    textClass: "text-[#6A7B87] font-medium"
  },
  {
    code: "H",
    name: "วันหยุดประจำปี (Annual Holiday)",
    startTime: "-",
    endTime: "-",
    workHours: 0,
    otHours: 0,
    bgClass: "bg-[#ffe4e6]",
    borderClass: "border-[#fecdd3]",
    textClass: "text-[#be123c] font-bold"
  }
];

export interface EmployeeShiftCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  employees?: Employee[];
  onSelectEmployee?: (emp: Employee) => void;
  currentYear?: number;
  currentMonth?: number; // 1-12
  onSaveEmployeeShifts?: (empId: string, year: number, month: number, shifts: string[]) => Promise<void> | void;
  onSaveEmployeeYearlyShifts?: (empId: string, year: number, yearlyShifts: Record<number, string[]>) => Promise<void> | void;
}

const THAI_MONTH_NAMES = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", 
  "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", 
  "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const THAI_DAY_NAMES = [
  "อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"
];

export type ShiftSetupMode = "daily" | "weekly" | "monthly" | "yearly";

export default function EmployeeShiftCalendarModal({
  isOpen,
  onClose,
  employee,
  employees = [],
  onSelectEmployee,
  currentYear = 2026,
  currentMonth = 11, // Default November per screenshot
  onSaveEmployeeShifts,
  onSaveEmployeeYearlyShifts
}: EmployeeShiftCalendarModalProps) {
  // Calendar View Selection
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth); // 1-12
  const [isEditMode, setIsEditMode] = useState<boolean>(true); // Default editable
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Active Setup Mode (Daily, Weekly, Monthly, Yearly)
  const [setupMode, setSetupMode] = useState<ShiftSetupMode>("daily");

  // Quick Brush Shift (for stamping on daily mode)
  const [activeBrushShift, setActiveBrushShift] = useState<string>("M8");

  // Weekly Setup State
  const [weeklyTemplate, setWeeklyTemplate] = useState<Record<number, string>>({
    0: "OFF",      // อาทิตย์
    1: "M8",       // จันทร์
    2: "M8",       // อังคาร
    3: "M8",       // พุธ
    4: "M8",       // พฤหัสบดี
    5: "M8",       // ศุกร์
    6: "OFF"       // เสาร์
  });

  // Cyclical Rotation State (e.g. 4-on-2-off)
  const [cycleWorkDays, setCycleWorkDays] = useState<number>(4);
  const [cycleOffDays, setCycleOffDays] = useState<number>(2);
  const [cycleWorkShift, setCycleWorkShift] = useState<string>("M12");
  const [cycleOffShift, setCycleOffShift] = useState<string>("OFF");
  const [cycleStartDay, setCycleStartDay] = useState<number>(1);

  // Monthly Setup State
  const [monthFillShift, setMonthFillShift] = useState<string>("M8");

  // Yearly Setup State
  const [yearlyPreset, setYearlyPreset] = useState<"copy_current" | "mon_fri" | "day_office" | "cycle_4_2">("copy_current");
  const [yearlyProgress, setYearlyProgress] = useState<{ current: number; total: number } | null>(null);

  // Custom Shift Types Library
  const [customShifts, setCustomShifts] = useState<CustomShiftType[]>(() => {
    try {
      const stored = localStorage.getItem("custom_shift_types_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter(s => s.code !== "NRMD" && s.code !== "NORM" && !s.code.includes("NRM10"));
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch (_) {}
    return DEFAULT_SHIFT_PRESETS;
  });

  // Modals inside calendar
  const [showShiftPicker, setShowShiftPicker] = useState<boolean>(false);
  const [showCustomShiftManager, setShowCustomShiftManager] = useState<boolean>(false);
  const [showHolidayModal, setShowHolidayModal] = useState<boolean>(false);

  // Executive Confirm & Alert Modal States
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onClose?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: ""
  });

  const showAlert = (title: string, message: string, onClose?: () => void) => {
    setAlertModal({ isOpen: true, title, message, onClose });
  };

  // Form states for creating custom shift
  const [newShiftCode, setNewShiftCode] = useState<string>("");
  const [newShiftName, setNewShiftName] = useState<string>("");
  const [newShiftStart, setNewShiftStart] = useState<string>("08:00");
  const [newShiftEnd, setNewShiftEnd] = useState<string>("17:00");
  const [newShiftWorkHours, setNewShiftWorkHours] = useState<number>(8);
  const [newShiftOtHours, setNewShiftOtHours] = useState<number>(0);
  const [newShiftColorTheme, setNewShiftColorTheme] = useState<"yellow" | "purple" | "blue" | "green" | "rose">("yellow");

  // Shifts state for the selected month (array of length = days in month)
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

  // Helper to extract employee shifts for this month
  const getInitialMonthlyShifts = useCallback((): string[] => {
    if (!employee) return Array(daysInMonth).fill("OFF");

    const rawShifts: any = employee.shifts;
    let monthArray: string[] = [];

    if (Array.isArray(rawShifts)) {
      monthArray = rawShifts.slice(0, daysInMonth);
    } else if (rawShifts && typeof rawShifts === "object") {
      monthArray = rawShifts[monthKey] || [];
    }

    // Default template if empty: Sunday/Saturday = OFF, Mon-Fri = M8
    if (!monthArray || monthArray.length === 0) {
      const result: string[] = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(selectedYear, selectedMonth - 1, d);
        const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          result.push("OFF");
        } else {
          result.push("M8");
        }
      }
      return result;
    }

    // Ensure array length matches daysInMonth and normalize legacy codes
    const normalized = monthArray.map(code => {
      if (code === "NRMD" || code === "NORM") return "M8";
      if (typeof code === "string" && (code.includes("NRM10") || code.includes("[x]"))) return "OND";
      if (code === "O") return "OFF";
      return code || "OFF";
    });

    while (normalized.length < daysInMonth) {
      normalized.push("OFF");
    }
    return normalized.slice(0, daysInMonth);
  }, [employee, selectedYear, selectedMonth, daysInMonth, monthKey]);

  const [monthlyShifts, setMonthlyShifts] = useState<string[]>(getInitialMonthlyShifts);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Sync when employee or month/year changes
  useEffect(() => {
    setMonthlyShifts(getInitialMonthlyShifts());
    setSelectedDay(null);
    setHasChanges(false);
  }, [getInitialMonthlyShifts]);

  // Persist custom shifts
  useEffect(() => {
    try {
      localStorage.setItem("custom_shift_types_v2", JSON.stringify(customShifts));
    } catch (_) {}
  }, [customShifts]);

  // Calculate day-of-week offset for the 1st of the month (0 = Sun, 1 = Mon ... 6 = Sat)
  const firstDayOffset = useMemo(() => {
    return new Date(selectedYear, selectedMonth - 1, 1).getDay();
  }, [selectedYear, selectedMonth]);

  // Handle keyboard shortcut (Delete / Backspace to clear shift on selected day)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedDay !== null && (e.key === "Delete" || e.key === "Backspace")) {
        e.preventDefault();
        handleSetDayShift(selectedDay, "OFF");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedDay]);

  // Set shift for a specific day
  const handleSetDayShift = (dayNum: number, shiftCode: string) => {
    const idx = dayNum - 1;
    if (idx < 0 || idx >= monthlyShifts.length) return;

    setMonthlyShifts(prev => {
      const next = [...prev];
      next[idx] = shiftCode;
      return next;
    });
    setHasChanges(true);
  };

  // Find shift styling
  const getShiftMeta = (shiftCode: string): CustomShiftType => {
    let codeClean = (shiftCode || "OFF").trim();
    if (codeClean === "NRMD" || codeClean === "NORM") codeClean = "M8";
    if (codeClean.includes("NRM10") || codeClean.includes("[x]")) codeClean = "OND";

    const found = customShifts.find(s => s.code.toUpperCase() === codeClean.toUpperCase());
    if (found) return found;

    const defaultFound = DEFAULT_SHIFT_PRESETS.find(s => s.code.toUpperCase() === codeClean.toUpperCase());
    if (defaultFound) return defaultFound;

    if (codeClean === "O" || codeClean === "OFF" || codeClean === "-") {
      return {
        code: "OFF",
        name: "วันหยุด (Off)",
        startTime: "-",
        endTime: "-",
        workHours: 0,
        otHours: 0,
        bgClass: "bg-white",
        borderClass: "border-[#DCE4EA]",
        textClass: "text-[#6A7B87]"
      };
    }

    return {
      code: codeClean,
      name: `กะงาน ${codeClean}`,
      startTime: "08:00",
      endTime: "17:00",
      workHours: 8,
      otHours: 0,
      bgClass: "bg-[#F3F6F8]",
      borderClass: "border-[#DCE4EA]",
      textClass: "text-[#333B41]"
    };
  };

  // Weekly Shift Application Handlers
  const handleApplyWeeklyTemplate = () => {
    const nextShifts: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(selectedYear, selectedMonth - 1, d);
      const dow = dateObj.getDay(); // 0-6
      nextShifts.push(weeklyTemplate[dow] || "OFF");
    }
    setMonthlyShifts(nextShifts);
    setHasChanges(true);
  };

  const handleApplyWeeklyPreset = (preset: "standard_office" | "day_office" | "with_weekend_ot" | "morning_12h") => {
    let nextTemplate: Record<number, string> = { ...weeklyTemplate };
    if (preset === "standard_office") {
      nextTemplate = { 0: "OFF", 1: "M8", 2: "M8", 3: "M8", 4: "M8", 5: "M8", 6: "OFF" };
    } else if (preset === "day_office") {
      nextTemplate = { 0: "OFF", 1: "D", 2: "D", 3: "D", 4: "D", 5: "D", 6: "OFF" };
    } else if (preset === "with_weekend_ot") {
      nextTemplate = { 0: "OND", 1: "M8", 2: "M8", 3: "M8", 4: "M8", 5: "M8", 6: "OND" };
    } else if (preset === "morning_12h") {
      nextTemplate = { 0: "OFF", 1: "M12", 2: "M12", 3: "M12", 4: "M12", 5: "M12", 6: "M12" };
    }
    setWeeklyTemplate(nextTemplate);

    const nextShifts: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(selectedYear, selectedMonth - 1, d);
      const dow = dateObj.getDay();
      nextShifts.push(nextTemplate[dow] || "OFF");
    }
    setMonthlyShifts(nextShifts);
    setHasChanges(true);
  };

  const handleApplyCyclicalRotation = () => {
    const cycleTotal = Math.max(1, cycleWorkDays + cycleOffDays);
    const nextShifts: string[] = [];
    const offset = Math.max(1, cycleStartDay) - 1;

    for (let d = 1; d <= daysInMonth; d++) {
      const dayPos = (d - 1 + offset) % cycleTotal;
      if (dayPos < cycleWorkDays) {
        nextShifts.push(cycleWorkShift);
      } else {
        nextShifts.push(cycleOffShift);
      }
    }
    setMonthlyShifts(nextShifts);
    setHasChanges(true);
  };

  // Monthly Shift Application Handlers
  const handleFillWholeMonth = (shiftCode: string) => {
    setMonthlyShifts(Array(daysInMonth).fill(shiftCode));
    setHasChanges(true);
  };

  const handleCopyPreviousMonth = () => {
    if (!employee) return;
    const prevM = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevY = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    const prevKey = `${prevY}-${String(prevM).padStart(2, "0")}`;
    const rawShifts: any = employee.shifts;
    let prevArray: string[] = [];

    if (rawShifts && typeof rawShifts === "object" && !Array.isArray(rawShifts)) {
      prevArray = rawShifts[prevKey] || [];
    } else if (Array.isArray(rawShifts)) {
      prevArray = rawShifts;
    }

    if (!prevArray || prevArray.length === 0) {
      showAlert("ไม่พบข้อมูล", `ไม่พบข้อมูลกะของเดือน ${THAI_MONTH_NAMES[prevM - 1]} ${prevY}`);
      return;
    }

    const nextShifts: string[] = [];
    for (let i = 0; i < daysInMonth; i++) {
      nextShifts.push(prevArray[i] || "OFF");
    }
    setMonthlyShifts(nextShifts);
    setHasChanges(true);
  };

  // Yearly Shift Application & Save Handlers
  const executeYearlySave = async () => {
    if (!employee) return;
    try {
      setIsSaving(true);
      setYearlyProgress({ current: 0, total: 12 });

      const yearlyMap: Record<number, string[]> = {};

      for (let m = 1; m <= 12; m++) {
        setYearlyProgress({ current: m, total: 12 });
        const mDays = new Date(selectedYear, m, 0).getDate();
        let mShifts: string[] = [];

        if (yearlyPreset === "copy_current") {
          for (let d = 1; d <= mDays; d++) {
            const dateObj = new Date(selectedYear, m - 1, d);
            const dow = dateObj.getDay();
            mShifts.push(weeklyTemplate[dow] || (dow === 0 || dow === 6 ? "OFF" : "M8"));
          }
        } else if (yearlyPreset === "mon_fri") {
          for (let d = 1; d <= mDays; d++) {
            const dateObj = new Date(selectedYear, m - 1, d);
            const dow = dateObj.getDay();
            mShifts.push(dow === 0 || dow === 6 ? "OFF" : "M8");
          }
        } else if (yearlyPreset === "day_office") {
          for (let d = 1; d <= mDays; d++) {
            const dateObj = new Date(selectedYear, m - 1, d);
            const dow = dateObj.getDay();
            mShifts.push(dow === 0 || dow === 6 ? "OFF" : "D");
          }
        } else if (yearlyPreset === "cycle_4_2") {
          const cycleTotal = Math.max(1, cycleWorkDays + cycleOffDays);
          for (let d = 1; d <= mDays; d++) {
            const dayPos = (d - 1) % cycleTotal;
            mShifts.push(dayPos < cycleWorkDays ? cycleWorkShift : cycleOffShift);
          }
        }

        yearlyMap[m] = mShifts;

        if (onSaveEmployeeShifts) {
          await onSaveEmployeeShifts(employee.id, selectedYear, m, mShifts);
        } else {
          await fetch("/api/save-shifts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              year: selectedYear,
              month: m,
              employees: [{ ...employee, shifts: mShifts }]
            })
          });
        }
      }

      if (onSaveEmployeeYearlyShifts) {
        await onSaveEmployeeYearlyShifts(employee.id, selectedYear, yearlyMap);
      }

      if (yearlyMap[selectedMonth]) {
        setMonthlyShifts(yearlyMap[selectedMonth]);
      }
      setHasChanges(false);
      showAlert(
        "บันทึกสำเร็จ",
        `บันทึกตารางกะตลอดทั้งปี ${selectedYear} (12 เดือน) ของ ${employee.name} เรียบร้อยแล้ว`,
        () => onClose()
      );
    } catch (err) {
      console.error("Yearly shift save error:", err);
      showAlert("เกิดข้อผิดพลาด", "เกิดข้อผิดพลาดในการบันทึกตารางกะรายปี กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
      setYearlyProgress(null);
    }
  };

  const handleApplyAndSaveYearly = () => {
    if (!employee) return;
    setConfirmModal({
      isOpen: true,
      title: "ยืนยันการบันทึกตารางกะรายปี",
      message: `คุณต้องการบันทึกตารางกะตลอดทั้งปี ${selectedYear} (ครบทั้ง 12 เดือน) สำหรับ ${employee.name} หรือไม่?`,
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        executeYearlySave();
      }
    });
  };

  // Save changes to backend
  const handleSave = async () => {
    if (!employee) return;
    try {
      setIsSaving(true);
      if (onSaveEmployeeShifts) {
        await onSaveEmployeeShifts(employee.id, selectedYear, selectedMonth, monthlyShifts);
      } else {
        // Direct API call fallback
        await fetch("/api/save-shifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: selectedYear,
            month: selectedMonth,
            employees: [
              {
                ...employee,
                shifts: monthlyShifts
              }
            ]
          })
        });
      }
      setHasChanges(false);
      showAlert(
        "บันทึกสำเร็จ",
        `บันทึกตารางการทำงานของ ${employee.name} ประจำเดือน ${THAI_MONTH_NAMES[selectedMonth - 1]} ${selectedYear} เรียบร้อยแล้ว`,
        () => onClose()
      );
    } catch (err) {
      console.error("Save shift calendar error:", err);
      showAlert("เกิดข้อผิดพลาด", "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  // Add new custom shift definition
  const handleAddCustomShift = (e: React.FormEvent) => {
    e.preventDefault();
    const code = newShiftCode.trim();
    if (!code) {
      showAlert("ระบุข้อมูลไม่ครบ", "กรุณาระบุรหัสกะ เช่น M8, M12, N12 หรือ D");
      return;
    }

    let bgClass = "bg-[#fef9c3]";
    let borderClass = "border-[#fde047]";
    let textClass = "text-[#854d0e]";

    if (newShiftColorTheme === "purple") {
      bgClass = "bg-[#ede9fe]";
      borderClass = "border-[#c4b5fd]";
      textClass = "text-[#5b21b6]";
    } else if (newShiftColorTheme === "blue") {
      bgClass = "bg-[#e0f2fe]";
      borderClass = "border-[#7dd3fc]";
      textClass = "text-[#0369a1]";
    } else if (newShiftColorTheme === "green") {
      bgClass = "bg-[#dcfce7]";
      borderClass = "border-[#86efac]";
      textClass = "text-[#15803d]";
    } else if (newShiftColorTheme === "rose") {
      bgClass = "bg-[#ffe4e6]";
      borderClass = "border-[#fecdd3]";
      textClass = "text-[#be123c]";
    }

    const newShift: CustomShiftType = {
      code,
      name: newShiftName.trim() || `กะกำหนดเอง (${code})`,
      startTime: newShiftStart,
      endTime: newShiftEnd,
      workHours: Number(newShiftWorkHours) || 8,
      otHours: Number(newShiftOtHours) || 0,
      bgClass,
      borderClass,
      textClass,
      isCustom: true
    };

    setCustomShifts(prev => [newShift, ...prev.filter(s => s.code.toUpperCase() !== code.toUpperCase())]);
    setShowCustomShiftManager(false);
    setNewShiftCode("");
    setNewShiftName("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      {/* Modal Container with aesthetic light blue theme matching screenshot */}
      <div className="relative w-full max-w-5xl bg-[#C8DBFC] border-2 border-[#9FCEE8] rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans max-h-[96vh]">
        
        {/* Top Header: Employee Banner & Main Actions */}
        <div className="px-4 sm:px-6 py-3 bg-[#B7D1FA] border-b border-[#9ABEF5] flex flex-wrap items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#0E3A66] text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
              <CalendarIcon className="w-4 h-4 text-sky-300" />
            </div>
            
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-[#0E3A66] truncate">
                  {employee ? `${employee.id} · ${employee.name}` : "บริหารวันทำงานและจัดกะรายบุคคล"}
                </span>
                {employee && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/80 text-[#0E3A66] border border-[#9ABEF5] font-bold">
                    {employee.role || employee.deptId}
                  </span>
                )}
              </div>

              {/* Quick Employee Switcher if list is available */}
              {employees.length > 0 && onSelectEmployee && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-[#333B41] font-semibold">สลับพนักงาน:</span>
                  <select
                    value={employee?.id || ""}
                    onChange={(e) => {
                      const emp = employees.find(x => x.id === e.target.value);
                      if (emp) onSelectEmployee(emp);
                    }}
                    className="bg-white text-[11px] font-bold text-[#0E3A66] border border-[#9ABEF5] rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.id} - {e.name} ({e.role || e.deptId})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-1 text-xs font-bold rounded shadow-xs transition-all cursor-pointer ${
                isEditMode 
                  ? "bg-white text-[#0E3A66] border border-[#0E3A66] ring-1 ring-[#0E3A66]" 
                  : "bg-white/80 hover:bg-white text-[#333B41] border border-[#AECBF8]"
              }`}
            >
              {isEditMode ? "โหมดแก้ไข" : "โหมดดูข้อมูล"}
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-3.5 py-1 text-xs font-bold bg-[#0E3A66] hover:bg-[#17538F] text-white active:scale-95 border border-[#0E3A66] rounded shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>บันทึก</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMonthlyShifts(getInitialMonthlyShifts());
                setHasChanges(false);
                onClose();
              }}
              className="px-3 py-1 text-xs font-bold bg-white/80 hover:bg-white text-[#6A7B87] hover:text-[#B3352C] border border-[#AECBF8] rounded shadow-xs transition-all cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#0E3A66] hover:bg-white/50 rounded transition-colors ml-1 cursor-pointer"
              aria-label="ปิด"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Mode Navigation Tabs: Daily | Weekly | Monthly | Yearly */}
        <div className="px-4 sm:px-6 py-2 bg-[#A3C6F7] border-b border-[#8EB9F5] flex flex-wrap items-center justify-between gap-2 select-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[#0E3A66] mr-1">โหมดการจัดกะ:</span>
            
            {/* 1. Daily Mode */}
            <button
              type="button"
              onClick={() => setSetupMode("daily")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                setupMode === "daily"
                  ? "bg-[#0E3A66] text-white shadow-xs"
                  : "bg-white/80 hover:bg-white text-[#0E3A66] border border-[#8EB9F5]"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>1. ตั้งรายวัน</span>
            </button>

            {/* 2. Weekly Mode */}
            <button
              type="button"
              onClick={() => setSetupMode("weekly")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                setupMode === "weekly"
                  ? "bg-[#0E3A66] text-white shadow-xs"
                  : "bg-white/80 hover:bg-white text-[#0E3A66] border border-[#8EB9F5]"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>2. ตั้งรายอาทิตย์ / สัปดาห์</span>
            </button>

            {/* 3. Monthly Mode */}
            <button
              type="button"
              onClick={() => setSetupMode("monthly")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                setupMode === "monthly"
                  ? "bg-[#0E3A66] text-white shadow-xs"
                  : "bg-white/80 hover:bg-white text-[#0E3A66] border border-[#8EB9F5]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3. ตั้งรายเดือน (ทั้งเดือน)</span>
            </button>

            {/* 4. Yearly Mode */}
            <button
              type="button"
              onClick={() => setSetupMode("yearly")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                setupMode === "yearly"
                  ? "bg-[#0E3A66] text-white shadow-xs"
                  : "bg-white/80 hover:bg-white text-[#0E3A66] border border-[#8EB9F5]"
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5 text-sky-300" />
              <span>4. ตั้งรายปี (12 เดือน)</span>
            </button>
          </div>

          <div className="text-[11px] text-[#0E3A66] font-semibold">
            {hasChanges && <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-bold">* มีข้อมูลที่ยังไม่ได้บันทึก</span>}
          </div>
        </div>

        {/* Dynamic Mode Sub-Toolbars */}
        <div className="bg-[#E4EFFF] border-b border-[#BED6FA] px-4 sm:px-6 py-2.5">
          {/* MODE 1: DAILY TOOLBAR */}
          {setupMode === "daily" && (
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-[#0E3A66]">แต้มกะด่วน (คลิกเลือกกะ แล้วคลิกวันที่ในปฏิทิน):</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {customShifts.slice(0, 7).map((shift) => (
                    <button
                      key={shift.code}
                      type="button"
                      onClick={() => setActiveBrushShift(shift.code)}
                      className={`px-2 py-1 rounded text-[11px] font-mono font-bold border transition-all cursor-pointer ${shift.bgClass} ${shift.borderClass} ${shift.textClass} ${
                        activeBrushShift === shift.code ? "ring-2 ring-[#0E3A66] shadow-xs" : "opacity-80 hover:opacity-100"
                      }`}
                      title={shift.name}
                    >
                      {activeBrushShift === shift.code && <Check className="w-3 h-3 inline mr-1" />}
                      {shift.code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMonthlyShifts(prev => prev.map((code, idx) => {
                      const d = new Date(selectedYear, selectedMonth - 1, idx + 1).getDay();
                      return (d === 0 || d === 6) ? "OFF" : code;
                    }));
                    setHasChanges(true);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 text-[#0E3A66] border border-[#BED6FA] rounded text-[11px] font-bold cursor-pointer"
                >
                  ส.-อา. ทั้งหมด = OFF
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMonthlyShifts(prev => prev.map((code, idx) => {
                      const d = new Date(selectedYear, selectedMonth - 1, idx + 1).getDay();
                      return (d >= 1 && d <= 5) ? activeBrushShift : code;
                    }));
                    setHasChanges(true);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 text-[#0E3A66] border border-[#BED6FA] rounded text-[11px] font-bold cursor-pointer"
                >
                  จ.-ศ. ทั้งหมด = {activeBrushShift}
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: WEEKLY TOOLBAR */}
          {setupMode === "weekly" && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black text-[#0E3A66]">
                  รูปแบบกะประจำวันในสัปดาห์ (Sunday - Saturday):
                </span>
                
                {/* Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-[#59656D] font-bold">เทมเพลตสำเร็จรูป:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyWeeklyPreset("standard_office")}
                    className="px-2 py-0.5 bg-white hover:bg-blue-50 text-[#0E3A66] border border-[#BED6FA] rounded text-[10px] font-bold cursor-pointer"
                  >
                    จ.-ศ. กะเช้า (M8) / ส.-อา. หยุด
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyWeeklyPreset("day_office")}
                    className="px-2 py-0.5 bg-white hover:bg-blue-50 text-[#0E3A66] border border-[#BED6FA] rounded text-[10px] font-bold cursor-pointer"
                  >
                    จ.-ศ. กลางวัน (D) / ส.-อา. หยุด
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyWeeklyPreset("with_weekend_ot")}
                    className="px-2 py-0.5 bg-white hover:bg-blue-50 text-[#0E3A66] border border-[#BED6FA] rounded text-[10px] font-bold cursor-pointer"
                  >
                    จ.-ศ. (M8) / ส.-อา. OT (OND)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyWeeklyPreset("morning_12h")}
                    className="px-2 py-0.5 bg-white hover:bg-blue-50 text-[#0E3A66] border border-[#BED6FA] rounded text-[10px] font-bold cursor-pointer"
                  >
                    กะเช้า 12 ชม. (M12) 6 วัน
                  </button>
                </div>
              </div>

              {/* 7 Days Row */}
              <div className="grid grid-cols-7 gap-1.5">
                {THAI_DAY_NAMES.map((dName, dIdx) => (
                  <div key={dIdx} className="p-1.5 bg-white rounded border border-[#BED6FA] flex flex-col gap-1 text-center">
                    <span className="text-[10px] font-bold text-[#0E3A66]">{dName}</span>
                    <select
                      value={weeklyTemplate[dIdx] || "OFF"}
                      onChange={(e) => {
                        setWeeklyTemplate(prev => ({ ...prev, [dIdx]: e.target.value }));
                      }}
                      className="text-[10px] font-mono font-bold bg-[#F3F6F8] border border-[#DCE4EA] rounded p-1 text-center cursor-pointer"
                    >
                      {customShifts.map(s => (
                        <option key={s.code} value={s.code}>{s.code}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Cyclical 4-on-2-off bar and Apply button */}
              <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-[#BED6FA]/60">
                <div className="flex items-center gap-2 text-[11px] text-[#0E3A66]">
                  <span className="font-bold">กะหมุนเวียน:</span>
                  <span>ทำงาน</span>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={cycleWorkDays}
                    onChange={(e) => setCycleWorkDays(Number(e.target.value))}
                    className="w-10 px-1 py-0.5 text-center bg-white border border-[#BED6FA] rounded text-xs font-bold"
                  />
                  <span>วัน ({cycleWorkShift}), หยุด</span>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={cycleOffDays}
                    onChange={(e) => setCycleOffDays(Number(e.target.value))}
                    className="w-10 px-1 py-0.5 text-center bg-white border border-[#BED6FA] rounded text-xs font-bold"
                  />
                  <span>วัน</span>
                  <button
                    type="button"
                    onClick={handleApplyCyclicalRotation}
                    className="px-2 py-0.5 bg-white hover:bg-slate-50 text-[#0E3A66] border border-[#BED6FA] rounded font-bold text-[11px] cursor-pointer"
                  >
                    รันกะหมุนเวียน
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleApplyWeeklyTemplate}
                  className="px-3 py-1 bg-[#17538F] hover:bg-[#0E3A66] text-white rounded text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>ปรับใช้กะประจำสัปดาห์ในเดือน {THAI_MONTH_NAMES[selectedMonth - 1]}</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE 3: MONTHLY TOOLBAR */}
          {setupMode === "monthly" && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#0E3A66]">กำหนดทั้งเดือน {THAI_MONTH_NAMES[selectedMonth - 1]} {selectedYear}:</span>
                <div className="flex items-center gap-1.5">
                  <select
                    value={monthFillShift}
                    onChange={(e) => setMonthFillShift(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-[#BED6FA] rounded text-xs font-mono font-bold text-[#0E3A66] cursor-pointer"
                  >
                    {customShifts.map(s => (
                      <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleFillWholeMonth(monthFillShift)}
                    className="px-3 py-1 bg-[#17538F] hover:bg-[#0E3A66] text-white rounded text-xs font-bold cursor-pointer shadow-xs"
                  >
                    กำหนดกะนี้ทั้งเดือน
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPreviousMonth}
                  className="px-3 py-1 bg-white hover:bg-slate-50 text-[#0E3A66] border border-[#BED6FA] rounded text-xs font-bold cursor-pointer flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5 text-[#17538F]" />
                  <span>คัดลอกจากเดือนก่อนหน้า</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillWholeMonth("OFF")}
                  className="px-3 py-1 bg-white hover:bg-red-50 text-[#B3352C] border border-red-200 rounded text-xs font-bold cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>รีเซ็ตทั้งเดือนเป็น OFF</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE 4: YEARLY TOOLBAR */}
          {setupMode === "yearly" && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#0E3A66]">
                    กำหนดตารางกะตลอดทั้งปี {selectedYear} (ครบ 12 เดือน ม.ค. - ธ.ค.):
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={yearlyPreset}
                    onChange={(e) => setYearlyPreset(e.target.value as any)}
                    className="px-2.5 py-1 bg-white border border-[#BED6FA] rounded text-xs font-bold text-[#0E3A66] cursor-pointer"
                  >
                    <option value="copy_current">นำรูปแบบของเดือนปัจจุบัน ({THAI_MONTH_NAMES[selectedMonth - 1]}) ไปใช้ทุกเดือน</option>
                    <option value="mon_fri">จันทร์-ศุกร์ กะเช้า (M8) / เสาร์-อาทิตย์ หยุด (OFF) ทั้งปี</option>
                    <option value="day_office">จันทร์-ศุกร์ กลางวันปกติ (D) / เสาร์-อาทิตย์ หยุด (OFF) ทั้งปี</option>
                    <option value="cycle_4_2">รันกะหมุนเวียน 4-on-2-off ต่อเนื่องตลอดทั้งปี (365 วัน)</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleApplyAndSaveYearly}
                    disabled={isSaving}
                    className="px-4 py-1.5 bg-[#0E3A66] hover:bg-[#17538F] text-white rounded text-xs font-black cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving && yearlyProgress ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-300" />
                        <span>กำลังบันทึกเดือนที่ {yearlyProgress.current}/{yearlyProgress.total}...</span>
                      </>
                    ) : (
                      <>
                        <CalendarRange className="w-3.5 h-3.5 text-sky-300" />
                        <span>บันทึกตารางกะตลอดปี {selectedYear} (12 เดือน)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#59656D]">
                * ระบบจะคำนวณจำนวนวันของแต่ละเดือนโดยอัตโนมัติ (28/29/30/31 วัน) และบันทึกลงฐานข้อมูลทั้ง 12 เดือนของปี {selectedYear}
              </p>
            </div>
          )}
        </div>

        {/* Main Content Area: Calendar Grid on Left, Month / Year Controls on Right */}
        <div className="p-3 sm:p-5 flex flex-col lg:flex-row gap-4 flex-1 overflow-y-auto">
          
          {/* Left Column: Calendar Header & 7-Day Grid */}
          <div className="flex-1 flex flex-col">
            
            {/* Center Month Title matching screenshot */}
            <div className="text-center mb-3">
              <h3 className="text-base sm:text-lg font-bold text-[#17538F]">
                เดือน {THAI_MONTH_NAMES[selectedMonth - 1]}
              </h3>
            </div>

            {/* Calendar Table Grid */}
            <div className="border border-[#7FA9E8] rounded bg-white shadow-xs overflow-hidden">
              
              {/* Day Headers (Sun - Sat) */}
              <div className="grid grid-cols-7 border-b border-[#7FA9E8] bg-[#D4E3FA] text-center text-xs font-bold text-[#0E3A66]">
                {THAI_DAY_NAMES.map((name, idx) => (
                  <div key={idx} className="py-1.5 px-1 border-r last:border-r-0 border-[#7FA9E8]">
                    {name}
                  </div>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 divide-y divide-[#7FA9E8]">
                {/* Empty cells before month start */}
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[64px] sm:min-h-[72px] bg-slate-50/50 border-r last:border-r-0 border-[#7FA9E8]" />
                ))}

                {/* Actual days of month */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const shiftCode = monthlyShifts[idx] || "OFF";
                  const meta = getShiftMeta(shiftCode);
                  const isSelected = selectedDay === dayNum;

                  return (
                    <div 
                      key={`day-${dayNum}`}
                      onClick={() => {
                        if (isEditMode) {
                          setSelectedDay(dayNum);
                          if (setupMode === "daily" && activeBrushShift) {
                            handleSetDayShift(dayNum, activeBrushShift);
                          }
                        }
                      }}
                      className={`min-h-[64px] sm:min-h-[72px] p-1 border-r last:border-r-0 border-[#7FA9E8] flex flex-col justify-between cursor-pointer transition-all ${
                        isSelected 
                          ? "ring-2 ring-[#17538F] ring-inset bg-blue-50/40" 
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {/* Upper Box: Day Number + Shift Code Chip */}
                      <div className={`px-1.5 py-0.5 rounded border text-[11px] sm:text-xs font-mono font-bold flex items-center justify-between gap-1 shadow-2xs ${meta.bgClass} ${meta.borderClass} ${meta.textClass}`}>
                        <span>{dayNum}</span>
                        <span className="truncate max-w-[55px] sm:max-w-[70px]">{meta.code}</span>
                      </div>

                      {/* Lower Box: Customizable shift description slot / action */}
                      <div className="mt-1 h-5 sm:h-6 rounded border border-dashed border-[#AECBF8] bg-white flex items-center justify-center text-[10px] text-[#6A7B87] truncate px-1">
                        {meta.startTime !== "-" ? `${meta.startTime}-${meta.endTime}` : "วันหยุด"}
                      </div>
                    </div>
                  );
                })}

                {/* Trailing empty cells to fill grid row */}
                {(() => {
                  const totalCells = firstDayOffset + daysInMonth;
                  const remainder = totalCells % 7;
                  const trailingCount = remainder === 0 ? 0 : 7 - remainder;
                  return Array.from({ length: trailingCount }).map((_, i) => (
                    <div key={`trail-${i}`} className="min-h-[64px] sm:min-h-[72px] bg-slate-50/50 border-r last:border-r-0 border-[#7FA9E8]" />
                  ));
                })()}
              </div>

            </div>

            {/* Bottom Hints and Action Buttons matching user screenshot */}
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              
              {/* Red instruction text */}
              <div className="text-[11px] sm:text-xs text-[#DC2626] font-medium leading-tight">
                <p className="font-bold">**หากต้องการลบกะงานที่กำหนดเองในวันนั้นๆ</p>
                <p>- เลือกที่ช่องกะงานกำหนดเอง ในวันที่ต้องการลบ</p>
                <p>- กดที่ปุ่ม Delete เพื่อลบออก</p>
              </div>

              {/* Action Buttons: วันหยุดประจำปี & เลือกกะงาน */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowHolidayModal(true)}
                  className="px-3 py-1.5 bg-white text-[#0E3A66] hover:bg-[#E8F3FA] active:scale-95 border border-[#7FA9E8] rounded shadow-xs text-xs font-bold transition-all cursor-pointer text-center"
                >
                  วันหยุด<br className="hidden sm:inline" />ประจำปี
                </button>

                <button
                  type="button"
                  onClick={() => setShowShiftPicker(true)}
                  className="px-3.5 py-2 bg-white text-[#0E3A66] hover:bg-[#E8F3FA] active:scale-95 border border-[#7FA9E8] rounded shadow-xs text-xs font-bold transition-all cursor-pointer"
                >
                  เลือกกะงาน
                </button>
              </div>

            </div>

          </div>

          {/* Right Column: Year Dropdown and 12-Month Selector Buttons */}
          <div className="w-full lg:w-32 flex flex-col gap-1.5 shrink-0 select-none">
            {/* Year Selector */}
            <div className="bg-white border border-[#7FA9E8] rounded p-1 mb-1">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full bg-transparent text-xs font-bold text-[#0E3A66] border-none focus:ring-0 p-0 text-center cursor-pointer"
              >
                {[2024, 2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* 12 Months Buttons List */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-1 gap-1">
              {THAI_MONTH_NAMES.map((mName, mIdx) => {
                const monthNum = mIdx + 1;
                const isCurrent = selectedMonth === monthNum;
                return (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => setSelectedMonth(monthNum)}
                    className={`py-1.5 px-2 text-xs font-bold rounded border text-center transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-[#17538F] text-white border-[#0E3A66] shadow-xs"
                        : "bg-white hover:bg-[#E8F3FA] text-[#0E3A66] border-[#7FA9E8]"
                    }`}
                  >
                    {mName}
                  </button>
                );
              })}
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* Shift Picker Palette Modal                                                */}
      {/* ========================================================================= */}
      {showShiftPicker && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-[#DCE4EA] overflow-hidden">
            <div className="p-3.5 bg-[#0E3A66] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#9FCEE8]" />
                <h4 className="text-xs font-bold">เลือกกะงาน {selectedDay ? `(วันที่ ${selectedDay})` : ""}</h4>
              </div>
              <button 
                onClick={() => setShowShiftPicker(false)}
                className="p-1 text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 max-h-72 overflow-y-auto space-y-2">
              {customShifts.map((shift) => (
                <div 
                  key={shift.code}
                  onClick={() => {
                    if (selectedDay !== null) {
                      handleSetDayShift(selectedDay, shift.code);
                    }
                    setShowShiftPicker(false);
                  }}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${shift.bgClass} ${shift.borderClass}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-bold ${shift.textClass}`}>{shift.code}</span>
                      <span className="text-xs font-bold text-[#333B41] truncate">{shift.name}</span>
                    </div>
                    <p className="text-[11px] text-[#6A7B87] mt-0.5">
                      {shift.startTime !== "-" ? `เวลา: ${shift.startTime} - ${shift.endTime} (งาน ${shift.workHours}h, OT ${shift.otHours}h)` : "วันหยุดพักผ่อน"}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white font-bold text-[#0E3A66] border border-[#DCE4EA]">
                    เลือก
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#F8FAFC] border-t border-[#DCE4EA] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowShiftPicker(false);
                  setShowCustomShiftManager(true);
                }}
                className="flex items-center gap-1 text-xs font-bold text-[#17538F] hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ กำหนดรูปแบบกะใหม่</span>
              </button>
              <button
                type="button"
                onClick={() => setShowShiftPicker(false)}
                className="px-3 py-1 bg-white border border-[#DCE4EA] text-xs font-medium rounded text-[#59656D] hover:bg-[#F3F6F8]"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Custom Shift Definition Manager Modal                                     */}
      {/* ========================================================================= */}
      {showCustomShiftManager && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-[#DCE4EA] overflow-hidden">
            <div className="p-3.5 bg-[#0E3A66] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F3D98F]" />
                <h4 className="text-xs font-bold">กำหนดรูปแบบกะงานเอง (Custom Shift)</h4>
              </div>
              <button 
                onClick={() => setShowCustomShiftManager(false)}
                className="p-1 text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomShift} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#333B41] mb-1">รหัสกะ (Shift Code) *</label>
                <input 
                  type="text" 
                  value={newShiftCode} 
                  onChange={(e) => setNewShiftCode(e.target.value)}
                  placeholder="เช่น M8, M12, N12, D, OND"
                  required
                  className="w-full px-3 py-1.5 text-xs bg-[#F3F6F8] border border-[#DCE4EA] rounded focus:outline-none focus:border-[#2E90CB] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333B41] mb-1">ชื่อกะ (Shift Name)</label>
                <input 
                  type="text" 
                  value={newShiftName} 
                  onChange={(e) => setNewShiftName(e.target.value)}
                  placeholder="เช่น กะกลางวันพิเศษ หรือ กะซ่อมบำรุง"
                  className="w-full px-3 py-1.5 text-xs bg-[#F3F6F8] border border-[#DCE4EA] rounded focus:outline-none focus:border-[#2E90CB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#333B41] mb-1">เวลาเริ่ม</label>
                  <input 
                    type="time" 
                    value={newShiftStart} 
                    onChange={(e) => setNewShiftStart(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F3F6F8] border border-[#DCE4EA] rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#333B41] mb-1">เวลาสิ้นสุด</label>
                  <input 
                    type="time" 
                    value={newShiftEnd} 
                    onChange={(e) => setNewShiftEnd(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F3F6F8] border border-[#DCE4EA] rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#333B41] mb-1">ชม. ทำงาน</label>
                  <input 
                    type="number" 
                    min={0}
                    max={24}
                    value={newShiftWorkHours} 
                    onChange={(e) => setNewShiftWorkHours(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#F3F6F8] border border-[#DCE4EA] rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#333B41] mb-1">ชม. OT</label>
                  <input 
                    type="number" 
                    min={0}
                    max={16}
                    value={newShiftOtHours} 
                    onChange={(e) => setNewShiftOtHours(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#F3F6F8] border border-[#DCE4EA] rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333B41] mb-1">ธีมสีกะ</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: "yellow", bg: "bg-[#fef9c3]", border: "border-[#fde047]", label: "เหลือง" },
                    { id: "purple", bg: "bg-[#ede9fe]", border: "border-[#c4b5fd]", label: "ม่วง" },
                    { id: "blue", bg: "bg-[#e0f2fe]", border: "border-[#7dd3fc]", label: "ฟ้า" },
                    { id: "green", bg: "bg-[#dcfce7]", border: "border-[#86efac]", label: "เขียว" },
                    { id: "rose", bg: "bg-[#ffe4e6]", border: "border-[#fecdd3]", label: "ชมพู" }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewShiftColorTheme(t.id as any)}
                      className={`p-2 rounded border text-[11px] font-bold text-center cursor-pointer transition-all ${t.bg} ${t.border} ${
                        newShiftColorTheme === t.id ? "ring-2 ring-[#0E3A66]" : ""
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomShiftManager(false)}
                  className="px-3 py-1.5 bg-white border border-[#DCE4EA] text-xs font-medium rounded text-[#59656D]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0E3A66] hover:bg-[#17538F] text-white text-xs font-bold rounded shadow-xs"
                >
                  บันทึกรูปแบบกะ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Annual Holidays Modal                                                    */}
      {/* ========================================================================= */}
      {showHolidayModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-[#DCE4EA] overflow-hidden">
            <div className="p-3.5 bg-[#0E3A66] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#F3D98F]" />
                <h4 className="text-xs font-bold">กำหนดวันหยุดประจำปี {selectedYear}</h4>
              </div>
              <button 
                onClick={() => setShowHolidayModal(false)}
                className="p-1 text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs text-[#59656D]">
                คลิกเลือกวันที่ในปฏิทินที่ต้องการ แล้วกดปุ่มด้านล่างเพื่อกำหนดเป็นวันหยุดประจำปี (H):
              </p>

              {selectedDay !== null ? (
                <div className="p-3 bg-[#FCF3DE] border border-[#F3D98F] rounded-lg text-xs font-bold text-[#D99B14] flex items-center justify-between">
                  <span>วันที่เลือก: วันที่ {selectedDay} {THAI_MONTH_NAMES[selectedMonth - 1]} {selectedYear}</span>
                  <button
                    type="button"
                    onClick={() => {
                      handleSetDayShift(selectedDay, "H");
                      setShowHolidayModal(false);
                    }}
                    className="px-2.5 py-1 bg-[#B3352C] text-white rounded text-xs font-bold hover:bg-[#991B1B]"
                  >
                    ตั้งเป็นวันหยุด (H)
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-[#F3F6F8] rounded-lg text-xs text-[#6A7B87] text-center">
                  กรุณาคลิกเลือกวันที่ในปฏิทินก่อน
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHolidayModal(false)}
                  className="px-3 py-1.5 bg-white border border-[#DCE4EA] text-xs font-medium rounded text-[#59656D]"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Sleek Executive Maritime Confirmation Modal                                */}
      {/* ========================================================================= */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150">
            <div className="bg-[#0E3A66] px-5 py-4 text-white flex items-center justify-between border-b border-[#17538F]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                  <CalendarRange className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-wide text-white leading-tight">
                    {confirmModal.title}
                  </h4>
                  <p className="text-[11px] text-sky-200/80 font-medium">Enterprise OT Confirmation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3.5 bg-[#E8F3FA] border border-[#BED6FA] rounded-xl p-3.5">
                <div className="w-8 h-8 rounded-full bg-white border border-[#BED6FA] flex items-center justify-center text-[#17538F] shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="text-xs text-[#0E3A66] leading-relaxed font-medium">
                  {confirmModal.message}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="px-4 py-2 bg-[#0E3A66] hover:bg-[#17538F] active:scale-95 text-white rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>ยืนยันดำเนินการ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Sleek Executive Maritime Alert Modal                                       */}
      {/* ========================================================================= */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150">
            <div className="bg-[#0E3A66] px-5 py-4 text-white flex items-center justify-between border-b border-[#17538F]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-wide text-white leading-tight">
                    {alertModal.title}
                  </h4>
                  <p className="text-[11px] text-sky-200/80 font-medium">Enterprise OT Management</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const cb = alertModal.onClose;
                  setAlertModal(prev => ({ ...prev, isOpen: false }));
                  if (cb) cb();
                }}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                {alertModal.message}
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const cb = alertModal.onClose;
                    setAlertModal(prev => ({ ...prev, isOpen: false }));
                    if (cb) cb();
                  }}
                  className="px-5 py-2 bg-[#0E3A66] hover:bg-[#17538F] active:scale-95 text-white rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer"
                >
                  ตกลง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
