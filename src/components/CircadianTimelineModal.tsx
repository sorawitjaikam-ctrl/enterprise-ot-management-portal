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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E3A66]/40 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      data-testid="circadian-timeline-modal"
    >
      <div className="relative w-full max-w-7xl max-h-[92vh] flex flex-col bg-white border border-[#DCE4EA] rounded shadow-lg overflow-hidden text-[#333B41] font-sans">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-white border-b border-[#DCE4EA]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded bg-[#E8F3FA] border border-[#DCE4EA] text-[#0E3A66]">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#0E3A66] tracking-tight uppercase">
                  24-Hour Circadian Timeline Matrix
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#E8F3FA] text-[#0E3A66] border border-[#DCE4EA] rounded">
                  GANTT 24H
                </span>
              </div>
              <p className="text-xs text-[#59656D]">
                {departmentName} • ตารางความครอบคลุมกำลังพล 24 ชั่วโมง
              </p>
            </div>
          </div>

          {/* Date Selector & Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#F3F6F8] border border-[#DCE4EA] rounded p-1">
              <button
                type="button"
                onClick={() => setSelectedDay(d => Math.max(1, d - 1))}
                disabled={activeDay <= 1}
                className="p-1 rounded hover:bg-[#E8F3FA] disabled:opacity-30 disabled:cursor-not-allowed text-[#333B41] flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 text-center">
                <div className="text-xs font-mono font-bold text-[#0E3A66]">
                  {dateStr}
                </div>
                <div className="text-[11px] text-[#6A7B87]">
                  วัน{dayNameTh} (วันที่ {activeDay})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(d => Math.min(totalDays, d + 1))}
                disabled={activeDay >= totalDays}
                className="p-1 rounded hover:bg-[#E8F3FA] disabled:opacity-30 disabled:cursor-not-allowed text-[#333B41] flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Day Dropdown */}
            <select
              value={activeDay}
              onChange={e => setSelectedDay(Number(e.target.value))}
              className="bg-white border border-[#DCE4EA] rounded px-2.5 py-1.5 text-xs font-mono text-[#333B41] focus:outline-none focus:border-[#2E90CB] cursor-pointer"
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
                className="bg-white border border-[#DCE4EA] rounded px-2.5 py-1.5 text-xs text-[#333B41] focus:outline-none focus:border-[#2E90CB] cursor-pointer"
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
              className="p-1.5 rounded text-[#6A7B87] hover:text-[#0E3A66] hover:bg-[#F3F6F8] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Circadian Telemetry Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 p-3 bg-[#F3F6F8] border-b border-[#DCE4EA] text-xs">
          <div className="p-2.5 rounded bg-white border border-[#DCE4EA]">
            <span className="text-[#6A7B87] block text-[11px] font-medium">พนักงานปฏิบัติงาน</span>
            <span className="text-base font-bold font-mono text-[#0E3A66]">
              {density.totalActiveStaff} <span className="text-xs font-normal text-[#6A7B87]">/ {filteredEmployees.length} คน</span>
            </span>
          </div>
          <div className="p-2.5 rounded bg-white border border-[#DCE4EA]">
            <span className="text-[#6A7B87] block text-[11px] font-medium">ช่วงกะเช้า (07-15)</span>
            <span className="text-base font-bold font-mono text-[#0E3A66]">
              {density.morningAverage} <span className="text-xs font-normal text-[#6A7B87]">คน/ชม.</span>
            </span>
          </div>
          <div className="p-2.5 rounded bg-white border border-[#DCE4EA]">
            <span className="text-[#6A7B87] block text-[11px] font-medium">ช่วงกะบ่าย (15-23)</span>
            <span className="text-base font-bold font-mono text-[#0E3A66]">
              {density.afternoonAverage} <span className="text-xs font-normal text-[#6A7B87]">คน/ชม.</span>
            </span>
          </div>
          <div className="p-2.5 rounded bg-white border border-[#DCE4EA]">
            <span className="text-[#6A7B87] block text-[11px] font-medium">ช่วงกะดึก (23-07)</span>
            <span className="text-base font-bold font-mono text-[#17538F]">
              {density.nightAverage} <span className="text-xs font-normal text-[#6A7B87]">คน/ชม.</span>
            </span>
          </div>
          <div className="p-2.5 rounded bg-white border border-[#DCE4EA]">
            <span className="text-[#6A7B87] block text-[11px] font-medium">กำลังพลสูงสุด (Peak)</span>
            <span className="text-base font-bold font-mono text-[#0E3A66]">
              {density.slots[density.peakHour]?.headcount || 0} คน <span className="text-[10px] font-normal text-[#6A7B87]">({String(density.peakHour).padStart(2, "0")}:00)</span>
            </span>
          </div>
          <div className="p-2.5 rounded bg-white border border-[#DCE4EA]">
            <span className="text-[#6A7B87] block text-[11px] font-medium">สถานะความปลอดภัย</span>
            <span className={`text-xs font-bold inline-flex items-center gap-1 ${density.coverageWarnings.length === 0 ? "text-[#1E9C6E]" : "text-[#D99B14]"}`}>
              {density.coverageWarnings.length === 0 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1E9C6E]" />
                  <span>ครอบคลุม 100%</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D99B14]" />
                  <span>เตือน ({density.coverageWarnings.length})</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Main Gantt Timeline Matrix Area */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 space-y-4 bg-[#F3F6F8]">
          {/* Circadian Heatmap Bar (00:00 to 23:00) */}
          <div className="bg-white p-3 rounded border border-[#DCE4EA]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0E3A66] uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#2E90CB]" /> ความหนาแน่นกำลังพลรายชั่วโมง (Hourly Staffing Density)
              </span>
              <div className="flex items-center gap-3 text-[11px] text-[#6A7B87]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#E8F3FA] border border-[#9FCEE8]"></span> กะดึก (20:00 - 08:00)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#FCF3DE] border border-[#F3D98F]"></span> กะกลางวัน (08:00 - 20:00)
                </span>
              </div>
            </div>

            {/* 24-Hour Column Grid */}
            <div className="grid grid-cols-24 gap-0.5 min-w-[720px] text-center">
              {density.slots.map(slot => {
                const isNight = isCircadianNightHour(slot.hour);
                let bgClass = "bg-[#F3F6F8] text-[#59656D] border border-[#DCE4EA]";
                if (slot.headcount === 0) bgClass = "bg-[#FBEAEA] border border-[#F4B8B4] text-[#B3352C]";
                else if (slot.headcount === 1) bgClass = "bg-[#FCF3DE] border border-[#F3D98F] text-[#D99B14]";
                else if (slot.headcount >= 3) bgClass = "bg-[#E8F3FA] border border-[#9FCEE8] text-[#0E3A66]";
                else bgClass = "bg-[#F3F6F8] border border-[#DCE4EA] text-[#333B41]";

                return (
                  <div
                    key={slot.hour}
                    className={`p-1 rounded flex flex-col items-center justify-between transition-colors ${bgClass}`}
                    title={`เวลา ${slot.label}: ${slot.headcount} คน (${slot.employees.map(e => e.name).join(", ") || "ไม่มี"})`}
                  >
                    <span className="text-[10px] font-mono opacity-75">
                      {String(slot.hour).padStart(2, "0")}
                    </span>
                    <span className="text-xs font-bold font-mono my-0.5">
                      {slot.headcount}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isNight ? "bg-[#17538F]" : "bg-[#D99B14]"}`}></span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Gantt Header (Hours 00:00 to 24:00) */}
          <div className="min-w-[720px] bg-white rounded border border-[#DCE4EA] overflow-hidden">
            <div className="flex items-center border-b border-[#DCE4EA] text-xs font-mono text-[#6A7B87] bg-[#F3F6F8]">
              <div className="w-56 px-3 py-2 border-r border-[#DCE4EA] font-sans font-bold text-[#0E3A66] text-[11px] uppercase tracking-wider">
                พนักงาน / ตำแหน่ง
              </div>
              <div className="flex-1 grid grid-cols-24 text-center">
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={i}
                    className={`py-2 text-[10px] border-r border-[#DCE4EA] ${
                      isCircadianNightHour(i) ? "bg-[#E8F3FA]/50 text-[#17538F] font-bold" : "text-[#59656D]"
                    }`}
                  >
                    {String(i).padStart(2, "0")}
                  </div>
                ))}
              </div>
            </div>

            {/* Employee Gantt Rows */}
            <div className="divide-y divide-[#DCE4EA]">
              {filteredEmployees.map(emp => {
                const shiftCode = currentDayShifts[emp.id] || "O";
                const prevShiftCode = prevDayShifts[emp.id];
                const def = SHIFT_DEFINITIONS[shiftCode];
                const curSegments = getShiftCircadianSegments(shiftCode);
                const prevSegments = prevShiftCode ? getShiftCircadianSegments(prevShiftCode) : [];

                return (
                  <div
                    key={emp.id}
                    className="flex items-center hover:bg-[#E8F3FA]/40 transition-colors group"
                  >
                    {/* Employee Identity Column */}
                    <div className="w-56 px-3 py-2 border-r border-[#DCE4EA] flex items-center justify-between">
                      <div className="truncate">
                        <div className="text-xs font-medium text-[#333B41] truncate">
                          {emp.name}
                        </div>
                        <div className="text-[11px] text-[#6A7B87] truncate">
                          {emp.role || "Operator"}
                        </div>
                      </div>
                      <div
                        onClick={() => onSelectCell && onSelectCell(emp.id, activeDay)}
                        className={`cursor-pointer px-2 py-0.5 text-xs font-mono font-bold rounded border transition-colors ${
                          shiftCode === "O" || shiftCode === "OFF"
                            ? "bg-[#F3F6F8] text-[#6A7B87] border-[#DCE4EA] hover:bg-[#E8F3FA]"
                            : "bg-[#E8F3FA] text-[#0E3A66] border-[#9FCEE8] hover:bg-[#0E3A66] hover:text-white"
                        }`}
                        title="คลิกเพื่อแก้ไขกะ"
                      >
                        {shiftCode}
                      </div>
                    </div>

                    {/* 24-Hour Gantt Timeline Canvas */}
                    <div className="flex-1 relative h-9 bg-white min-w-[500px]">
                      {/* Grid Column Guidelines */}
                      <div className="absolute inset-0 grid grid-cols-24 pointer-events-none">
                        {Array.from({ length: 24 }, (_, i) => (
                          <div
                            key={i}
                            className={`border-r border-[#DCE4EA]/60 ${
                              isCircadianNightHour(i) ? "bg-[#E8F3FA]/20" : ""
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
                            className="absolute top-1 bottom-1 rounded bg-[#17538F] border border-[#0E3A66] flex items-center px-1.5 text-[10px] font-mono font-bold text-white truncate z-10"
                            title={`ต่อกะดึกจากเมื่อวาน: ${seg.shiftCode} (00:00 - ${String(seg.endHour).padStart(2, "0")}:00)`}
                          >
                            <span className="truncate flex items-center gap-1">
                              <CornerDownLeft className="w-3 h-3 inline shrink-0" />
                              <span>{seg.shiftCode} (ต่อกะ)</span>
                            </span>
                          </div>
                        );
                      })}

                      {/* Current Day Segments */}
                      {curSegments.map((seg, idx) => {
                        if (seg.dayOffset !== 0) return null;
                        const leftPct = (seg.startHour / 24) * 100;
                        const widthPct = ((seg.endHour - seg.startHour) / 24) * 100;
                        
                        // Pick clean minimal color token
                        let barBg = "bg-[#0E3A66]";
                        let barBorder = "border-[#0E3A66]";
                        if (seg.shiftCode.startsWith("M12") || seg.shiftCode.startsWith("N12") || seg.shiftCode.startsWith("A12")) {
                          barBg = "bg-[#17538F]";
                          barBorder = "border-[#0E3A66]";
                        } else if (seg.shiftCode === "D") {
                          barBg = "bg-[#1E9C6E]";
                          barBorder = "border-[#1E9C6E]";
                        } else if (seg.shiftCode.startsWith("M16") || seg.shiftCode.startsWith("N16")) {
                          barBg = "bg-[#0E3A66]";
                          barBorder = "border-[#0E3A66]";
                        } else {
                          barBg = "bg-[#2E90CB]";
                          barBorder = "border-[#17538F]";
                        }

                        return (
                          <div
                            key={`cur-${idx}`}
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`
                            }}
                            className={`absolute top-1 bottom-1 rounded ${barBg} border ${barBorder} flex items-center justify-between px-2 text-[10px] font-mono font-bold text-white truncate z-10`}
                            title={`${def?.name || seg.shiftCode} (${seg.startHour}:00 - ${seg.endHour}:00) ${seg.otHours > 0 ? `• OT ${seg.otHours}h` : ""}`}
                          >
                            <span className="truncate">{seg.shiftCode}</span>
                            {seg.otHours > 0 && (
                              <span className="ml-1 px-1 py-0.2 bg-black/25 rounded text-[9px] font-mono">
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
            <div className="p-3 rounded bg-[#FCF3DE] border border-[#F3D98F] text-[#D99B14] text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-[#D99B14]">
                <AlertTriangle className="w-4 h-4 inline shrink-0" /> ข้อความแจ้งเตือนความครอบคลุมกำลังพล
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[#59656D] text-[11px]">
                {density.coverageWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#F3F6F8] border-t border-[#DCE4EA] text-xs text-[#59656D]">
          <div>
            คลิกที่กล่องรหัสกะด้านซ้ายเพื่อแก้ไขกะพนักงานโดยตรง
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded bg-[#0E3A66] hover:bg-[#17538F] text-white font-bold text-xs transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
