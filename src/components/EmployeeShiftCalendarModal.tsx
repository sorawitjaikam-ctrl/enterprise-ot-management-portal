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
  Sparkles
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

// Built-in shift presets matching the user's screenshot & terminal shift codes
export const DEFAULT_SHIFT_PRESETS: CustomShiftType[] = [
  {
    code: "NRMD",
    name: "กะปกติกลางวัน (Normal Day 8h)",
    startTime: "08:00",
    endTime: "17:00",
    workHours: 8,
    otHours: 0,
    bgClass: "bg-[#fef9c3]",
    borderClass: "border-[#facc15]",
    textClass: "text-[#854d0e]"
  },
  {
    code: "NORM",
    name: "กะทำงานมาตรฐาน (Norm 8h)",
    startTime: "08:00",
    endTime: "17:00",
    workHours: 8,
    otHours: 0,
    bgClass: "bg-[#fef9c3]",
    borderClass: "border-[#facc15]",
    textClass: "text-[#854d0e]"
  },
  {
    code: "NRM10[x]",
    name: "กะพิเศษวันหยุด 10 ชม. (OT 2h)",
    startTime: "08:00",
    endTime: "18:00",
    workHours: 10,
    otHours: 2,
    bgClass: "bg-[#ede9fe]",
    borderClass: "border-[#c4b5fd]",
    textClass: "text-[#5b21b6]"
  },
  {
    code: "M12",
    name: "กะเช้า 12 ชม. (OT 4h)",
    startTime: "07:00",
    endTime: "19:00",
    workHours: 12,
    otHours: 4,
    bgClass: "bg-[#e0f2fe]",
    borderClass: "border-[#7dd3fc]",
    textClass: "text-[#0369a1]"
  },
  {
    code: "N12",
    name: "กะดึก 12 ชม. (OT 4h)",
    startTime: "19:00",
    endTime: "07:00",
    workHours: 12,
    otHours: 4,
    bgClass: "bg-[#e0e7ff]",
    borderClass: "border-[#a5b4fc]",
    textClass: "text-[#3730a3]"
  },
  {
    code: "OFF",
    name: "วันหยุดประจำสัปดาห์ (Weekly Off)",
    startTime: "-",
    endTime: "-",
    workHours: 0,
    otHours: 0,
    bgClass: "bg-[#f1f5f9]",
    borderClass: "border-[#cbd5e1]",
    textClass: "text-[#64748b]"
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
    textClass: "text-[#be123c]"
  }
];

export interface EmployeeShiftCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  currentYear?: number;
  currentMonth?: number; // 1-12
  onSaveEmployeeShifts?: (empId: string, year: number, month: number, shifts: string[]) => Promise<void> | void;
}

const THAI_MONTH_NAMES = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", 
  "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", 
  "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const THAI_DAY_NAMES = [
  "อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"
];

