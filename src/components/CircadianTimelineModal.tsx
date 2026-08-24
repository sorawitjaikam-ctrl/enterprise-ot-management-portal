import React, { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  CornerDownLeft 
} from "lucide-react";
import { Employee } from "../types";
import {
  calculateHourlyStaffingDensity,
  getShiftCircadianSegments,
  isCircadianNightHour
} from "../utils/circadianEngine";
import { SHIFT_DEFINITIONS } from "../utils/shiftRecommendation";

interface CircadianTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  currentMonth: string; // "YYYY-MM"
  departmentName?: string;
  onSelectCell?: (empId: string, dayNumber: number) => void;
}

export const CircadianTimelineModal: React.FC<CircadianTimelineModalProps> = ({
  isOpen,
  onClose,
  employees,
  currentMonth,
  departmentName = "แผนกปฏิบัติการ",
  onSelectCell
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<string>("ALL");

  const [yearStr, monthStr] = (currentMonth || "2026-08").split("-");
  const year = Number(yearStr) || 2026;
  const month = Number(monthStr) || 8;
  const totalDays = new Date(year, month, 0).getDate();

  // Clamp selectedDay
  const activeDay = Math.min(Math.max(1, selectedDay), totalDays);
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(activeDay).padStart(2, "0")}`;

  const dayOfWeekNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  const activeDateObj = new Date(year, month - 1, activeDay);
  const dayNameTh = dayOfWeekNames[activeDateObj.getDay()];

  // Unique roles
  const roles = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => {
      if (e.role) set.add(e.role);
    });
    return Array.from(set);
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    if (selectedRole === "ALL") return employees;
    return employees.filter(e => e.role === selectedRole);
  }, [employees, selectedRole]);

  // Build shift maps for active day and previous day (for carryover)
  const currentDayShifts = useMemo(() => {
    const map: Record<string, string> = {};
    employees.forEach(e => {
      let shiftList: string[] = [];
      if (Array.isArray(e.shifts)) {
        shiftList = e.shifts;
      } else if (typeof e.shifts === "string") {
        try {
          const parsed = JSON.parse(e.shifts);
          if (Array.isArray(parsed)) shiftList = parsed;
          else if (parsed && typeof parsed === "object") shiftList = parsed[currentMonth] || [];
        } catch { shiftList = []; }
      } else if (e.shifts && typeof e.shifts === "object") {
        shiftList = (e.shifts as any)[currentMonth] || [];
      }
      map[e.id] = shiftList[activeDay - 1] || "O";
    });
    return map;
  }, [employees, currentMonth, activeDay]);

  const prevDayShifts = useMemo(() => {
    const map: Record<string, string> = {};
    const prevDayIdx = activeDay - 2;
    if (prevDayIdx >= 0) {
      employees.forEach(e => {
        let shiftList: string[] = [];
        if (Array.isArray(e.shifts)) {
          shiftList = e.shifts;
        } else if (typeof e.shifts === "string") {
          try {
            const parsed = JSON.parse(e.shifts);
            if (Array.isArray(parsed)) shiftList = parsed;
            else if (parsed && typeof parsed === "object") shiftList = parsed[currentMonth] || [];
          } catch { shiftList = []; }
        } else if (e.shifts && typeof e.shifts === "object") {
          shiftList = (e.shifts as any)[currentMonth] || [];
        }
        map[e.id] = shiftList[prevDayIdx] || "O";
      });
    }
    return map;
  }, [employees, currentMonth, activeDay]);

  // Hourly density calculation
  const density = useMemo(() => {
    return calculateHourlyStaffingDensity(currentDayShifts, dateStr, filteredEmployees, prevDayShifts);
  }, [currentDayShifts, dateStr, filteredEmployees, prevDayShifts]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      data-testid="circadian-timeline-modal"
    >
      <div className="relative w-full max-w-7xl max-h-[92vh] flex flex-col bg-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden text-slate-100">
        {/* Cockpit Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
              </svg>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 tracking-wide">
                  24-Hour Circadian Timeline Matrix
                </h2>
                <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-cyan-950 text-cyan-400 border border-cyan-500/40 rounded">
                  GANTT 24H
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {departmentName} • ตารางความครอบคลุมกำลังพล 24 ชั่วโมงและวงจรการนอนหลับ
              </p>
            </div>
          </div>

          {/* Date Selector & Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setSelectedDay(d => Math.max(1, d - 1))}
                disabled={activeDay <= 1}
                className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 flex items-center justify-center"
                aria-label="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 text-center">
                <div className="text-xs font-mono font-bold text-cyan-400">
                  {dateStr}
                </div>
                <div className="text-[11px] text-slate-400">
                  วัน{dayNameTh} (วันที่ {activeDay})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(d => Math.min(totalDays, d + 1))}
                disabled={activeDay >= totalDays}
                className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 flex items-center justify-center"
                aria-label="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Day Dropdown */}
            <select
              value={activeDay}
              onChange={e => setSelectedDay(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>
                  วันที่ {d}
                </option>
              ))}
            </select>

            {/* Role Filter */}
            {roles.length > 0 && (
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">ทุกตำแหน่ง ({employees.length})</option>
                {roles.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Circadian Telemetry Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 p-3 bg-slate-950/60 border-b border-slate-800 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">พนักงานปฏิบัติงาน</span>
            <span className="text-base font-bold font-mono text-cyan-400">
              {density.totalActiveStaff} <span className="text-xs text-slate-400">/ {filteredEmployees.length} คน</span>
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">ช่วงกะเช้า (07-15)</span>
            <span className="text-base font-bold font-mono text-sky-400">
              {density.morningAverage} <span className="text-xs text-slate-400">คน/ชม.</span>
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">ช่วงกะบ่าย (15-23)</span>
            <span className="text-base font-bold font-mono text-amber-400">
              {density.afternoonAverage} <span className="text-xs text-slate-400">คน/ชม.</span>
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">ช่วงกะดึก (23-07)</span>
            <span className="text-base font-bold font-mono text-purple-400">
              {density.nightAverage} <span className="text-xs text-slate-400">คน/ชม.</span>
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">กำลังพลสูงสุด (Peak)</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {density.slots[density.peakHour]?.headcount || 0} คน <span className="text-[10px] text-slate-400">({String(density.peakHour).padStart(2, "0")}:00)</span>
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">สถานะความปลอดภัย</span>
            <span className={`text-xs font-bold inline-flex items-center gap-1 ${density.coverageWarnings.length === 0 ? "text-emerald-400" : "text-amber-400"}`}>
              {density.coverageWarnings.length === 0 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ครอบคลุม 100%</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>เตือน ({density.coverageWarnings.length})</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Main Gantt Timeline Matrix Area */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 space-y-4">
          {/* Circadian Heatmap Bar (00:00 to 23:00) */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> ความหนาแน่นกำลังพลรายชั่วโมง (Hourly Staffing Density Heatmap)
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-950 border border-purple-500/40"></span> Night Band (20:00 - 08:00)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-sky-950 border border-sky-500/40"></span> Day Band (08:00 - 20:00)
                </span>
              </div>
            </div>

            {/* 24-Hour Column Grid */}
            <div className="grid grid-cols-24 gap-0.5 min-w-[720px] text-center">
              {density.slots.map(slot => {
                const isNight = isCircadianNightHour(slot.hour);
                let bgClass = "bg-slate-900 text-slate-400";
                if (slot.headcount === 0) bgClass = "bg-red-950/70 border border-red-500/50 text-red-400";
                else if (slot.headcount === 1) bgClass = "bg-amber-950/60 border border-amber-500/40 text-amber-300";
                else if (slot.headcount >= 3) bgClass = "bg-cyan-950/80 border border-cyan-500/40 text-cyan-300";
                else bgClass = "bg-slate-800 border border-slate-700 text-slate-200";

                return (
                  <div
                    key={slot.hour}
                    className={`p-1 rounded flex flex-col items-center justify-between transition-colors ${bgClass}`}
                    title={`เวลา ${slot.label}: ${slot.headcount} คน (${slot.employees.map(e => e.name).join(", ") || "ไม่มี"})`}
                  >
                    <span className="text-[10px] font-mono opacity-70">
                      {String(slot.hour).padStart(2, "0")}
                    </span>
                    <span className="text-xs font-bold font-mono my-0.5">
                      {slot.headcount}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isNight ? "bg-purple-400" : "bg-amber-400"}`}></span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Gantt Header (Hours 00:00 to 24:00) */}
          <div className="min-w-[720px] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
            <div className="flex items-center border-b border-slate-800 text-xs font-mono text-slate-400 bg-slate-950/80">
              <div className="w-56 px-3 py-2 border-r border-slate-800 font-sans font-semibold text-slate-300">
                พนักงาน / ตำแหน่ง
              </div>
              <div className="flex-1 grid grid-cols-24 text-center">
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={i}
                    className={`py-2 text-[10px] border-r border-slate-800/40 ${
                      isCircadianNightHour(i) ? "bg-purple-950/20 text-purple-300" : "bg-sky-950/20 text-sky-300"
                    }`}
                  >
                    {String(i).padStart(2, "0")}
                  </div>
                ))}
              </div>
            </div>

            {/* Employee Gantt Rows */}
            <div className="divide-y divide-slate-800/50">
              {filteredEmployees.map(emp => {
                const shiftCode = currentDayShifts[emp.id] || "O";
                const prevShiftCode = prevDayShifts[emp.id];
                const def = SHIFT_DEFINITIONS[shiftCode];
                const curSegments = getShiftCircadianSegments(shiftCode);
                const prevSegments = prevShiftCode ? getShiftCircadianSegments(prevShiftCode) : [];

                return (
                  <div
                    key={emp.id}
                    className="flex items-center hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Employee Identity Column */}
                    <div className="w-56 px-3 py-2.5 border-r border-slate-800 flex items-center justify-between">
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {emp.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {emp.role || "Operator"}
                        </div>
                      </div>
                      <div
                        onClick={() => onSelectCell && onSelectCell(emp.id, activeDay)}
                        className={`cursor-pointer px-2 py-0.5 text-xs font-mono font-bold rounded ${
                          shiftCode === "O" || shiftCode === "OFF"
                            ? "bg-slate-800 text-slate-400"
                            : "bg-cyan-950 text-cyan-300 border border-cyan-500/40"
                        }`}
                        title="คลิกเพื่อแก้ไขกะ"
                      >
                        {shiftCode}
                      </div>
                    </div>

                    {/* 24-Hour Gantt Timeline Canvas */}
                    <div className="flex-1 relative h-10 bg-slate-900/40 min-w-[500px]">
                      {/* Grid Column Guidelines */}
                      <div className="absolute inset-0 grid grid-cols-24 pointer-events-none">
                        {Array.from({ length: 24 }, (_, i) => (
                          <div
                            key={i}
                            className={`border-r border-slate-800/30 ${
                              isCircadianNightHour(i) ? "bg-purple-950/5" : ""
                            }`}
                          />
                        ))}
                      </div>

                      {/* Previous Day Carryover Segment (00:00 to endHour) */}
                      {prevSegments.map((seg, idx) => {
                        if (seg.dayOffset !== 1) return null;
                        const leftPct = 0;
                        const widthPct = (seg.endHour / 24) * 100;

                        return (
                          <div
                            key={`prev-${idx}`}
                            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                            className="absolute top-1.5 bottom-1.5 rounded bg-purple-600/80 border border-purple-400 shadow-sm flex items-center px-1.5 text-[10px] font-mono font-bold text-white truncate z-10"
                            title={`ต่อกะดึกจากเมื่อวาน: ${seg.shiftCode} (00:00 - ${String(seg.endHour).padStart(2, "0")}:00)`}
                          >
                            <span className="truncate flex items-center gap-1">
                              <CornerDownLeft className="w-3 h-3 inline shrink-0" />
                              <span>{seg.shiftCode} (ต่อกะดึก)</span>
                            </span>
                          </div>
                        );
                      })}

                      {/* Current Day Segments */}
                      {curSegments.map((seg, idx) => {
                        if (seg.dayOffset !== 0) return null;
                        const leftPct = (seg.startHour / 24) * 100;
                        const widthPct = ((seg.endHour - seg.startHour) / 24) * 100;
                        const bgColor = seg.color || "#06b6d4";

                        return (
                          <div
                            key={`cur-${idx}`}
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                              backgroundColor: `${bgColor}dd`,
                              borderColor: bgColor
                            }}
                            className="absolute top-1.5 bottom-1.5 rounded border shadow-md flex items-center justify-between px-2 text-[10px] font-mono font-bold text-white truncate z-10 transition-transform group-hover:scale-[1.01]"
                            title={`${def?.name || seg.shiftCode} (${seg.startHour}:00 - ${seg.endHour}:00) ${seg.otHours > 0 ? `• OT ${seg.otHours}h` : ""}`}
                          >
                            <span className="truncate">{seg.shiftCode}</span>
                            {seg.otHours > 0 && (
                              <span className="ml-1 px-1 py-0.2 bg-black/40 rounded text-[9px] font-bold">
                                +{seg.otHours}h
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coverage Warning Alerts */}
          {density.coverageWarnings.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 inline shrink-0" /> ข้อความแจ้งเตือนความคุ้มครองกำลังพล
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                {density.coverageWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
          <div>
            คลิกที่กล่องรหัสกะด้านซ้ายเพื่อแก้ไขกะพนักงานโดยตรง
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
