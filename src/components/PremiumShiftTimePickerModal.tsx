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
    target: "plan" | "actual" | "both";
  }) => void;
}

export const PRESET_SHIFTS = [
  { code: "M12", label: "M12", name: "เช้า 12h", start: "07:00", end: "19:00", startH: 7, startM: 0, endH: 19, endM: 0, ot: 4 },
  { code: "N12", label: "N12", name: "ดึก 12h", start: "19:00", end: "07:00", startH: 19, startM: 0, endH: 7, endM: 0, ot: 4 },
  { code: "M8", label: "M8", name: "เช้า 8h", start: "07:00", end: "15:00", startH: 7, startM: 0, endH: 15, endM: 0, ot: 0 },
  { code: "A8", label: "A8", name: "บ่าย 8h", start: "15:00", end: "23:00", startH: 15, startM: 0, endH: 23, endM: 0, ot: 0 },
  { code: "N8", label: "N8", name: "ดึก 8h", start: "23:00", end: "07:00", startH: 23, startM: 0, endH: 7, endM: 0, ot: 0 },
  { code: "D", label: "D", name: "กลางวัน", start: "08:00", end: "17:00", startH: 8, startM: 0, endH: 17, endM: 0, ot: 0 },
  { code: "OND", label: "OND", name: "วันหยุด", start: "08:00", end: "17:00", startH: 8, startM: 0, endH: 17, endM: 0, ot: 8 },
  { code: "O", label: "OFF", name: "วันหยุดพัก", start: "-", end: "-", startH: 0, startM: 0, endH: 0, endM: 0, ot: 0 }
];

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
  const [selectedShiftCode, setSelectedShiftCode] = useState<string>("M12");
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
        setSelectedShiftCode(currentDayShift);
        setInitialShiftCode(currentDayShift);
        applyShiftToTime(currentDayShift);
      }
    }
  }, [isOpen, initialDay, currentMonthKey, employee]);

  // 1. LINK: Shift Preset -> Updates Start & End 24h Times
  const applyShiftToTime = (code: string) => {
    const preset = PRESET_SHIFTS.find(p => p.code === code);
    if (preset && preset.code !== "O") {
      setStartHour(preset.startH);
      setStartMinute(preset.startM);
      setEndHour(preset.endH);
      setEndMinute(preset.endM);
      return;
    }
    const def = SHIFT_DEFINITIONS[code];
    if (def) {
      if (def.startTime && def.startTime.includes(":")) {
        const [sh, sm] = def.startTime.split(":");
        setStartHour(Number(sh) || 7);
        setStartMinute(Number(sm) || 0);
      }
      if (def.endTime && def.endTime.includes(":")) {
        const [eh, em] = def.endTime.split(":");
        setEndHour(Number(eh) || 19);
        setEndMinute(Number(em) || 0);
      }
    }
  };

  // 2. LINK: Time Steppers -> Auto-detect matching Shift Preset
  const autoDetectShiftFromTime = (sH: number, eH: number) => {
    if (sH === 7 && eH === 19) {
      setSelectedShiftCode("M12");
    } else if (sH === 19 && eH === 7) {
      setSelectedShiftCode("N12");
    } else if (sH === 7 && eH === 15) {
      setSelectedShiftCode("M8");
    } else if (sH === 15 && eH === 23) {
      setSelectedShiftCode("A8");
    } else if (sH === 23 && eH === 7) {
      setSelectedShiftCode("N8");
    } else if (sH === 8 && eH === 17) {
      setSelectedShiftCode(selectedShiftCode === "OND" ? "OND" : "D");
    }
  };

  const handleSelectShiftPreset = (code: string) => {
    setSelectedShiftCode(code);
    applyShiftToTime(code);
  };

  // Start Time Stepper Handlers
  const incStartHour = () => {
    const nextH = startHour >= 23 ? 0 : startHour + 1;
    setStartHour(nextH);
    autoDetectShiftFromTime(nextH, endHour);
  };
  const decStartHour = () => {
    const nextH = startHour <= 0 ? 23 : startHour - 1;
    setStartHour(nextH);
    autoDetectShiftFromTime(nextH, endHour);
  };
  const incStartMinute = () => {
    const nextM = startMinute >= 45 ? 0 : startMinute + 15;
    setStartMinute(nextM);
  };
  const decStartMinute = () => {
    const nextM = startMinute <= 0 ? 45 : startMinute - 15;
    setStartMinute(nextM);
  };

  // End Time Stepper Handlers
  const incEndHour = () => {
    const nextH = endHour >= 23 ? 0 : endHour + 1;
    setEndHour(nextH);
    autoDetectShiftFromTime(startHour, nextH);
  };
  const decEndHour = () => {
    const nextH = endHour <= 0 ? 23 : endHour - 1;
    setEndHour(nextH);
    autoDetectShiftFromTime(startHour, nextH);
  };
  const incEndMinute = () => {
    const nextM = endMinute >= 45 ? 0 : endMinute + 15;
    setEndMinute(nextM);
  };
  const decEndMinute = () => {
    const nextM = endMinute <= 0 ? 45 : endMinute - 15;
    setEndMinute(nextM);
  };

  // Reset Button Handler
  const handleReset = () => {
    setSelectedDays([initialDay || 1]);
    setSelectedShiftCode(initialShiftCode);
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
      shiftCode: selectedShiftCode,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      target: targetType
    });
    onClose();
  };

  if (!isOpen || !employee) return null;

  // Header display string
  const firstSelectedDay = selectedDays[0] || 1;
  const headerDateStr = `${monthNames[viewMonth - 1].substring(0, 3)} ${String(firstSelectedDay).padStart(2, "0")}, ${viewYear}` + 
    (selectedDays.length > 1 ? ` (+${selectedDays.length - 1} วัน)` : "");
  const currentPreset = PRESET_SHIFTS.find(p => p.code === selectedShiftCode);
  const headerTimeStr = selectedShiftCode === "O" ? "วันหยุด (OFF)" : `${formattedStartTime} - ${formattedEndTime} น.`;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-2xl w-full max-h-[94vh] flex flex-col font-sans relative overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Scrollable Container */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[94vh]">
          
          {/* Subtitle & Employee Info Bar */}
          <div className="flex items-center justify-between pr-8 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2 truncate">
              <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono">
                24H Shift & Time
              </span>
              <span className="text-xs text-slate-700 font-bold truncate">
                {employee.name} <span className="text-slate-400 font-normal">({employee.role || "Operator"} • {employee.id})</span>
              </span>
            </div>
          </div>

          {/* Top Capsule Display Box */}
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
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-mono font-black text-xs shadow-sm">
                {selectedShiftCode}
              </span>
              <span className="text-[11px] text-slate-600 font-bold hidden sm:inline">
                {currentPreset?.name || selectedShiftCode}
              </span>
            </div>
          </div>

          {/* Two-Column Main Content (Left Calendar 7 cols | Right Time & Presets 5 cols) */}
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
                </div>
              </div>

            </div>

            {/* RIGHT: Start & End Time Steppers & Shift Presets (Cols 5) */}
            <div className="md:col-span-5 space-y-2">
              
              {/* TIME BOX: 2 Steppers (เวลาเข้างาน & เวลาออกงาน) */}
              <div className="bg-slate-50/70 rounded-2xl p-2.5 border border-slate-200/80 shadow-xs space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>เวลาเข้า - ออกงาน (24 ชม.)</span>
                  </span>
                  <span className="text-[9px] text-indigo-600 font-bold">ซิงค์กับกะ ⚡</span>
                </div>

                {/* 2 Sub-boxes: [ เวลาเข้างาน ] & [ เวลาออกงาน ] */}
                <div className="grid grid-cols-2 gap-2">
                  
                  {/* เวลาเข้างาน (Start Time) */}
                  <div className="p-1.5 bg-white border border-emerald-200 rounded-xl shadow-2xs space-y-1">
                    <div className="text-[9px] font-black text-emerald-700 flex items-center gap-1 justify-center">
                      <LogIn className="w-2.5 h-2.5 text-emerald-600" />
                      <span>เวลาเข้างาน</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-center">
                      {/* Start Hour */}
                      <div>
                        <button type="button" onClick={incStartHour} className="w-full py-0.5 rounded bg-slate-50 hover:bg-emerald-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs">
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <div className="py-0.5 font-mono font-black text-xs text-slate-900 bg-slate-100 rounded my-0.5">
                          {String(startHour).padStart(2, "0")}
                        </div>
                        <button type="button" onClick={decStartHour} className="w-full py-0.5 rounded bg-slate-50 hover:bg-emerald-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs">
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                      {/* Start Minute */}
                      <div>
                        <button type="button" onClick={incStartMinute} className="w-full py-0.5 rounded bg-slate-50 hover:bg-emerald-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs">
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <div className="py-0.5 font-mono font-black text-xs text-slate-900 bg-slate-100 rounded my-0.5">
                          {String(startMinute).padStart(2, "0")}
                        </div>
                        <button type="button" onClick={decStartMinute} className="w-full py-0.5 rounded bg-slate-50 hover:bg-emerald-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs">
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* เวลาออกงาน (End Time) */}
                  <div className="p-1.5 bg-white border border-rose-200 rounded-xl shadow-2xs space-y-1">
                    <div className="text-[9px] font-black text-rose-700 flex items-center gap-1 justify-center">
                      <LogOut className="w-2.5 h-2.5 text-rose-600" />
                      <span>เวลาออกงาน</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-center">
                      {/* End Hour */}
                      <div>
                        <button type="button" onClick={incEndHour} className="w-full py-0.5 rounded bg-slate-50 hover:bg-rose-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs">
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <div className="py-0.5 font-mono font-black text-xs text-slate-900 bg-slate-100 rounded my-0.5">
                          {String(endHour).padStart(2, "0")}
                        </div>
                        <button type="button" onClick={decEndHour} className="w-full py-0.5 rounded bg-slate-50 hover:bg-rose-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs">
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                      {/* End Minute */}
                      <div>
                        <button type="button" onClick={incEndMinute} className="w-full py-0.5 rounded bg-slate-50 hover:bg-rose-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs">
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <div className="py-0.5 font-mono font-black text-xs text-slate-900 bg-slate-100 rounded my-0.5">
                          {String(endMinute).padStart(2, "0")}
                        </div>
                        <button type="button" onClick={decEndMinute} className="w-full py-0.5 rounded bg-slate-50 hover:bg-rose-50 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs">
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Action Buttons: [ รีเซ็ต ] + [ ตกลง ] */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                    title="รีเซ็ตกลับเป็นค่าตั้งต้นของวันนั้น"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>รีเซ็ต</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="py-1.5 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 border border-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                    title="ยืนยันการบันทึกกะ"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>ตกลง</span>
                  </button>
                </div>
              </div>

              {/* Shift Presets Grid */}
              <div className="space-y-1">
                <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  เลือกกะที่ต้องการ (SHIFT PRESETS)
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {PRESET_SHIFTS.map(preset => {
                    const isSelected = selectedShiftCode === preset.code;
                    return (
                      <button
                        key={preset.code}
                        type="button"
                        onClick={() => handleSelectShiftPreset(preset.code)}
                        className={`px-2 py-1 rounded-lg text-left border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm scale-[1.02]"
                            : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-xs">{preset.code}</span>
                          {preset.ot > 0 && (
                            <span className={`text-[8px] font-bold px-1 py-0.2 rounded ${isSelected ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"}`}>
                              +{preset.ot}h
                            </span>
                          )}
                        </div>
                        <div className={`text-[9px] font-mono truncate ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                          {preset.start === "-" ? "วันหยุด" : `${preset.start}-${preset.end}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Smart Complementary Pair Suggestion */}
              {recommendation && pairedEmployee && (
                <div className="p-1.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-[10px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                      คู่กะ: {pairedEmployee.name.split(" ")[0]} ({peerCurrentShift})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectShiftPreset(recommendation.suggestedCode)}
                    className="w-full py-1 px-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-[10px] flex items-center justify-between shadow-2xs cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <span>ใส่กะคู่แนะนำ: {recommendation.suggestedCode}</span>
                    <span className="px-1 py-0.2 rounded bg-black/20 text-[9px] font-mono">1-Click ⚡</span>
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