export default function EmployeeShiftCalendarModal({
  isOpen,
  onClose,
  employee,
  currentYear = 2026,
  currentMonth = 11, // Default November per screenshot
  onSaveEmployeeShifts
}: EmployeeShiftCalendarModalProps) {
  // Calendar View Selection
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth); // 1-12
  const [isEditMode, setIsEditMode] = useState<boolean>(true); // Default editable
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Custom Shift Types Library
  const [customShifts, setCustomShifts] = useState<CustomShiftType[]>(() => {
    try {
      const stored = localStorage.getItem("custom_shift_types_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return DEFAULT_SHIFT_PRESETS;
  });

  // Modals inside calendar
  const [showShiftPicker, setShowShiftPicker] = useState<boolean>(false);
  const [showCustomShiftManager, setShowCustomShiftManager] = useState<boolean>(false);
  const [showHolidayModal, setShowHolidayModal] = useState<boolean>(false);

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
    if (!employee) return Array(daysInMonth).fill("O");

    const rawShifts: any = employee.shifts;
    let monthArray: string[] = [];

    if (Array.isArray(rawShifts)) {
      monthArray = rawShifts.slice(0, daysInMonth);
    } else if (rawShifts && typeof rawShifts === "object") {
      monthArray = rawShifts[monthKey] || [];
    }

    // Default template if empty: Sunday/Saturday = NRM10[x], Mon-Thu = NRMD, Fri = NORM
    if (!monthArray || monthArray.length === 0) {
      const result: string[] = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(selectedYear, selectedMonth - 1, d);
        const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          result.push("NRM10[x]");
        } else if (dayOfWeek === 5) {
          result.push("NORM");
        } else {
          result.push("NRMD");
        }
      }
      return result;
    }

    // Ensure array length matches daysInMonth
    const normalized = [...monthArray];
    while (normalized.length < daysInMonth) {
      normalized.push("O");
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
      localStorage.setItem("custom_shift_types_v1", JSON.stringify(customShifts));
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
    const codeClean = (shiftCode || "OFF").trim();
    const found = customShifts.find(s => s.code.toUpperCase() === codeClean.toUpperCase());
    if (found) return found;

    if (codeClean.includes("NRM10") || codeClean.includes("10")) {
      return {
        code: codeClean,
        name: "กะกำหนดเอง 10 ชม.",
        startTime: "08:00",
        endTime: "18:00",
        workHours: 10,
        otHours: 2,
        bgClass: "bg-[#ede9fe]",
        borderClass: "border-[#c4b5fd]",
        textClass: "text-[#5b21b6]"
      };
    }

    if (codeClean === "O" || codeClean === "OFF" || codeClean === "-") {
      return {
        code: "OFF",
        name: "วันหยุด (Off)",
        startTime: "-",
        endTime: "-",
        workHours: 0,
        otHours: 0,
        bgClass: "bg-[#f8fafc]",
        borderClass: "border-[#cbd5e1]",
        textClass: "text-[#64748b]"
      };
    }

    return {
      code: codeClean,
      name: `กะงาน ${codeClean}`,
      startTime: "08:00",
      endTime: "17:00",
      workHours: 8,
      otHours: 0,
      bgClass: "bg-[#fef9c3]",
      borderClass: "border-[#fde047]",
      textClass: "text-[#854d0e]"
    };
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
      alert(`บันทึกตารางการทำงานของ ${employee.name} ประจำเดือน ${THAI_MONTH_NAMES[selectedMonth - 1]} ${selectedYear} เรียบร้อยแล้ว`);
      onClose();
    } catch (err) {
      console.error("Save shift calendar error:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  // Add new custom shift definition
  const handleAddCustomShift = (e: React.FormEvent) => {
    e.preventDefault();
    const code = newShiftCode.trim();
    if (!code) {
      alert("กรุณาระบุรหัสกะ เช่น NRM10[x] หรือ M12");
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
        
        {/* Top Header: Employee Banner & Action Buttons */}
        <div className="px-4 sm:px-6 py-3 bg-[#B7D1FA] border-b border-[#9ABEF5] flex flex-wrap items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#17538F]" />
            <span className="text-xs font-bold text-[#0E3A66] truncate">
              {employee ? `${employee.id} · ${employee.name} (${employee.role || employee.deptId})` : "บริหารวันทำงานพนักงาน"}
            </span>
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
              {isEditMode ? "กำลังแก้ไข" : "แก้ไข"}
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-3.5 py-1 text-xs font-bold bg-white text-[#0E3A66] hover:bg-[#E8F3FA] active:scale-95 border border-[#9ABEF5] rounded shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "กำลังบันทึก..." : "บันทึก"}
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
              className="p-1 text-[#0E3A66] hover:bg-white/50 rounded transition-colors ml-1"
              aria-label="ปิด"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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
                  placeholder="เช่น NRM10[x], M12, SHIFT-A"
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
                  placeholder="เช่น กะปกติ 10 ชม. วันหยุด"
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

    </div>
  );
}
