import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Check, 
  RotateCcw,
  LogIn,
  LogOut,
  Moon,
  Users
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

  let duration = 0;
  let isOvernight = false;

  if (sH === eH && sM === eM) {
    // Full 24-hour shift (e.g. 08:00 to 08:00)
    duration = 24;
    isOvernight = true;
  } else if (eH === 0 && eM === 0 && (sH !== 0 || sM !== 0)) {
    duration = 24 - (sH + sM / 60);
    isOvernight = false;
  } else if (endMins > startMins) {
    duration = (endMins - startMins) / 60;
    isOvernight = false;
  } else {
    // Cross-day / Overnight shift (e.g. 20:00 -> 08:00 = 12h)
    duration = ((24 * 60 - startMins) + endMins) / 60;
    isOvernight = true;
  }

  let roundedDuration = Math.round(duration);
  if (roundedDuration <= 0) roundedDuration = 24;
  if (roundedDuration > 24) roundedDuration = 24;

  const otHours = Math.max(0, roundedDuration - 8);

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

  if (sH === 8 && eH === 17 && sM === 0 && eM === 0) {
    return { code: "D", name: "กลางวันปกติ (8h)", duration: 8, otHours: 0, isOvernight: false };
  }

  const code = `${prefix}${roundedDuration}`;
  const name = `${timeLabel} ${roundedDuration} ชม.${isOvernight ? ' (คร่อมวัน)' : ''}${otHours > 0 ? ` (OT ${otHours}h)` : ''}`;

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

  const [yearStr, monthStr] = currentMonthKey.split("-");
  const currentYear = Number(yearStr) || 2026;
  const currentMonth = Number(monthStr) || 8;

  const [viewYear, setViewYear] = useState<number>(currentYear);
  const [viewMonth, setViewMonth] = useState<number>(currentMonth);

  const [startHour, setStartHour] = useState<number>(7);
  const [startMinute, setStartMinute] = useState<number>(0);
  const [endHour, setEndHour] = useState<number>(19);
  const [endMinute, setEndMinute] = useState<number>(0);
  const [isManualOff, setIsManualOff] = useState<boolean>(false);

  const dynamicShift = computeDynamicShift(startHour, startMinute, endHour, endMinute, isManualOff);
  const [selectedShiftCode, setSelectedShiftCode] = useState<string>("M12");
  const [initialShiftCode, setInitialShiftCode] = useState<string>("M12");

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

  const updateTimes = (newSH: number, newSM: number, newEH: number, newEM: number) => {
    setIsManualOff(false);
    setStartHour(newSH);
    setStartMinute(newSM);
    setEndHour(newEH);
    setEndMinute(newEM);
    const computed = computeDynamicShift(newSH, newSM, newEH, newEM, false);
    setSelectedShiftCode(computed.code);
  };

  const incStartHour = () => updateTimes(startHour >= 23 ? 0 : startHour + 1, startMinute, endHour, endMinute);
  const decStartHour = () => updateTimes(startHour <= 0 ? 23 : startHour - 1, startMinute, endHour, endMinute);
  const incStartMinute = () => updateTimes(startHour, startMinute >= 45 ? 0 : startMinute + 15, endHour, endMinute);
  const decStartMinute = () => updateTimes(startHour, startMinute <= 0 ? 45 : startMinute - 15, endHour, endMinute);

  const incEndHour = () => updateTimes(startHour, startMinute, endHour >= 23 ? 0 : endHour + 1, endMinute);
  const decEndHour = () => updateTimes(startHour, startMinute, endHour <= 0 ? 23 : endHour - 1, endMinute);
  const incEndMinute = () => updateTimes(startHour, startMinute, endHour, endMinute >= 45 ? 0 : endMinute + 15);
  const decEndMinute = () => updateTimes(startHour, startMinute, endHour, endMinute <= 0 ? 45 : endMinute - 15);

  const setQuickOff = () => {
    setIsManualOff(true);
    setSelectedShiftCode("O");
    setStartHour(0); setStartMinute(0);
    setEndHour(0); setEndMinute(0);
  };

  const handleReset = () => {
    setSelectedDays([initialDay || 1]);
    applyShiftToTime(initialShiftCode);
  };

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth - 1, 0).getDate();

  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
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

  const formattedStartTime = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;
  const formattedEndTime = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

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

  const firstSelectedDay = selectedDays[0] || 1;
  const headerDateStr = `${String(firstSelectedDay).padStart(2, "0")} ${monthNames[viewMonth - 1]} ${viewYear}` + 
    (selectedDays.length > 1 ? ` (+${selectedDays.length - 1} วัน)` : "");
  
  const headerTimeStr = isManualOff || selectedShiftCode === "O"
    ? "วันหยุด (OFF)" 
    : `${formattedStartTime} - ${formattedEndTime}${dynamicShift.isOvernight ? ' (+1 วัน)' : ''} น.`;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0b1a3a]/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full flex flex-col font-sans relative overflow-hidden">
        
        {/* Minimal Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0b1a3a]">
              ตั้งเวลากะทำงาน (24H Shift Scheduler)
            </h3>
            <span className="text-xs text-slate-600 font-medium">
              {employee.name} <span className="text-slate-400">({employee.role || "Operator"} • {employee.id})</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-3 bg-white">
          
          {/* Top Clean Info Bar (Flat & Minimalist) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <CalendarIcon className="w-4 h-4 text-[#1d3ec7] shrink-0" />
              <span>{headerDateStr}</span>
              <span className="text-slate-300 font-normal">|</span>
              <Clock className="w-4 h-4 text-[#1d3ec7] shrink-0" />
              <span className="font-mono">{headerTimeStr}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {!isManualOff && dynamicShift.isOvernight && (
                <span className="px-2 py-0.5 rounded bg-[#a9cdfc]/30 border border-[#6d93fc]/40 text-[#0b1a3a] font-bold text-[10px] flex items-center gap-1">
                  <Moon className="w-3 h-3 text-[#1d3ec7]" />
                  <span>คร่อมวัน (+1 วัน)</span>
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-md bg-[#1d3ec7] text-white font-mono font-black text-xs">
                {isManualOff ? "O" : selectedShiftCode}
              </span>
              <span className="text-[11px] text-slate-700 font-bold hidden sm:inline">
                {dynamicShift.name}
              </span>
            </div>
          </div>

          {/* Two-Column Grid: Left Calendar (7 cols) | Right Time Controls (5 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
            
            {/* LEFT: Clean Calendar Matrix (Cols 7) */}
            <div className="md:col-span-7 bg-slate-50/50 rounded-xl p-3 border border-slate-200 space-y-2">
              
              {/* Month / Year Navigator */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5">
                  <select
                    value={viewMonth}
                    onChange={(e) => setViewMonth(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1d3ec7] cursor-pointer"
                  >
                    {monthNames.map((m, idx) => (
                      <option key={m} value={idx + 1}>{m}</option>
                    ))}
                  </select>

                  <select
                    value={viewYear}
                    onChange={(e) => setViewYear(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1d3ec7] cursor-pointer"
                  >
                    {[2025, 2026, 2027].map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day) => (
                  <div key={day} className="text-[10px] font-bold py-0.5 text-slate-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Matrix */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => {
                  const dayNum = prevMonthDays - firstDayOfWeek + i + 1;
                  return (
                    <div key={`prev-${i}`} className="h-7 sm:h-8 flex items-center justify-center text-[11px] text-slate-300 select-none">
                      {dayNum}
                    </div>
                  );
                })}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const isSelected = selectedDays.includes(dayNum);

                  return (
                    <button
                      key={`day-${dayNum}`}
                      type="button"
                      onClick={(e) => handleDayClick(dayNum, e.shiftKey || e.ctrlKey || e.metaKey)}
                      className={`h-7 sm:h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        isSelected 
                          ? "bg-[#1d3ec7] text-white font-black shadow-xs" 
                          : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60"
                      }`}
                    >
                      <span>{dayNum}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Select Tooling */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>เลือก <strong className="text-[#1d3ec7] font-black">{selectedDays.length}</strong> วัน</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleSelectToday}
                    className="px-2 py-0.5 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold transition-colors cursor-pointer text-[10px]"
                  >
                    วันนี้
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectWeek}
                    className="px-2 py-0.5 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold transition-colors cursor-pointer text-[10px]"
                  >
                    +7 วัน
                  </button>
                  <button
                    type="button"
                    onClick={setQuickOff}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold transition-colors cursor-pointer text-[10px]"
                    title="ตั้งค่าเป็นวันหยุดพัก (OFF)"
                  >
                    วันหยุด (OFF)
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT: Start & End Time Steppers (Cols 5) */}
            <div className="md:col-span-5 space-y-2.5">
              
              {/* Steppers Box */}
              <div className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#1d3ec7]" />
                    <span>เวลาเข้า - ออกงาน (24 ชม.)</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  
                  {/* Start Time */}
                  <div className="p-2 bg-white border border-slate-200 rounded-lg space-y-1">
                    <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1 justify-center">
                      <LogIn className="w-3 h-3 text-[#1d3ec7]" />
                      <span>เวลาเข้างาน</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-center">
                      <div>
                        <button type="button" onClick={incStartHour} className="w-full py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <div className="py-1 font-mono font-bold text-xs text-slate-900 bg-slate-50 rounded my-0.5 border border-slate-100">
                          {String(startHour).padStart(2, "0")}
                        </div>
                        <button type="button" onClick={decStartHour} className="w-full py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div>
                        <button type="button" onClick={incStartMinute} className="w-full py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <div className="py-1 font-mono font-bold text-xs text-slate-900 bg-slate-50 rounded my-0.5 border border-slate-100">
                          {String(startMinute).padStart(2, "0")}
                        </div>
                        <button type="button" onClick={decStartMinute} className="w-full py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* End Time */}
                  <div className="p-2 bg-white border border-slate-200 rounded-lg space-y-1">
                    <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1 justify-center">
                      <LogOut className="w-3 h-3 text-slate-600" />
                      <span>เวลาออกงาน</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-center">
                      <div>
                        <button type="button" onClick={incEndHour} className="w-full py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <div className="py-1 font-mono font-bold text-xs text-slate-900 bg-slate-50 rounded my-0.5 border border-slate-100">
                          {String(endHour).padStart(2, "0")}
                        </div>
                        <button type="button" onClick={decEndHour} className="w-full py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div>
                        <button type="button" onClick={incEndMinute} className="w-full py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <div className="py-1 font-mono font-bold text-xs text-slate-900 bg-slate-50 rounded my-0.5 border border-slate-100">
                          {String(endMinute).padStart(2, "0")}
                        </div>
                        <button type="button" onClick={decEndMinute} className="w-full py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Clean Shift Result Summary */}
                <div className="p-2 bg-white border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <span className="text-[10px] text-slate-500 uppercase">รหัสกะ:</span>
                      <span className="font-mono font-bold text-[#1d3ec7] bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-xs">
                        {isManualOff ? "O" : selectedShiftCode}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {isManualOff ? "0 ชม." : `${dynamicShift.duration} ชม.`} {!isManualOff && dynamicShift.otHours > 0 ? `• OT ${dynamicShift.otHours}h` : ''}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>
                      {isManualOff 
                        ? "วันหยุดพักผ่อน (OFF)" 
                        : `${formattedStartTime} - ${formattedEndTime} น.${dynamicShift.isOvernight ? ' (วันถัดไป)' : ''}`}
                    </span>
                    {!isManualOff && dynamicShift.isOvernight && (
                      <span className="text-[#1d3ec7] font-bold text-[10px]">
                        คร่อมวัน
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons: [ รีเซ็ต ] + [ ตกลง ] */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    title="รีเซ็ตกลับเป็นค่าตั้งต้น"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>รีเซ็ต</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="py-2 px-3 rounded-lg bg-[#1d3ec7] hover:bg-[#0b1a3a] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    title="บันทึกกะทำงาน"
                  >
                    <Check className="w-4 h-4" />
                    <span>ตกลง (บันทึก)</span>
                  </button>
                </div>
              </div>

              {/* Minimalist Complementary Pair Suggestion */}
              {recommendation && pairedEmployee && (
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] space-y-1">
                  <div className="flex items-center justify-between text-slate-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#1d3ec7]" />
                      คู่กะ: {pairedEmployee.name.split(" ")[0]} ({peerCurrentShift})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyShiftToTime(recommendation.suggestedCode)}
                    className="w-full py-1.5 px-2.5 rounded-md bg-[#1d3ec7] hover:bg-[#0b1a3a] text-white font-bold text-[10px] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span>ใส่กะคู่แนะนำ: {recommendation.suggestedCode}</span>
                    <span className="text-[9px] opacity-80">คลิกปรับ</span>
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
                    className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                      targetType === t.id 
                        ? "bg-white text-[#1d3ec7] shadow-xs" 
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
