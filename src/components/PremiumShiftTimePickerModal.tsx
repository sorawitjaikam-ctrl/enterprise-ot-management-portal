import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  X, 
  Check, 
  RotateCcw,
  LogIn,
  LogOut,
  Moon
} from "lucide-react";
import { Employee } from "../types";
import { getComplementaryShift, SHIFT_DEFINITIONS } from "../utils/shiftRecommendation";

export interface PremiumShiftTimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  initialDay?: number; // 1-31
  currentMonthKey?: string; // "2026-08"
  pairedEmployee?: Employee | null;
  onSaveShift: (params: {
    employeeId: string;
    dayNumbers: number[];
    shiftCode: string;
    startTime?: string;
    endTime?: string;
    isOvernight?: boolean;
    target: "plan" | "actual" | "both";
  }) => void;
}

/**
 * คำนวณรหัสกะและชั่วโมงการทำงานแบบ Dynamic ตามเวลาเริ่มเข้างานและออกงานจริง
 * รองรับทั้งกะปกติ 1-24 ชม., กะคร่อมวันข้ามคืน (20:00-08:00), และกะชนเวลา 24 ชม. เต็ม (08:00-08:00 = M24)
 */
export function computeDynamicShift(sH: number, sM: number, eH: number, eM: number, isManualOff = false): {
  code: string;
  name: string;
  duration: number;
  otHours: number;
  isOvernight: boolean;
} {
  if (isManualOff) {
    return { code: "O", name: "วันหยุดพักผ่อน (OFF)", duration: 0, otHours: 0, isOvernight: false };
  }

  const startMins = sH * 60 + sM;
  const endMins = eH * 60 + eM;

  // 1. Calculate duration in hours & detect cross-day / overnight
  let duration = 0;
  let isOvernight = false;

  if (sH === eH && sM === eM) {
    // 8 to 8, 7 to 7, 20 to 20, 00 to 00 -> 24 hours full shift!
    duration = 24;
    isOvernight = true;
  } else if (eH === 0 && eM === 0 && (sH !== 0 || sM !== 0)) {
    // End is midnight (24:00 of the same day)
    duration = 24 - (sH + sM / 60);
    isOvernight = false;
  } else if (endMins > startMins) {
    // Same day shift (e.g. 07:00 -> 19:00 = 12h)
    duration = (endMins - startMins) / 60;
    isOvernight = false;
  } else {
    // Cross-day / Overnight shift (e.g. 20:00 -> 08:00 = 12h, 08:00 -> 07:00 = 23h)
    duration = ((24 * 60 - startMins) + endMins) / 60;
    isOvernight = true;
  }

  // Clamp duration to 1 - 24 hours (M1..M24, A1..A24, N1..N24)
  let roundedDuration = Math.round(duration);
  if (roundedDuration <= 0) roundedDuration = 24;
  if (roundedDuration > 24) roundedDuration = 24;

  const otHours = Math.max(0, roundedDuration - 8);

  // 2. Determine prefix based on Start Hour
  // Morning: 06:00 - 11:59 -> M1..M24
  // Afternoon: 12:00 - 17:59 -> A1..A24
  // Night: 18:00 - 05:59 -> N1..N24
  let prefix = "M";
  let timeLabel = "เช้า";

  if (sH >= 6 && sH <= 11) {
    prefix = "M";
    timeLabel = "เช้า";
  } else if (sH >= 12 && sH <= 17) {
    prefix = "A";
    timeLabel = "บ่าย";
  } else {
    prefix = "N";
    timeLabel = "ดึก";
  }

  // Handle standard 08:00 - 17:00 office day shift
  if (sH === 8 && eH === 17 && sM === 0 && eM === 0) {
    return { code: "D", name: "กลางวันปกติ (8h)", duration: 8, otHours: 0, isOvernight: false };
  }

  const code = `${prefix}${roundedDuration}`;
  const name = `${timeLabel} ${roundedDuration} ชม.${isOvernight ? ' (🌙 คร่อมวัน)' : ''}${otHours > 0 ? ` (OT ${otHours}h)` : ''}`;

  return { code, name, duration: roundedDuration, otHours, isOvernight };
}

