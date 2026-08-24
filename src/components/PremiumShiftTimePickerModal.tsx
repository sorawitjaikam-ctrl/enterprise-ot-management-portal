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
  Zap,
  Users,
  ShieldCheck,
  AlertCircle
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

const PRESET_SHIFTS = [
  { code: "M12", label: "M12 (เช้า 12h)", start: "07:00", end: "19:00", ot: 4, desc: "07:00 - 19:00 • OT 4 ชม." },
  { code: "N12", label: "N12 (ดึก 12h)", start: "19:00", end: "07:00", ot: 4, desc: "19:00 - 07:00 • OT 4 ชม." },
  { code: "M8", label: "M8 (เช้า 8h)", start: "07:00", end: "15:00", ot: 0, desc: "07:00 - 15:00 • งานปกติ" },
  { code: "A8", label: "A8 (บ่าย 8h)", start: "15:00", end: "23:00", ot: 0, desc: "15:00 - 23:00 • งานปกติ" },
  { code: "N8", label: "N8 (ดึก 8h)", start: "23:00", end: "07:00", ot: 0, desc: "23:00 - 07:00 • งานปกติ" },
  { code: "D", label: "D (กลางวัน)", start: "08:00", end: "17:00", ot: 0, desc: "08:00 - 17:00 • ทำการปกติ" },
  { code: "OND", label: "OND (วันหยุด)", start: "08:00", end: "17:00", ot: 8, desc: "08:00 - 17:00 • OT 8 ชม." },
  { code: "O", label: "OFF (วันหยุด)", start: "-", end: "-", ot: 0, desc: "วันหยุดพักผ่อนประจำสัปดาห์" }
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

  // Time Steppers State (12h format for UI stepper matching reference image)
  const [hour12, setHour12] = useState<number>(7);
  const [minute, setMinute] = useState<number>(0);
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      setSelectedDays([initialDay || 1]);
      setViewYear(currentYear);
      setViewMonth(currentMonth);

      // Get current shift for this employee on initialDay
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
        syncTimeToShift(currentDayShift);
      }
    }
  }, [isOpen, initialDay, currentMonthKey, employee]);

  const syncTimeToShift = (code: string) => {
    const def = SHIFT_DEFINITIONS[code];
    if (def && def.startTime && def.startTime.includes(":")) {
      const [hStr, mStr] = def.startTime.split(":");
      const h24 = Number(hStr) || 7;
      const m = Number(mStr) || 0;
      setHour12(h24 % 12 === 0 ? 12 : h24 % 12);
      setPeriod(h24 >= 12 ? "PM" : "AM");
      setMinute(m);
    }
  };

  const handleSelectShiftPreset = (code: string) => {
    setSelectedShiftCode(code);
    syncTimeToShift(code);
  };

  // Stepper handlers
  const incHour = () => setHour12(prev => (prev >= 12 ? 1 : prev + 1));
  const decHour = () => setHour12(prev => (prev <= 1 ? 12 : prev - 1));
  const incMinute = () => setMinute(prev => (prev + 15 >= 60 ? 0 : prev + 15));
  const decMinute = () => setMinute(prev => (prev - 15 < 0 ? 45 : prev - 15));
  const togglePeriod = () => setPeriod(prev => (prev === "AM" ? "PM" : "AM"));

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0 = Sun, 1 = Mon ...
  const prevMonthDays = new Date(viewYear, viewMonth - 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthNamesTh = [
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

  const handleSelectNow = () => {
    const now = new Date();
    const h24 = now.getHours();
    setHour12(h24 % 12 === 0 ? 12 : h24 % 12);
    setPeriod(h24 >= 12 ? "PM" : "AM");
    setMinute(Math.floor(now.getMinutes() / 15) * 15);
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

  // Format 24h start time string
  const startHour24 = period === "PM" ? (hour12 === 12 ? 12 : hour12 + 12) : (hour12 === 12 ? 0 : hour12);
  const formattedStartTime = `${String(startHour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

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

  // Header display string
  const firstSelectedDay = selectedDays[0] || 1;
  const headerDateStr = `${monthNames[viewMonth - 1].substring(0, 3)} ${String(firstSelectedDay).padStart(2, "0")}, ${viewYear}` + 
    (selectedDays.length > 1 ? ` (+${selectedDays.length - 1} วัน)` : "");
  const headerTimeStr = `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl border border-slate-200/80 max-w-2xl w-full overflow-hidden flex flex-col font-sans relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Main Title & Employee Badge */}
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
              <span>Premium Date & Shift Picker UI</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
                PRO
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              บันทึกตารางกะสำหรับ <strong className="text-slate-800 font-bold">{employee.name}</strong> ({employee.role || "Operator"} • {employee.id})
            </p>
          </div>

          {/* Top Capsule Display Box (Matching Reference Image) */}
          <div className="relative border-2 border-indigo-500/80 rounded-2xl p-3.5 sm:p-4 bg-indigo-50/20 flex flex-wrap items-center justify-between gap-3 shadow-inner">
            {/* Pill Label on Top Border */}
            <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[11px] uppercase tracking-wider shadow-sm">
              Date & Shift Time
            </span>

            <div className="flex items-center gap-2.5 sm:gap-3 text-slate-800 font-bold text-sm sm:text-base">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              <span>{headerDateStr}</span>
              <span className="text-slate-300 font-normal">|</span>
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>{headerTimeStr}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-mono font-black text-xs shadow-md">
                {selectedShiftCode}
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                {SHIFT_DEFINITIONS[selectedShiftCode]?.name || selectedShiftCode}
              </span>
            </div>
          </div>

          {/* Two-Column Layout: Calendar Grid on Left | Time & Shift on Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* LEFT: Interactive Monthly Calendar (Cols 7) */}
            <div className="md:col-span-7 bg-slate-50/60 rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3.5">
              
              {/* Month / Year Navigator Bar */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <select
                    value={viewMonth}
                    onChange={(e) => setViewMonth(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                  >
                    {monthNames.map((m, idx) => (
                      <option key={m} value={idx + 1}>{m}</option>
                    ))}
                  </select>

                  <select
                    value={viewYear}
                    onChange={(e) => setViewYear(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                  >
                    {[2025, 2026, 2027].map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, idx) => (
                  <div key={day} className={`text-[11px] font-bold py-1 ${idx === 0 || idx === 6 ? "text-rose-500" : "text-slate-400"}`}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {/* Previous month padding */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => {
                  const dayNum = prevMonthDays - firstDayOfWeek + i + 1;
                  return (
                    <div key={`prev-${i}`} className="h-9 flex items-center justify-center text-xs text-slate-300 font-medium select-none">
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
                      className={`h-9 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                        isSelected 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-300 scale-105 z-10" 
                          : isWeekend
                            ? "bg-rose-50/50 hover:bg-indigo-50 text-rose-700 hover:text-indigo-700"
                            : "bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-100"
                      }`}
                    >
                      <span>{dayNum}</span>
                    </button>
                  );
                })}
              </div>

              {/* Multi-select and Quick Selection helpers */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>เลือกแล้ว <strong className="text-indigo-600 font-black">{selectedDays.length}</strong> วัน</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSelectToday}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    วันนี้
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectWeek}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    +7 วัน
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT: Time Stepper & Shift Presets (Cols 5) */}
            <div className="md:col-span-5 space-y-4">
              
              {/* Time Stepper Section (Matching Reference Image) */}
              <div className="bg-slate-50/60 rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                  <span>Time</span>
                  <span className="text-[10px] text-slate-400 font-normal">เวลาเริ่มกะ</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  
                  {/* Hour Stepper */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400">Hour</span>
                    <button
                      type="button"
                      onClick={incHour}
                      className="w-10 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-full py-1.5 bg-white border border-slate-200 rounded-xl font-mono font-black text-sm text-slate-800 shadow-inner">
                      {String(hour12).padStart(2, "0")}
                    </div>
                    <button
                      type="button"
                      onClick={decHour}
                      className="w-10 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Minute Stepper */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400">Minute</span>
                    <button
                      type="button"
                      onClick={incMinute}
                      className="w-10 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-full py-1.5 bg-white border border-slate-200 rounded-xl font-mono font-black text-sm text-slate-800 shadow-inner">
                      {String(minute).padStart(2, "0")}
                    </div>
                    <button
                      type="button"
                      onClick={decMinute}
                      className="w-10 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* AM / PM Toggle */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400">AM / PM</span>
                    <button
                      type="button"
                      onClick={togglePeriod}
                      className="w-10 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-full py-1.5 bg-white border border-slate-200 rounded-xl font-mono font-black text-sm text-indigo-600 shadow-inner">
                      {period}
                    </div>
                    <button
                      type="button"
                      onClick={togglePeriod}
                      className="w-10 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

                {/* Quick Action Buttons (Today / Now matching reference image) */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleSelectToday}
                    className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectNow}
                    className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Now
                  </button>
                </div>
              </div>

              {/* Shift Presets Grid */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  เลือกกะที่ต้องการ (Shift Presets)
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_SHIFTS.map(preset => {
                    const isSelected = selectedShiftCode === preset.code;
                    return (
                      <button
                        key={preset.code}
                        type="button"
                        onClick={() => handleSelectShiftPreset(preset.code)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-[1.02]"
                            : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-xs">{preset.code}</span>
                          {preset.ot > 0 && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"}`}>
                              +{preset.ot}h OT
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] truncate mt-0.5 ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                          {preset.start === "-" ? "วันหยุด" : `${preset.start} - ${preset.end}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Smart Complementary Pair Suggestion */}
              {recommendation && pairedEmployee && (
                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      คำแนะนำคู่กะ (AI Pair)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      คู่กับ: {pairedEmployee.name.split(" ")[0]} ({peerCurrentShift})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectShiftPreset(recommendation.suggestedCode)}
                    className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-between shadow-sm cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <span>ใส่กะคู่แนะนำ: {recommendation.suggestedCode}</span>
                    <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono">1-Click ⚡</span>
                  </button>
                </div>
              )}

              {/* Target Selector: Plan / Actual / Both */}
              <div className="flex items-center justify-between gap-1 p-1 bg-slate-100 rounded-xl">
                {[
                  { id: "actual", label: "Actual (ปฏิบัติจริง)" },
                  { id: "plan", label: "Plan (แผนงาน)" },
                  { id: "both", label: "ทั้ง Plan & Actual" }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTargetType(t.id as any)}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      targetType === t.id 
                        ? "bg-white text-indigo-700 shadow-sm" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

            </div>

          </div>

          {/* BOTTOM: Prominent Done Button (Matching Reference Image) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-xl shadow-indigo-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>Done (บันทึกข้อมูลกะ {selectedDays.length} วัน)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
