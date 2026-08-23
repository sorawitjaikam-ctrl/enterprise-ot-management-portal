import React, { useEffect, useRef } from "react";
import { Employee } from "../types";
import { getComplementaryShift, SHIFT_DEFINITIONS } from "../utils/shiftRecommendation";

interface ShiftRadialPickerProps {
  isOpen: boolean;
  position: { x: number; y: number } | null;
  currentShift: string;
  employee: Employee;
  dayNumber: number;
  pairedEmployee?: Employee;
  pairedShift?: string;
  onSelectShift: (shiftCode: string) => void;
  onClose: () => void;
}

const PRIMARY_SHIFTS = [
  { code: "M12", label: "M12", sub: "เช้า 12h (OT 4h)", hotkey: "M", color: "from-cyan-600 to-sky-700", ring: "ring-cyan-400" },
  { code: "M8", label: "M8", sub: "เช้า 8h", hotkey: "M+", color: "from-sky-700 to-blue-800", ring: "ring-sky-400" },
  { code: "M16", label: "M16", sub: "เช้าควบ 16h", hotkey: "M++", color: "from-blue-900 to-indigo-950", ring: "ring-blue-500" },
  { code: "A8", label: "A8", sub: "บ่าย 8h", hotkey: "A", color: "from-amber-600 to-amber-700", ring: "ring-amber-400" },
  { code: "A12", label: "A12", sub: "บ่าย 12h (OT 4h)", hotkey: "A+", color: "from-amber-700 to-orange-800", ring: "ring-orange-400" },
  { code: "N12", label: "N12", sub: "ดึก 12h (OT 4h)", hotkey: "N", color: "from-pink-600 to-rose-700", ring: "ring-pink-400" },
  { code: "N8", label: "N8", sub: "ดึก 8h", hotkey: "N+", color: "from-purple-700 to-indigo-800", ring: "ring-purple-400" },
  { code: "N16", label: "N16", sub: "ดึกควบ 16h", hotkey: "N++", color: "from-rose-800 to-red-950", ring: "ring-red-500" },
  { code: "D", label: "D", sub: "กลางวันปกติ", hotkey: "D", color: "from-slate-600 to-slate-700", ring: "ring-slate-400" },
  { code: "OND", label: "OND", sub: "วันหยุด (OT 8h)", hotkey: "H", color: "from-emerald-600 to-teal-700", ring: "ring-emerald-400" },
  { code: "O", label: "OFF", sub: "วันหยุดพัก", hotkey: "O", color: "from-slate-800 to-slate-900", ring: "ring-slate-500" }
];

export const ShiftRadialPicker: React.FC<ShiftRadialPickerProps> = ({
  isOpen,
  position,
  currentShift,
  employee,
  dayNumber,
  pairedEmployee,
  pairedShift,
  onSelectShift,
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate complementary suggestion
  const recommendation = pairedShift ? getComplementaryShift(pairedShift) : null;

  // Position styles: clamp within viewport
  const posX = Math.max(10, Math.min(window.innerWidth - 340, (position?.x || window.innerWidth / 2) - 160));
  const posY = Math.max(10, Math.min(window.innerHeight - 440, (position?.y || window.innerHeight / 2) - 200));

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      data-testid="shift-radial-picker"
    >
      <div
        ref={containerRef}
        style={{ left: `${posX}px`, top: `${posY}px` }}
        className="pointer-events-auto absolute w-80 bg-slate-950/95 border border-cyan-500/40 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl p-3.5 text-slate-100 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header telemetry */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
          <div className="truncate">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="truncate">{employee.name}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              วันที่ {dayNumber} • กะปัจจุบัน: <span className="font-mono font-bold text-cyan-400">{currentShift || "O"}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 text-sm leading-none rounded hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* 1-Touch Smart Complementary Suggestion */}
        {recommendation && pairedEmployee && (
          <div className="mb-2.5 p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                ⚡ แนะนำคู่กะอัตโนมัติ
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                คู่กับ: {pairedEmployee.name} ({pairedShift})
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectShift(recommendation.suggestedCode);
                onClose();
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs flex items-center justify-between shadow-md active:scale-[0.98] transition-all"
            >
              <span>ใส่กะแนะนำ: {recommendation.suggestedCode}</span>
              <span className="px-1.5 py-0.5 rounded bg-black/30 text-[10px] font-mono">1-Touch ⚡</span>
            </button>
            <p className="text-[10px] text-slate-300 mt-1 leading-tight">
              {recommendation.rationale}
            </p>
          </div>
        )}

        {/* Tactile Shift Buttons Grid */}
        <div className="grid grid-cols-3 gap-1.5">
          {PRIMARY_SHIFTS.map(shift => {
            const isSelected = currentShift === shift.code;
            return (
              <button
                key={shift.code}
                type="button"
                onClick={() => {
                  onSelectShift(shift.code);
                  onClose();
                }}
                className={`relative p-2 rounded-xl text-left bg-gradient-to-b ${shift.color} hover:brightness-110 active:scale-95 transition-all border border-white/10 shadow-sm ${
                  isSelected ? `ring-2 ${shift.ring} shadow-cyan-500/20` : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-sm text-white">
                    {shift.label}
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-black/40 rounded text-slate-300">
                    {shift.hotkey}
                  </span>
                </div>
                <div className="text-[10px] text-white/80 truncate leading-tight mt-0.5">
                  {shift.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* Hotkey hint footer */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>กดปุ่มลัด: M, N, A, D, O, H</span>
          <span className="text-cyan-400">Esc ปิด</span>
        </div>
      </div>
    </div>
  );
};
