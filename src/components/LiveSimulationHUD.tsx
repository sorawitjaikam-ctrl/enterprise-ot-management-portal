import React from "react";
import { Settings, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SimulationResult } from "../utils/costSimulationEngine";

interface LiveSimulationHUDProps {
  simulation: SimulationResult | null;
  activePaintShift?: string | null;
  onApply?: () => void;
  onCancel?: () => void;
  onSelectShift?: (shiftCode: string) => void;
}

export const LiveSimulationHUD: React.FC<LiveSimulationHUDProps> = ({
  simulation,
  activePaintShift,
  onApply,
  onCancel,
  onSelectShift
}) => {
  if (!simulation) return null;
  const paintedCount = simulation.paintedCellsCount ?? (simulation as any).totalCells ?? 0;
  if (paintedCount === 0) return null;

  const isExceeded = simulation.isBudgetExceeded;
  const violationsCount = (simulation.complianceViolations || (simulation as any).violations || []).length;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-4xl bg-white border border-[#DCE4EA] rounded shadow-md p-3 text-[#333B41] animate-in slide-in-from-bottom-3 duration-150 font-sans"
      data-testid="live-simulation-hud"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Telemetry Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-[#E8F3FA] border border-[#DCE4EA] text-[#0E3A66]">
            <Settings className="w-4 h-4 text-[#0E3A66]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E3A66]">
                จำลองค่าใช้จ่าย & ความสอดคล้อง
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#F3F6F8] text-[#59656D] border border-[#DCE4EA] rounded">
                {paintedCount} ช่องที่เลือก
              </span>
              {activePaintShift && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#0E3A66] text-white rounded">
                  กะที่เลือก: {activePaintShift}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs mt-0.5">
              <span className="text-[#59656D]">
                OT เพิ่ม:{" "}
                <strong className={`font-mono font-bold ${simulation.deltaOtHours >= 0 ? "text-[#0E3A66]" : "text-[#1E9C6E]"}`}>
                  {simulation.deltaOtHours >= 0 ? `+${simulation.deltaOtHours}` : simulation.deltaOtHours} ชม.
                </strong>
              </span>
              <span className="text-[#B4C1C9]">•</span>
              <span className="text-[#59656D]">
                ค่าใช้จ่าย OT:{" "}
                <strong className={`font-mono font-bold ${simulation.deltaCostThb >= 0 ? "text-[#0E3A66]" : "text-[#1E9C6E]"}`}>
                  {simulation.deltaCostThb >= 0 ? `+฿${simulation.deltaCostThb.toLocaleString()}` : `-฿${Math.abs(simulation.deltaCostThb).toLocaleString()}`}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Department Budget Meter */}
        <div className="hidden md:flex flex-col min-w-[180px] text-xs">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-[#6A7B87]">เพดานงบประมาณแผนก</span>
            <span className={`font-mono font-bold ${isExceeded ? "text-[#B3352C]" : "text-[#0E3A66]"}`}>
              {(simulation.budgetUtilizationPct ?? 0).toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#F3F6F8] rounded overflow-hidden border border-[#DCE4EA]">
            <div
              style={{ width: `${Math.min(100, simulation.budgetUtilizationPct ?? 0)}%` }}
              className={`h-full transition-all duration-200 ${
                isExceeded
                  ? "bg-[#B3352C]"
                  : (simulation.budgetUtilizationPct ?? 0) > 80
                  ? "bg-[#D99B14]"
                  : "bg-[#0E3A66]"
              }`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#6A7B87] mt-0.5">
            <span>รวม ฿{(simulation.newTotalCostThb ?? (simulation as any).simulatedMonthlyOtPay ?? 0).toLocaleString()}</span>
            <span>เพดาน ฿{(simulation.departmentBudgetLimit ?? (simulation as any).monthlyBudgetLimit ?? 150000).toLocaleString()}</span>
          </div>
        </div>

        {/* Right: Status & Action Buttons */}
        <div className="flex items-center gap-2">
          {violationsCount > 0 ? (
            <div
              className="px-2.5 py-1 rounded bg-[#FBEAEA] border border-[#F4B8B4] text-[#B3352C] text-xs font-semibold flex items-center gap-1.5"
              title={(simulation.complianceViolations || (simulation as any).violations || []).map((v: any) => v.reason).join("\n")}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#B3352C] shrink-0" />
              <span>พบข้อผิดพลาด ({violationsCount})</span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded bg-[#E8F6F0] border border-[#A5DCC5] text-[#1E9C6E] text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1E9C6E] shrink-0" />
              <span>ผ่านเกณฑ์กฎหมาย</span>
            </div>
          )}

          {/* Quick Shift Palette Selector */}
          {onSelectShift && (
            <div className="hidden sm:flex items-center gap-1 bg-[#F3F6F8] border border-[#DCE4EA] rounded p-0.5">
              {["M12", "N12", "M8", "A8", "D", "O", "OND"].map(code => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onSelectShift(code)}
                  className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-white hover:bg-[#E8F3FA] text-[#0E3A66] border border-[#DCE4EA] transition-colors cursor-pointer"
                >
                  {code}
                </button>
              ))}
            </div>
          )}

          {onApply && (
            <button
              type="button"
              onClick={onApply}
              className="px-3.5 py-1.5 rounded bg-[#0E3A66] hover:bg-[#17538F] text-white font-bold text-xs transition-colors cursor-pointer"
            >
              บันทึกกะ ({paintedCount})
            </button>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded bg-white hover:bg-[#F3F6F8] text-[#59656D] border border-[#DCE4EA] text-xs font-medium transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
