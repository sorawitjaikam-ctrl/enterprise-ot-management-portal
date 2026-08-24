import React, { useEffect, useRef } from "react";
import { X, Sparkles } from "lucide-react";
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
  { code: "M12", label: "M12", sub: "เช้า 12h (OT 4h)", hotkey: "M", color: "from-[#1d3ec7] to-[#0b1a3a]", ring: "ring-[#6d93fc]" },
  { code: "M8", label: "M8", sub: "เช้า 8h", hotkey: "M+", color: "from-[#1d3ec7]/80 to-[#0b1a3a]", ring: "ring-[#a9cdfc]" },
  { code: "M16", label: "M16", sub: "เช้าควบ 16h", hotkey: "M++", color: "from-[#0b1a3a] to-slate-950", ring: "ring-[#6d93fc]" },
  { code: "A8", label: "A8", sub: "บ่าย 8h", hotkey: "A", color: "from-[#1d3ec7]/80 to-[#0b1a3a]", ring: "ring-[#a9cdfc]" },
  { code: "A12", label: "A12", sub: "บ่าย 12h (OT 4h)", hotkey: "A+", color: "from-[#1d3ec7] to-[#0b1a3a]", ring: "ring-[#6d93fc]" },
  { code: "N12", label: "N12", sub: "ดึก 12h (OT 4h)", hotkey: "N", color: "from-[#1d3ec7] to-[#0b1a3a]", ring: "ring-[#6d93fc]" },
  { code: "N8", label: "N8", sub: "ดึก 8h", hotkey: "N+", color: "from-[#1d3ec7]/80 to-[#0b1a3a]", ring: "ring-[#a9cdfc]" },
  { code: "N16", label: "N16", sub: "ดึกควบ 16h", hotkey: "N++", color: "from-[#0b1a3a] to-slate-950", ring: "ring-[#6d93fc]" },
  { code: "D", label: "D", sub: "กลางวันปกติ", hotkey: "D", color: "from-slate-700 to-slate-800", ring: "ring-slate-400" },
  { code: "OND", label: "OND", sub: "วันหยุด (OT 8h)", hotkey: "H", color: "from-[#1d3ec7] to-[#1d3ec7]", ring: "ring-[#a9cdfc]" },
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
      className="fixed inset-0 z-50 pointer-events-none font-sans"
      data-testid="shift-radial-picker"
    >
      <div
        ref={containerRef}
        style={{ left: `${posX}px`, top: `${posY}px` }}
        className="pointer-events-auto absolute w-80 bg-[#0b1a3a]/95 border border-[#a9cdfc]/30 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl p-3.5 text-slate-100 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header telemetry */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
          <div className="truncate">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-[#6d93fc] animate-ping"></span>
              <span className="truncate">{employee.name}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              วันที่ {dayNumber} • กะปัจจุบัน: <span className="font-mono font-bold text-[#a9cdfc]">{currentShift || "O"}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 text-sm leading-none rounded hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Touch Smart Complementary Suggestion */}
        {recommendation && pairedEmployee && (
          <div className="mb-2.5 p-2 rounded-xl bg-blue-50/90 border border-blue-200 text-xs text-[#0b1a3a]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1d3ec7] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#1d3ec7]" /> แนะนำคู่กะอัตโนมัติ
              </span>
              <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                คู่กับ: {pairedEmployee.name} ({pairedShift})
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectShift(recommendation.suggestedCode);
                onClose();
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-[#1d3ec7] hover:bg-[#0b1a3a] text-white font-bold text-xs flex items-center justify-between shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>ใส่กะแนะนำ: {recommendation.suggestedCode}</span>
              <span className="px-1.5 py-0.5 rounded bg-black/30 text-[10px] font-mono">1-Touch Auto</span>
            </button>
            <p className="text-[10px] text-slate-600 mt-1 leading-tight font-medium">
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
                className={`relative p-2 rounded-xl text-left bg-gradient-to-b ${shift.color} hover:brightness-110 active:scale-95 transition-all border border-white/10 shadow-sm cursor-pointer ${
                  isSelected ? `ring-2 ${shift.ring} shadow-[#1d3ec7]/40` : ""
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
          <span className="text-[#a9cdfc]">Esc ปิด</span>
        </div>
      </div>
    </div>
  );
};
