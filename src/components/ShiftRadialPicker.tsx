import React, { useEffect, useRef } from "react";
import { X, Sparkles } from "lucide-react";
import { Employee } from "../types";
import { getComplementaryShift } from "../utils/shiftRecommendation";

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
  { code: "M12", label: "M12", sub: "เช้า 12h (OT 4h)", hotkey: "M" },
  { code: "M8", label: "M8", sub: "เช้า 8h", hotkey: "M+" },
  { code: "M16", label: "M16", sub: "เช้าควบ 16h", hotkey: "M++" },
  { code: "A8", label: "A8", sub: "บ่าย 8h", hotkey: "A" },
  { code: "A12", label: "A12", sub: "บ่าย 12h (OT 4h)", hotkey: "A+" },
  { code: "N12", label: "N12", sub: "ดึก 12h (OT 4h)", hotkey: "N" },
  { code: "N8", label: "N8", sub: "ดึก 8h", hotkey: "N+" },
  { code: "N16", label: "N16", sub: "ดึกควบ 16h", hotkey: "N++" },
  { code: "D", label: "D", sub: "กลางวันปกติ", hotkey: "D" },
  { code: "OND", label: "OND", sub: "วันหยุด (OT 8h)", hotkey: "H" },
  { code: "O", label: "OFF", sub: "วันหยุดพัก", hotkey: "O" }
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
        className="pointer-events-auto absolute w-80 bg-white border border-[#DCE4EA] rounded shadow-md p-3 text-[#333B41] animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Header telemetry */}
        <div className="flex items-center justify-between border-b border-[#DCE4EA] pb-2 mb-2.5">
          <div className="truncate">
            <div className="text-xs font-bold text-[#0E3A66] flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E90CB]"></span>
              <span className="truncate">{employee.name}</span>
            </div>
            <div className="text-[11px] text-[#6A7B87]">
              วันที่ {dayNumber} • กะปัจจุบัน: <span className="font-mono font-bold text-[#0E3A66]">{currentShift || "O"}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6A7B87] hover:text-[#0E3A66] hover:bg-[#F3F6F8] p-1 rounded cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Touch Smart Complementary Suggestion */}
        {recommendation && pairedEmployee && (
          <div className="mb-2.5 p-2 rounded bg-[#E8F3FA] border border-[#9FCEE8] text-xs text-[#0E3A66]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E3A66] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#2E90CB]" /> แนะนำคู่กะอัตโนมัติ
              </span>
              <span className="text-[10px] text-[#59656D] truncate max-w-[120px]">
                คู่กับ: {pairedEmployee.name} ({pairedShift})
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectShift(recommendation.suggestedCode);
                onClose();
              }}
              className="w-full py-1.5 px-2.5 rounded bg-[#0E3A66] hover:bg-[#17538F] text-white font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>ใส่กะแนะนำ: {recommendation.suggestedCode}</span>
              <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono">1-Touch Auto</span>
            </button>
            <p className="text-[10px] text-[#59656D] mt-1 leading-tight font-medium">
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
                className={`relative p-2 rounded text-left transition-colors border cursor-pointer ${
                  isSelected 
                    ? "bg-[#E8F3FA] border-[#2E90CB] ring-1 ring-[#2E90CB] text-[#0E3A66]" 
                    : "bg-[#F3F6F8] hover:bg-[#E8F3FA] text-[#333B41] border-[#DCE4EA]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#0E3A66]">
                    {shift.label}
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-white border border-[#DCE4EA] rounded text-[#6A7B87]">
                    {shift.hotkey}
                  </span>
                </div>
                <div className="text-[10px] text-[#59656D] truncate leading-tight mt-0.5">
                  {shift.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* Hotkey hint footer */}
        <div className="mt-2.5 pt-2 border-t border-[#DCE4EA] flex items-center justify-between text-[10px] text-[#6A7B87]">
          <span>ปุ่มลัด: M, N, A, D, O, H</span>
          <span className="text-[#0E3A66] font-medium">Esc ปิด</span>
        </div>
      </div>
    </div>
  );
};
