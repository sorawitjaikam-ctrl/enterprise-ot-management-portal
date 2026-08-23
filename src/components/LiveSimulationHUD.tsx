import React from "react";
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
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-4xl bg-slate-950/95 border border-cyan-500/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl p-3.5 text-slate-100 animate-in slide-in-from-bottom-5 duration-200"
      data-testid="live-simulation-hud"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Telemetry Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <span className="animate-spin text-lg">⚙️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Live Cost & Compliance Simulator
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 rounded-full">
                {paintedCount} ช่องที่เลือก
              </span>
              {activePaintShift && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-extrabold bg-blue-600 text-white rounded">
                  กะที่เลือก: {activePaintShift}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs mt-0.5">
              <span className="text-slate-300">
                OT เพิ่ม:{" "}
                <strong className={`font-mono ${simulation.deltaOtHours >= 0 ? "text-cyan-400" : "text-emerald-400"}`}>
                  {simulation.deltaOtHours >= 0 ? `+${simulation.deltaOtHours}` : simulation.deltaOtHours} ชม.
                </strong>
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300">
                ค่าใช้จ่าย OT:{" "}
                <strong className={`font-mono ${simulation.deltaCostThb >= 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {simulation.deltaCostThb >= 0 ? `+฿${simulation.deltaCostThb.toLocaleString()}` : `-฿${Math.abs(simulation.deltaCostThb).toLocaleString()}`}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Department 150k Budget Meter */}
        <div className="hidden md:flex flex-col min-w-[200px] text-xs">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400">เพดานงบประมาณแผนก (150,000)</span>
            <span className={`font-mono font-bold ${isExceeded ? "text-red-400" : "text-slate-200"}`}>
              {(simulation.budgetUtilizationPct ?? 0).toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              style={{ width: `${Math.min(100, simulation.budgetUtilizationPct ?? 0)}%` }}
              className={`h-full transition-all duration-300 ${
                isExceeded
                  ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  : (simulation.budgetUtilizationPct ?? 0) > 80
                  ? "bg-amber-400"
                  : "bg-gradient-to-r from-cyan-500 to-sky-400"
              }`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
            <span>รวม ฿{(simulation.newTotalCostThb ?? (simulation as any).simulatedMonthlyOtPay ?? 0).toLocaleString()}</span>
            <span>เพดาน ฿{(simulation.departmentBudgetLimit ?? (simulation as any).monthlyBudgetLimit ?? 150000).toLocaleString()}</span>
          </div>
        </div>

        {/* Right: Status & Action Buttons */}
        <div className="flex items-center gap-2">
          {violationsCount > 0 ? (
            <div
              className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-semibold flex items-center gap-1.5"
              title={(simulation.complianceViolations || (simulation as any).violations || []).map((v: any) => v.reason).join("\n")}
            >
              <span>⚠️</span>
              <span>พบข้อผิดพลาด ({violationsCount})</span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1">
              <span>🟢</span>
              <span>ผ่านเกณฑ์กฎหมาย</span>
            </div>
          )}

          {/* Quick Shift Palette Selector (when range selected without pre-selected brush) */}
          {onSelectShift && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
              {["M12", "N12", "M8", "A8", "D", "O", "OND"].map(code => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onSelectShift(code)}
                  className="px-2 py-1 text-xs font-mono font-bold rounded bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white transition-colors"
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
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              บันทึกกะ ({paintedCount})
            </button>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              ยกเลิก
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