export const PremiumShiftTimePickerModal: React.FC<PremiumShiftTimePickerProps> = ({
  isOpen,
  onClose,
  employee,
  initialDay = 1,
  currentMonthKey = "2026-08",
  pairedEmployee,
  onSaveShift
}) => {
  const [selectedDays, setSelectedDays] = useState<number[]>([initialDay]);
  const [targetType, setTargetType] = useState<"plan" | "actual" | "both">("actual");

  // Parse month & year
  const [yearStr, monthStr] = currentMonthKey.split("-");
  const currentYear = Number(yearStr) || 2026;
  const currentMonth = Number(monthStr) || 8; // 1-12

  const [viewYear, setViewYear] = useState<number>(currentYear);
  const [viewMonth, setViewMonth] = useState<number>(currentMonth);

  // 24-Hour Stepper States (Start Time & End Time)
  const [startHour, setStartHour] = useState<number>(7);
  const [startMinute, setStartMinute] = useState<number>(0);
  const [endHour, setEndHour] = useState<number>(19);
  const [endMinute, setEndMinute] = useState<number>(0);
  const [isManualOff, setIsManualOff] = useState<boolean>(false);

  // Dynamic Shift Computation
  const dynamicShift = computeDynamicShift(startHour, startMinute, endHour, endMinute, isManualOff);
  const [selectedShiftCode, setSelectedShiftCode] = useState<string>("M12");

  // Track initial shift for Reset button
  const [initialShiftCode, setInitialShiftCode] = useState<string>("M12");

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      setSelectedDays([initialDay || 1]);
      setViewYear(currentYear);
      setViewMonth(currentMonth);

      if (employee) {
        let shiftsArr: string[] = [];
        try {
          if (Array.isArray(employee.shifts)) {
            shiftsArr = employee.shifts;
          } else if (employee.shifts && typeof employee.shifts === "object") {
            shiftsArr = (employee.shifts as any)[currentMonthKey] || [];
          }
        } catch {
          shiftsArr = [];
        }
        const currentDayShift = shiftsArr[(initialDay || 1) - 1] || "M12";
        setInitialShiftCode(currentDayShift);
        applyShiftToTime(currentDayShift);
      }
    }
  }, [isOpen, initialDay, currentMonthKey, employee]);

  // Parse existing or requested shift code to times
  const applyShiftToTime = (code: string) => {
    if (code === "O" || code === "OFF") {
      setIsManualOff(true);
      setSelectedShiftCode("O");
      setStartHour(0); setStartMinute(0); setEndHour(0); setEndMinute(0);
      return;
    }

    setIsManualOff(false);
    
    if (code === "M12") {
      setStartHour(7); setStartMinute(0); setEndHour(19); setEndMinute(0);
      setSelectedShiftCode("M12");
      return;
    } else if (code === "N12") {
      setStartHour(19); setStartMinute(0); setEndHour(7); setEndMinute(0);
      setSelectedShiftCode("N12");
      return;
    } else if (code === "M8") {
      setStartHour(7); setStartMinute(0); setEndHour(15); setEndMinute(0);
      setSelectedShiftCode("M8");
      return;
    } else if (code === "A8") {
      setStartHour(15); setStartMinute(0); setEndHour(23); setEndMinute(0);
      setSelectedShiftCode("A8");
      return;
    } else if (code === "N8") {
      setStartHour(23); setStartMinute(0); setEndHour(7); setEndMinute(0);
      setSelectedShiftCode("N8");
      return;
    } else if (code === "D" || code === "OND") {
      setStartHour(8); setStartMinute(0); setEndHour(17); setEndMinute(0);
      setSelectedShiftCode(code);
      return;
    }

    const def = SHIFT_DEFINITIONS[code];
    if (def && def.startTime && def.startTime.includes(":")) {
      const [sh, sm] = def.startTime.split(":");
      setStartHour(Number(sh) || 7);
      setStartMinute(Number(sm) || 0);
      if (def.endTime && def.endTime.includes(":")) {
        const [eh, em] = def.endTime.split(":");
        setEndHour(Number(eh) || 19);
        setEndMinute(Number(em) || 0);
      }
      setSelectedShiftCode(code);
      return;
    }

    // Dynamic pattern parse: M1..M24, A1..A24, N1..N24
    const match = code.match(/^([MAN])(\d+)$/);
    if (match) {
      const prefix = match[1];
      const hours = parseInt(match[2]);
      const defaultStartH = prefix === "M" ? 7 : prefix === "A" ? 15 : 19;
      setStartHour(defaultStartH);
      setStartMinute(0);
      const endH = (defaultStartH + hours) % 24;
      setEndHour(endH);
      setEndMinute(0);
      setSelectedShiftCode(code);
      return;
    }

    setSelectedShiftCode(code);
  };

  // Stepper handlers: Instantly update times & compute new shift code
  const updateTimes = (newSH: number, newSM: number, newEH: number, newEM: number) => {
    setIsManualOff(false);
    setStartHour(newSH);
    setStartMinute(newSM);
    setEndHour(newEH);
    setEndMinute(newEM);
    const computed = computeDynamicShift(newSH, newSM, newEH, newEM, false);
    setSelectedShiftCode(computed.code);
  };

  // Start Time Stepper Handlers
  const incStartHour = () => updateTimes(startHour >= 23 ? 0 : startHour + 1, startMinute, endHour, endMinute);
  const decStartHour = () => updateTimes(startHour <= 0 ? 23 : startHour - 1, startMinute, endHour, endMinute);
  const incStartMinute = () => updateTimes(startHour, startMinute >= 45 ? 0 : startMinute + 15, endHour, endMinute);
  const decStartMinute = () => updateTimes(startHour, startMinute <= 0 ? 45 : startMinute - 15, endHour, endMinute);

  // End Time Stepper Handlers
  const incEndHour = () => updateTimes(startHour, startMinute, endHour >= 23 ? 0 : endHour + 1, endMinute);
  const decEndHour = () => updateTimes(startHour, startMinute, endHour <= 0 ? 23 : endHour - 1, endMinute);
  const incEndMinute = () => updateTimes(startHour, startMinute, endHour, endMinute >= 45 ? 0 : endMinute + 15);
  const decEndMinute = () => updateTimes(startHour, startMinute, endHour, endMinute <= 0 ? 45 : endMinute - 15);

  // Quick Preset Shortcuts
  const setQuickOff = () => {
    setIsManualOff(true);
    setSelectedShiftCode("O");
    setStartHour(0); setStartMinute(0);
    setEndHour(0); setEndMinute(0);
  };

  // Reset Button Handler
  const handleReset = () => {
    setSelectedDays([initialDay || 1]);
    applyShiftToTime(initialShiftCode);
  };

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth - 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleDayClick = (dayNum: number, isMulti = false) => {
    if (isMulti) {
      setSelectedDays(prev => 
        prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum].sort((a, b) => a - b)
      );
    } else {
      setSelectedDays([dayNum]);
    }
  };

  const handleSelectToday = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth() + 1);
    setSelectedDays([today.getDate()]);
  };

  const handleSelectWeek = () => {
    const startDay = selectedDays[0] || 1;
    const weekDays: number[] = [];
    for (let i = 0; i < 7; i++) {
      const d = startDay + i;
      if (d <= daysInMonth) weekDays.push(d);
    }
    setSelectedDays(weekDays);
  };

  // Smart Complementary pairing calculation
  let peerCurrentShift = "O";
  if (pairedEmployee) {
    try {
      const pShifts = Array.isArray(pairedEmployee.shifts) 
        ? pairedEmployee.shifts 
        : (pairedEmployee.shifts as any)?.[currentMonthKey] || [];
      peerCurrentShift = pShifts[(selectedDays[0] || 1) - 1] || "O";
    } catch {
      peerCurrentShift = "O";
    }
  }
  const recommendation = peerCurrentShift ? getComplementaryShift(peerCurrentShift) : null;

  // Format 24h strings
  const formattedStartTime = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;
  const formattedEndTime = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

  // Save Shift Handler
  const handleSave = () => {
    if (!employee || selectedDays.length === 0) return;

    onSaveShift({
      employeeId: employee.id,
      dayNumbers: selectedDays,
      shiftCode: isManualOff ? "O" : selectedShiftCode,
      startTime: isManualOff ? "-" : formattedStartTime,
      endTime: isManualOff ? "-" : formattedEndTime,
      isOvernight: dynamicShift.isOvernight,
      target: targetType
    });
    onClose();
  };

  if (!isOpen || !employee) return null;

  // Header display string
  const firstSelectedDay = selectedDays[0] || 1;
  const headerDateStr = `${monthNames[viewMonth - 1].substring(0, 3)} ${String(firstSelectedDay).padStart(2, "0")}, ${viewYear}` + 
    (selectedDays.length > 1 ? ` (+${selectedDays.length - 1} วัน)` : "");
  
  const headerTimeStr = isManualOff || selectedShiftCode === "O"
    ? "วันหยุด (OFF)" 
    : `${formattedStartTime} - ${formattedEndTime}${dynamicShift.isOvernight ? ' (+1 วัน)' : ''} น.`;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-2xl w-full flex flex-col font-sans relative overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 space-y-3">
          
          {/* Subtitle & Employee Info Bar */}
          <div className="flex items-center justify-between pr-8 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2 truncate">
              <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono">
                24H Shift & Time Scheduler
              </span>
              <span className="text-xs text-slate-700 font-bold truncate">
                {employee.name} <span className="text-slate-400 font-normal">({employee.role || "Operator"} • {employee.id})</span>
              </span>
            </div>
          </div>

          {/* Top Capsule Display Box (Dynamic Shift Code & Overnight Badge) */}
          <div className="relative border-2 border-indigo-500 rounded-2xl p-2.5 sm:p-3 bg-indigo-50/20 flex flex-wrap items-center justify-between gap-2 shadow-inner">
            <span className="absolute -top-2.5 left-5 px-2.5 py-0.2 rounded-full bg-indigo-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm">
              Date & Shift Time (24h)
            </span>

            <div className="flex items-center gap-2 sm:gap-2.5 text-slate-800 font-bold text-xs sm:text-sm">
              <CalendarIcon className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{headerDateStr}</span>
              <span className="text-slate-300 font-normal">|</span>
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-mono">{headerTimeStr}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {!isManualOff && dynamicShift.isOvernight && (
                <span className="px-2 py-0.5 rounded-md bg-purple-100 border border-purple-300 text-purple-700 font-black text-[10px] flex items-center gap-1">
                  <Moon className="w-3 h-3 text-purple-600" />
                  <span>คร่อมวัน (+1 วัน)</span>
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-mono font-black text-xs shadow-sm">
                {isManualOff ? "O" : selectedShiftCode}
              </span>
              <span className="text-[11px] text-indigo-700 font-black hidden sm:inline">
                {dynamicShift.name}
              </span>
            </div>
          </div>

          {/* Two-Column Main Content (Left Calendar 7 cols | Right Time & Dynamic Controls 5 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
            
            {/* LEFT: Compact Monthly Calendar Grid (Cols 7) */}
            <div className="md:col-span-7 bg-slate-50/70 rounded-2xl p-3 border border-slate-200/80 shadow-xs space-y-2">
              
              {/* Month / Year Navigator */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5">
                  <select
                    value={viewMonth}
                    onChange={(e) => setViewMonth(Number(e.target.value))}
                    className="px-2.5 py-1 rounded-lg border border-indigo-200 bg-white text-xs font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
                  >
                    {monthNames.map((m, idx) => (
                      <option key={m} value={idx + 1}>{m}</option>
                    ))}
                  </select>

                  <select
                    value={viewYear}
                    onChange={(e) => setViewYear(Number(e.target.value))}
                    className="px-2.5 py-1 rounded-lg border border-indigo-200 bg-white text-xs font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
                  >
                    {[2025, 2026, 2027].map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, idx) => (
                  <div key={day} className={`text-[10px] font-bold py-0.5 ${idx === 0 || idx === 6 ? "text-rose-500" : "text-slate-400"}`}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days Matrix */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => {
                  const dayNum = prevMonthDays - firstDayOfWeek + i + 1;
                  return (
                    <div key={`prev-${i}`} className="h-7 sm:h-8 flex items-center justify-center text-[11px] text-slate-300 font-medium select-none">
                      {dayNum}
                    </div>
                  );
                })}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const isSelected = selectedDays.includes(dayNum);
                  const isWeekend = (firstDayOfWeek + i) % 7 === 0 || (firstDayOfWeek + i) % 7 === 6;

                  return (
                    <button
                      key={`day-${dayNum}`}
                      type="button"
                      onClick={(e) => handleDayClick(dayNum, e.shiftKey || e.ctrlKey || e.metaKey)}
                      className={`h-7 sm:h-8 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center relative ${
                        isSelected 
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-300 scale-105 z-10" 
                          : isWeekend
                            ? "bg-rose-50/60 hover:bg-indigo-50 text-rose-700 hover:text-indigo-700 border border-rose-100"
                            : "bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-100"
                      }`}
                    >
                      <span>{dayNum}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selection Bar */}
              <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>เลือก <strong className="text-indigo-600 font-black">{selectedDays.length}</strong> วัน</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleSelectToday}
                    className="px-2 py-0.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold transition-colors cursor-pointer text-[10px]"
                  >
                    วันนี้
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectWeek}
                    className="px-2 py-0.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold transition-colors cursor-pointer text-[10px]"
                  >
                    +7 วัน
                  </button>
                  <button
                    type="button"
                    onClick={setQuickOff}
                    className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-black transition-colors cursor-pointer text-[10px]"
                    title="ตั้งค่าเป็นวันหยุดพัก (OFF)"
                  >
                    วันหยุด (OFF)
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT: Start & End Time Steppers (Cols 5) */}
            <div className="md:col-span-5 space-y-2">
              
              {/* TIME BOX: 2 Steppers (เวลาเข้างาน & เวลาออกงาน) */}
              <div className="bg-slate-50/70 rounded-2xl p-2.5 border border-slate-200/80 shadow-xs space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>เวลาเข้า - ออกงาน (24 ชม.)</span>
                  </span>
                  {!isManualOff && dynamicShift.isOvernight && (
                    <span className="text-[9px] text-purple-700 font-black bg-purple-100 px-1.5 py-0.5 rounded border border-purple-300 flex items-center gap-0.5">
                      <Moon className="w-2.5 h-2.5 text-purple-600" />
                      <span>คร่อมวัน (+1 วัน)</span>
                    </span>
                  )}
                </div>

                {/* 2 Sub-boxes: [ เวลาเข้างาน ] & [ เวลาออกงาน ] */}
                <div className="grid grid-cols-2 gap-2">
                  
                  {/* เวลาเข้างาน (Start Time) */}
                  <div className="p-2 bg-white border border-emerald-200 rounded-xl shadow-2xs space-y-1">
                    <div className="text-[10px] font-black text-emerald-700 flex items-center gap-1 justify-center">
                      <LogIn className="w-3 h-3 text-emerald-600" />
                      <span>เวลาเข้างาน</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-center">
                      {/* Start Hour */}
                      <div>
                        <button type="button" onClick={incStartHour} className="w-full py-1 rounded bg-slate-50 hover:bg-emerald-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <div className="py-1 font-mono font-black text-sm text-slate-900 bg-slate-100 rounded my-0.5">
                          {String(startHour).padStart(2, "0")}
                        </div>
                        <button type="button" onClick={decStartHour} className="w-full py-1 rounded bg-slate-50 hover:bg-emerald-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Start Minute */}
                      <div>
                        <button type="button" onClick={incStartMinute} className="w-full py-1 rounded bg-slate-50 hover:bg-emerald-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <div className="py-1 font-mono font-black text-sm text-slate-900 bg-slate-100 rounded my-0.5">
                          {String(startMinute).padStart(2, "0")}
                        </div>
                        <button type="button" onClick={decStartMinute} className="w-full py-1 rounded bg-slate-50 hover:bg-emerald-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* เวลาออกงาน (End Time) */}
                  <div className="p-2 bg-white border border-rose-200 rounded-xl shadow-2xs space-y-1">
                    <div className="text-[10px] font-black text-rose-700 flex items-center gap-1 justify-center">
                      <LogOut className="w-3 h-3 text-rose-600" />
                      <span>เวลาออกงาน</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-center">
                      {/* End Hour */}
                      <div>
                        <button type="button" onClick={incEndHour} className="w-full py-1 rounded bg-slate-50 hover:bg-rose-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <div className="py-1 font-mono font-black text-sm text-slate-900 bg-slate-100 rounded my-0.5">
                          {String(endHour).padStart(2, "0")}
                        </div>
                        <button type="button" onClick={decEndHour} className="w-full py-1 rounded bg-slate-50 hover:bg-rose-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* End Minute */}
                      <div>
                        <button type="button" onClick={incEndMinute} className="w-full py-1 rounded bg-slate-50 hover:bg-rose-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <div className="py-1 font-mono font-black text-sm text-slate-900 bg-slate-100 rounded my-0.5">
                          {String(endMinute).padStart(2, "0")}
                        </div>
                        <button type="button" onClick={decEndMinute} className="w-full py-1 rounded bg-slate-50 hover:bg-rose-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Dynamic Shift Result Card */}
                <div className="p-2.5 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <span className="text-[10px] text-slate-500 uppercase">รหัสกะ:</span>
                      <span className="font-mono font-black text-indigo-700 bg-white px-2.5 py-0.5 rounded-md shadow-2xs border border-indigo-200 text-sm">
                        {isManualOff ? "O" : selectedShiftCode}
                      </span>
                    </div>
                    <span className="text-xs font-black text-indigo-900">
                      {isManualOff ? "0 ชม." : `${dynamicShift.duration} ชม.`} {!isManualOff && dynamicShift.otHours > 0 ? `• OT ${dynamicShift.otHours}h` : ''}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center justify-between pt-0.5 border-t border-indigo-100">
                    <span className="font-medium">
                      {isManualOff 
                        ? "วันหยุดพักผ่อนประจำสัปดาห์" 
                        : `${formattedStartTime} ➜ ${formattedEndTime} น.${dynamicShift.isOvernight ? ' (วันถัดไป)' : ''}`}
                    </span>
                    {!isManualOff && dynamicShift.isOvernight && (
                      <span className="text-purple-700 font-bold text-[10px]">
                        🌙 กะข้ามคืน
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons: [ รีเซ็ต ] + [ ตกลง ] */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    title="รีเซ็ตกลับเป็นค่าตั้งต้นของวันนั้น"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>รีเซ็ต</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 border border-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    title="ยืนยันการบันทึกกะ"
                  >
                    <Check className="w-4 h-4" />
                    <span>ตกลง (บันทึก)</span>
                  </button>
                </div>
              </div>

              {/* AI Smart Complementary Pair Suggestion */}
              {recommendation && pairedEmployee && (
                <div className="p-2 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-[10px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                      คู่กะ: {pairedEmployee.name.split(" ")[0]} ({peerCurrentShift})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyShiftToTime(recommendation.suggestedCode)}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-[10px] flex items-center justify-between shadow-2xs cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <span>ใส่กะคู่แนะนำ: {recommendation.suggestedCode}</span>
                    <span className="px-1.5 py-0.5 rounded bg-black/20 text-[9px] font-mono">1-Click ⚡</span>
                  </button>
                </div>
              )}

              {/* Target Selector: Plan / Actual / Both */}
              <div className="flex items-center justify-between gap-1 p-0.5 bg-slate-100 rounded-lg">
                {[
                  { id: "actual", label: "Actual" },
                  { id: "plan", label: "Plan" },
                  { id: "both", label: "ทั้งคู่" }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTargetType(t.id as any)}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      targetType === t.id 
                        ? "bg-white text-indigo-700 shadow-2xs font-black" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
