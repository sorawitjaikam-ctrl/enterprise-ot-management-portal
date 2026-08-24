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
  { code: "M12", label: "M12", name: "เช้า 12h", start: "07:00", end: "19:00", hour: 7, minute: 0, ot: 4 },
  { code: "N12", label: "N12", name: "ดึก 12h", start: "19:00", end: "07:00", hour: 19, minute: 0, ot: 4 },
  { code: "M8", label: "M8", name: "เช้า 8h", start: "07:00", end: "15:00", hour: 7, minute: 0, ot: 0 },
  { code: "A8", label: "A8", name: "บ่าย 8h", start: "15:00", end: "23:00", hour: 15, minute: 0, ot: 0 },
  { code: "N8", label: "N8", name: "ดึก 8h", start: "23:00", end: "07:00", hour: 23, minute: 0, ot: 0 },
  { code: "D", label: "D", name: "กลางวัน", start: "08:00", end: "17:00", hour: 8, minute: 0, ot: 0 },
  { code: "OND", label: "OND", name: "วันหยุด", start: "08:00", end: "17:00", hour: 8, minute: 0, ot: 8 },
  { code: "O", label: "OFF", name: "วันหยุดพัก", start: "-", end: "-", hour: 0, minute: 0, ot: 0 }
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

  // 24-Hour Stepper State (00 - 23, 00 - 45)
  const [hour24, setHour24] = useState<number>(7);
  const [minute, setMinute] = useState<number>(0);

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

  // 1. LINK: Shift Preset -> Updates 24h Time
  const applyShiftToTime = (code: string) => {
    const preset = PRESET_SHIFTS.find(p => p.code === code);
    if (preset && preset.code !== "O") {
      setHour24(preset.hour);
      setMinute(preset.minute);
      return;
    }
    const def = SHIFT_DEFINITIONS[code];
    if (def && def.startTime && def.startTime.includes(":")) {
      const [hStr, mStr] = def.startTime.split(":");
      setHour24(Number(hStr) || 7);
      setMinute(Number(mStr) || 0);
    }
  };

  // 2. LINK: Time Stepper -> Auto-detects matching Shift Preset
  const autoDetectShiftFromTime = (newHour: number, newMin: number) => {
    if (newHour === 7) {
      setSelectedShiftCode(selectedShiftCode === "M8" ? "M8" : "M12");
    } else if (newHour === 15) {
      setSelectedShiftCode("A8");
    } else if (newHour === 19) {
      setSelectedShiftCode("N12");
    } else if (newHour === 23) {
      setSelectedShiftCode("N8");
    } else if (newHour === 8) {
      setSelectedShiftCode(selectedShiftCode === "OND" ? "OND" : "D");
    }
  };

  const handleSelectShiftPreset = (code: string) => {
    setSelectedShiftCode(code);
    applyShiftToTime(code);
  };

  // 24-Hour Stepper handlers (00 to 23)
  const incHour = () => {
    const nextH = hour24 >= 23 ? 0 : hour24 + 1;
    setHour24(nextH);
    autoDetectShiftFromTime(nextH, minute);
  };

  const decHour = () => {
    const nextH = hour24 <= 0 ? 23 : hour24 - 1;
    setHour24(nextH);
    autoDetectShiftFromTime(nextH, minute);
  };

  const incMinute = () => {
    const nextM = minute >= 45 ? 0 : minute + 15;
    setMinute(nextM);
    autoDetectShiftFromTime(hour24, nextM);
  };

  const decMinute = () => {
    const nextM = minute <= 0 ? 45 : minute - 15;
    setMinute(nextM);
    autoDetectShiftFromTime(hour24, nextM);
  };

  // 3. Reset Button Handler
  const handleReset = () => {
    setSelectedDays([initialDay || 1]);
    setSelectedShiftCode(initialShiftCode);
    applyShiftToTime(initialShiftCode);
  };

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0 = Sun, 1 = Mon ...
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

  // Format 24h time string
  const formattedStartTime = `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  // Save Shift Handler
  const handleSave = () => {
    if (!employee || selectedDays.length === 0) return;

    onSaveShift({
      employeeId: employee.id,
      dayNumbers: selectedDays,
      shiftCode: selectedShiftCode,
      startTime: formattedStartTime,
      target: targetType
    });
    onClose();
  };

  if (!isOpen || !employee) return null;

  // Header display string in 24-hour format
  const firstSelectedDay = selectedDays[0] || 1;
  const headerDateStr = `${monthNames[viewMonth - 1].substring(0, 3)} ${String(firstSelectedDay).padStart(2, "0")}, ${viewYear}` + 
    (selectedDays.length > 1 ? ` (+${selectedDays.length - 1} วัน)` : "");
  const currentPreset = PRESET_SHIFTS.find(p => p.code === selectedShiftCode);
  const headerTimeStr = selectedShiftCode === "O" ? "วันหยุด (OFF)" : `${formattedStartTime} - ${currentPreset?.end || ""} น.`;

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

        {/* Modal Scrollable Container (Compact Spacing to Fit Any Screen) */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto max-h-[94vh]">
          
          {/* Subtitle & Employee Info Bar */}
          <div className="flex items-center justify-between pr-8 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2 truncate">
              <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono">
                24H Picker
              </span>
              <span className="text-xs text-slate-700 font-bold truncate">
                {employee.name} <span className="text-slate-400 font-normal">({employee.role || "Operator"} • {employee.id})</span>
              </span>
            </div>
          </div>

          {/* Top Capsule Display Box (Matching Reference Image) */}
          <div className="relative border-2 border-indigo-500 rounded-2xl p-2.5 sm:p-3 bg-indigo-50/20 flex flex-wrap items-center justify-between gap-2 shadow-inner">
            {/* Pill Label on Top Border */}
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
            
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
                {/* Previous month padding */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => {
                  const dayNum = prevMonthDays - firstDayOfWeek + i + 1;
                  return (
                    <div key={`prev-${i}`} className="h-7 sm:h-8 flex items-center justify-center text-[11px] text-slate-300 font-medium select-none">
                      {dayNum}
                    </div>
                  );
                })}

                {/* Current month days */}
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

            {/* RIGHT: Time Stepper & Presets & Actions (Cols 5) */}
            <div className="md:col-span-5 space-y-2.5">
              
              {/* 24-Hour Stepper Box */}
              <div className="bg-slate-50/70 rounded-2xl p-2.5 border border-slate-200/80 shadow-xs space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>TIME (เวลา 24 ชม.)</span>
                  </span>
                  <span className="text-[9px] text-indigo-600 font-bold">ซิงค์กับกะ ⚡</span>
                </div>

                {/* 2-Column Stepper */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  
                  {/* Hour */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400">ชั่วโมง (00-23)</span>
                    <button
                      type="button"
                      onClick={incHour}
                      className="w-full py-0.5 rounded-md bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs active:scale-95"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-full py-1 bg-white border border-indigo-200 rounded-lg font-mono font-black text-sm text-slate-900 shadow-inner">
                      {String(hour24).padStart(2, "0")}
                    </div>
                    <button
                      type="button"
                      onClick={decHour}
                      className="w-full py-0.5 rounded-md bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs active:scale-95"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Minute */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400">นาที (00-45)</span>
                    <button
                      type="button"
                      onClick={incMinute}
                      className="w-full py-0.5 rounded-md bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs active:scale-95"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-full py-1 bg-white border border-indigo-200 rounded-lg font-mono font-black text-sm text-slate-900 shadow-inner">
                      {String(minute).padStart(2, "0")}
                    </div>
                    <button
                      type="button"
                      onClick={decMinute}
                      className="w-full py-0.5 rounded-md bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs active:scale-95"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

                {/* Action Buttons: [ รีเซ็ต ] + [ ตกลง ] */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-200/80">
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

              {/* Shift Presets Grid (2 Columns, Compact) */}
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
                <div className="p-2 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-[11px] space-y-1">
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
