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

export const PRESET_SHIFTS = [
  { code: "M12", label: "M12", name: "เช้า 12 ชม.", start: "07:00", end: "19:00", hour: 7, minute: 0, ot: 4, desc: "07:00 - 19:00 (OT 4 ชม.)" },
  { code: "N12", label: "N12", name: "ดึก 12 ชม.", start: "19:00", end: "07:00", hour: 19, minute: 0, ot: 4, desc: "19:00 - 07:00 (OT 4 ชม.)" },
  { code: "M8", label: "M8", name: "เช้า 8 ชม.", start: "07:00", end: "15:00", hour: 7, minute: 0, ot: 0, desc: "07:00 - 15:00 (งานปกติ)" },
  { code: "A8", label: "A8", name: "บ่าย 8 ชม.", start: "15:00", end: "23:00", hour: 15, minute: 0, ot: 0, desc: "15:00 - 23:00 (งานปกติ)" },
  { code: "N8", label: "N8", name: "ดึก 8 ชม.", start: "23:00", end: "07:00", hour: 23, minute: 0, ot: 0, desc: "23:00 - 07:00 (งานปกติ)" },
  { code: "D", label: "D", name: "กลางวัน", start: "08:00", end: "17:00", hour: 8, minute: 0, ot: 0, desc: "08:00 - 17:00 (ทำการปกติ)" },
  { code: "OND", label: "OND", name: "ทำงานวันหยุด", start: "08:00", end: "17:00", hour: 8, minute: 0, ot: 8, desc: "08:00 - 17:00 (OT 8 ชม.)" },
  { code: "O", label: "OFF", name: "วันหยุดพัก", start: "-", end: "-", hour: 0, minute: 0, ot: 0, desc: "วันหยุดพักผ่อนประจำสัปดาห์" }
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

  // 24-Hour Stepper State (00 - 23, 00 - 59)
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
              <span>บันทึกตารางกะ (Premium Date & 24h Shift Picker)</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
                24H
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              บันทึกตารางกะสำหรับ <strong className="text-slate-800 font-bold">{employee.name}</strong> ({employee.role || "Operator"} • {employee.id})
            </p>
          </div>

          {/* Top Capsule Display Box (Matching Reference Image in 24-hour format) */}
          <div className="relative border-2 border-indigo-500/80 rounded-2xl p-3.5 sm:p-4 bg-indigo-50/20 flex flex-wrap items-center justify-between gap-3 shadow-inner">
            {/* Pill Label on Top Border */}
            <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[11px] uppercase tracking-wider shadow-sm">
              Date & Shift Time (24h)
            </span>

            <div className="flex items-center gap-2.5 sm:gap-3 text-slate-800 font-bold text-sm sm:text-base">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              <span>{headerDateStr}</span>
              <span className="text-slate-300 font-normal">|</span>
              <Clock className="w-5 h-5 text-indigo-600" />
              <span className="font-mono">{headerTimeStr}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-mono font-black text-xs shadow-md">
                {selectedShiftCode}
              </span>
              <span className="text-xs text-slate-600 font-bold hidden sm:inline">
                {currentPreset?.name || selectedShiftCode}
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

            {/* RIGHT: Time Stepper (24h) & Shift Presets (Cols 5) */}
            <div className="md:col-span-5 space-y-4">
              
              {/* 24-Hour Stepper Section (Requirement 2: Full 24h format, No AM/PM) */}
              <div className="bg-slate-50/60 rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>TIME (เวลา 24 ชม.)</span>
                  </span>
                  <span className="text-[10px] text-indigo-600 font-bold">เชื่อมโยงกับกะ ⚡</span>
                </div>

                {/* 2-Column 24h Stepper (Hour 00-23 | Minute 00-45) */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  
                  {/* 24-Hour Stepper */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400">ชั่วโมง (00-23)</span>
                    <button
                      type="button"
                      onClick={incHour}
                      className="w-full py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <div className="w-full py-2 bg-white border border-indigo-200 rounded-xl font-mono font-black text-base text-slate-900 shadow-inner">
                      {String(hour24).padStart(2, "0")}
                    </div>
                    <button
                      type="button"
                      onClick={decHour}
                      className="w-full py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Minute Stepper */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400">นาที (00-45)</span>
                    <button
                      type="button"
                      onClick={incMinute}
                      className="w-full py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <div className="w-full py-2 bg-white border border-indigo-200 rounded-xl font-mono font-black text-base text-slate-900 shadow-inner">
                      {String(minute).padStart(2, "0")}
                    </div>
                    <button
                      type="button"
                      onClick={decMinute}
                      className="w-full py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* Requirement 3: Action Buttons in Red Circle -> [ รีเซ็ต ] + [ ตกลง ] */}
                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-black text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    title="รีเซ็ตกลับเป็นค่าตั้งต้น"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>รีเซ็ต (Reset)</span>
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

              {/* Shift Presets Grid (Requirement 1: Linked with 24h Time Stepper) */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>เลือกกะที่ต้องการ (SHIFT PRESETS)</span>
                  <span className="text-[9px] text-slate-400 font-normal">คลิกเพื่อซิงค์เวลา</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_SHIFTS.map(preset => {
                    const isSelected = selectedShiftCode === preset.code;
                    return (
                      <button
                        key={preset.code}
                        type="button"
                        onClick={() => handleSelectShiftPreset(preset.code)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-[1.02] ring-2 ring-indigo-400/40"
                            : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-xs">{preset.code}</span>
                            <span className={`text-[10px] font-bold ${isSelected ? "text-white/90" : "text-slate-500"}`}>
                              {preset.name}
                            </span>
                          </div>
                          {preset.ot > 0 && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"}`}>
                              +{preset.ot}h OT
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] font-mono truncate mt-0.5 ${isSelected ? "text-white/80" : "text-slate-400"}`}>
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
                      คำแนะนำคู่กะ (AI PAIR)
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

          {/* BOTTOM: Full Width Confirm Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-xl shadow-indigo-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>ตกลง (บันทึกข้อมูลกะ {selectedDays.length} วัน)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
