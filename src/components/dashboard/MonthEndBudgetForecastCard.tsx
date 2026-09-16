import React from "react";
import { TrendingUp, TrendingDown, AlertCircle, Calendar, DollarSign, Activity } from "lucide-react";
import { ExecutiveMonthEndForecastSummary } from "../../utils/budgetForecastEngine";

export interface MonthEndBudgetForecastCardProps {
  summary: ExecutiveMonthEndForecastSummary;
}

export default function MonthEndBudgetForecastCard({ summary }: MonthEndBudgetForecastCardProps) {
  const {
    monthKey,
    asOfDay,
    totalDays,
    elapsedPct,
    totalTargetBudgetThb,
    totalActualSpendToDateThb,
    totalDailyBurnRateThb,
    totalProjectedMonthEndSpendThb,
    totalProjectedVarianceThb,
    totalProjectedBurnRatePct,
    criticalDeptsCount,
    warningDeptsCount,
    onTrackDeptsCount,
    departments
  } = summary;

  // SVG Chart Trajectory Coordinates
  const chartW = 500;
  const chartH = 140;
  const padL = 45;
  const padR = 25;
  const padT = 15;
  const padB = 25;

  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const maxVal = Math.max(
    totalTargetBudgetThb,
    totalProjectedMonthEndSpendThb,
    totalActualSpendToDateThb,
    1
  ) * 1.15;

  const getX = (day: number) => padL + (day / totalDays) * plotW;
  const getY = (val: number) => padT + plotH - (val / maxVal) * plotH;

  // Target Pacing line: (0, 0) to (totalDays, totalTargetBudgetThb)
  const targetX1 = getX(0);
  const targetY1 = getY(0);
  const targetX2 = getX(totalDays);
  const targetY2 = getY(totalTargetBudgetThb);

  // Actual Spend point: (asOfDay, totalActualSpendToDateThb)
  const actualX = getX(asOfDay);
  const actualY = getY(totalActualSpendToDateThb);

  // Projected Month-End point: (totalDays, totalProjectedMonthEndSpendThb)
  const projX = getX(totalDays);
  const projY = getY(totalProjectedMonthEndSpendThb);

  // Depletion point if any
  const earliestDepletionDay = departments
    .filter(d => d.estimatedDepletionDay !== null)
    .map(d => d.estimatedDepletionDay as number)
    .sort((a, b) => a - b)[0] || null;

  const isOverBudget = totalProjectedVarianceThb > 0;

  return (
    <div className="bg-white border border-[#DCE4EA] rounded p-4 sm:p-5 shadow-maritime-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <span className="eyebrow">การคาดการณ์และอัตราเบิกจ่ายงบประมาณ</span>
          <h2 className="text-base sm:text-lg font-bold text-[#0E3A66] tracking-tight">
            การคาดการณ์งบประมาณสิ้นเดือนและ Burn Rate
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#59656D] bg-[#F3F6F8] px-2.5 py-1 rounded border border-[#DCE4EA]">
            รอบเดือน: {monthKey} (วันที่ {asOfDay}/{totalDays})
          </span>
        </div>
      </div>

      {/* KPI Velocity Bento Sub-grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Projected Total Spend */}
        <div className="bg-[#F3F6F8] border border-[#DCE4EA] p-3.5 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#59656D] uppercase tracking-wider">
              คาดการณ์สิ้นเดือน
            </span>
            <DollarSign className="w-3.5 h-3.5 text-[#0E3A66]" />
          </div>
          <div className="mt-1.5">
            <div className="text-xl sm:text-2xl font-black text-[#0E3A66] font-mono tabular-nums">
              ฿{totalProjectedMonthEndSpendThb.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-[#6A7B87]">งบจัดสรร ฿{totalTargetBudgetThb.toLocaleString()}</span>
              <span className={`font-bold ${isOverBudget ? "text-[#B3352C]" : "text-[#1E9C6E]"}`}>
                {totalProjectedBurnRatePct}%
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Daily Burn Velocity */}
        <div className="bg-[#F3F6F8] border border-[#DCE4EA] p-3.5 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#59656D] uppercase tracking-wider">
              อัตราการเผางบต่อวัน
            </span>
            <Activity className="w-3.5 h-3.5 text-[#2E90CB]" />
          </div>
          <div className="mt-1.5">
            <div className="text-xl sm:text-2xl font-black text-[#0E3A66] font-mono tabular-nums">
              ฿{Math.round(totalDailyBurnRateThb).toLocaleString()}/วัน
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-[#6A7B87]">ใช้จริงสะสม</span>
              <span className="font-bold text-[#0E3A66] font-mono">
                ฿{totalActualSpendToDateThb.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Projected Variance */}
        <div className="bg-[#F3F6F8] border border-[#DCE4EA] p-3.5 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#59656D] uppercase tracking-wider">
              ผลต่างการคาดการณ์ (ΔTHB)
            </span>
            {isOverBudget ? (
              <TrendingUp className="w-3.5 h-3.5 text-[#B3352C]" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-[#1E9C6E]" />
            )}
          </div>
          <div className="mt-1.5">
            <div
              className={`text-xl sm:text-2xl font-black font-mono tabular-nums ${
                isOverBudget ? "text-[#B3352C]" : "text-[#1E9C6E]"
              }`}
            >
              {totalProjectedVarianceThb > 0 ? "+" : ""}
              ฿{totalProjectedVarianceThb.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-[#6A7B87]">สถานะภาพรวม</span>
              <span
                className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                  isOverBudget
                    ? "bg-[#FBEAEA] text-[#B3352C]"
                    : "bg-[#E8F6F0] text-[#1E9C6E]"
                }`}
              >
                {isOverBudget ? "เสี่ยงเกินงบ" : "อยู่ในเกณฑ์"}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Department Risk Distribution */}
        <div className="bg-[#F3F6F8] border border-[#DCE4EA] p-3.5 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#59656D] uppercase tracking-wider">
              การกระจายสถานะแผนก
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-[#D99B14]" />
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-1">
            <div className="text-center flex-1 bg-white p-1 rounded border border-[#DCE4EA]">
              <div className="text-xs text-[#59656D] font-medium">ปกติ</div>
              <div className="text-base font-bold text-[#1E9C6E] font-mono">{onTrackDeptsCount}</div>
            </div>
            <div className="text-center flex-1 bg-white p-1 rounded border border-[#DCE4EA]">
              <div className="text-xs text-[#59656D] font-medium">เตือน</div>
              <div className="text-base font-bold text-[#D99B14] font-mono">{warningDeptsCount}</div>
            </div>
            <div className="text-center flex-1 bg-white p-1 rounded border border-[#DCE4EA]">
              <div className="text-xs text-[#59656D] font-medium">วิกฤต</div>
              <div className="text-base font-bold text-[#B3352C] font-mono">{criticalDeptsCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trajectory Visualizer */}
      <div className="bg-[#F3F6F8] border border-[#DCE4EA] rounded p-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
          <div className="text-xs font-bold text-[#0E3A66]">
            เส้นทางวิถีงบประมาณ: อัตราเบิกจ่ายจริงเทียบกับเกณฑ์มาตรฐาน (Trajectory Line)
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#59656D]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#2E90CB] inline-block"></span>
              <span>เกณฑ์มาตรฐาน (Pacing Target)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#0E3A66] inline-block"></span>
              <span>ใช้จริง (Actual)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#B3352C] border-b border-dashed border-[#B3352C] inline-block"></span>
              <span>คาดการณ์สิ้นเดือน (Projected)</span>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="w-full h-36 min-w-[420px] select-none"
          >
            {/* Grid lines */}
            <line x1={padL} y1={padT} x2={padL + plotW} y2={padT} stroke="#DCE4EA" strokeWidth="1" />
            <line x1={padL} y1={padT + plotH / 2} x2={padL + plotW} y2={padT + plotH / 2} stroke="#DCE4EA" strokeWidth="1" />
            <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#DCE4EA" strokeWidth="1" />

            {/* Y-axis labels */}
            <text x={padL - 6} y={padT + 4} textAnchor="end" fontSize="9" fill="#6A7B87" className="font-mono">
              ฿{Math.round(maxVal / 1000)}k
            </text>
            <text x={padL - 6} y={padT + plotH / 2 + 3} textAnchor="end" fontSize="9" fill="#6A7B87" className="font-mono">
              ฿{Math.round(maxVal / 2000)}k
            </text>
            <text x={padL - 6} y={padT + plotH + 2} textAnchor="end" fontSize="9" fill="#6A7B87" className="font-mono">
              ฿0
            </text>

            {/* Target Pacing Line */}
            <line
              x1={targetX1}
              y1={targetY1}
              x2={targetX2}
              y2={targetY2}
              stroke="#2E90CB"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Actual Spend Line */}
            <line
              x1={targetX1}
              y1={targetY1}
              x2={actualX}
              y2={actualY}
              stroke="#0E3A66"
              strokeWidth="2.5"
            />
            <circle cx={actualX} cy={actualY} r="4" fill="#0E3A66" stroke="#ffffff" strokeWidth="1.5" />

            {/* Projected Trajectory Line */}
            <line
              x1={actualX}
              y1={actualY}
              x2={projX}
              y2={projY}
              stroke={isOverBudget ? "#B3352C" : "#1E9C6E"}
              strokeWidth="2"
              strokeDasharray="3 3"
            />
            <circle
              cx={projX}
              cy={projY}
              r="4"
              fill={isOverBudget ? "#B3352C" : "#1E9C6E"}
              stroke="#ffffff"
              strokeWidth="1.5"
            />

            {/* Depletion Marker if early */}
            {earliestDepletionDay && (
              <g>
                <line
                  x1={getX(earliestDepletionDay)}
                  y1={padT}
                  x2={getX(earliestDepletionDay)}
                  y2={padT + plotH}
                  stroke="#B3352C"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={getX(earliestDepletionDay)}
                  cy={getY(totalTargetBudgetThb)}
                  r="3.5"
                  fill="#B3352C"
                />
                <text
                  x={getX(earliestDepletionDay)}
                  y={padT - 2}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="bold"
                  fill="#B3352C"
                >
                  จุดงบหมด (วันที่ {earliestDepletionDay})
                </text>
              </g>
            )}

            {/* X-axis ticks */}
            <text x={getX(1)} y={chartH - 8} textAnchor="middle" fontSize="9" fill="#6A7B87" className="font-mono">
              ว.1
            </text>
            <text x={getX(10)} y={chartH - 8} textAnchor="middle" fontSize="9" fill="#6A7B87" className="font-mono">
              ว.10
            </text>
            <text x={getX(20)} y={chartH - 8} textAnchor="middle" fontSize="9" fill="#6A7B87" className="font-mono">
              ว.20
            </text>
            <text x={getX(totalDays)} y={chartH - 8} textAnchor="middle" fontSize="9" fill="#6A7B87" className="font-mono">
              ว.{totalDays}
            </text>
          </svg>
        </div>

        {/* Elapsed Bar */}
        <div className="mt-2 pt-2 border-t border-[#DCE4EA] flex items-center justify-between text-xs text-[#59656D]">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#0E3A66]" />
            <span>ความคืบหน้าของเดือน: {elapsedPct}% ({asOfDay} จาก {totalDays} วัน)</span>
          </div>
          <div className="w-32 bg-white h-2 rounded-full overflow-hidden border border-[#DCE4EA]">
            <div
              style={{ width: `${elapsedPct}%` }}
              className="bg-[#0E3A66] h-full rounded-full transition-all"
            />
          </div>
        </div>
      </div>

      {/* Department Ranking Table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-[#0E3A66] uppercase tracking-wider">
            ตารางจัดอันดับการเบิกจ่ายและคาดการณ์รายแผนก (Department Burn Ranking)
          </h3>
          <span className="text-[11px] text-[#6A7B87]">
            เรียงตามอัตราการเบิกจ่ายงบประมาณ (Burn Rate %)
          </span>
        </div>

        <div className="overflow-x-auto border border-[#DCE4EA] rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F3F6F8] text-[#0E3A66] font-bold border-b border-[#DCE4EA]">
                <th className="py-2.5 px-3 whitespace-nowrap">แผนก</th>
                <th className="py-2.5 px-3 whitespace-nowrap">บุคลากร</th>
                <th className="py-2.5 px-3 whitespace-nowrap">งบจัดสรร</th>
                <th className="py-2.5 px-3 whitespace-nowrap">ใช้จริงสะสม</th>
                <th className="py-2.5 px-3 whitespace-nowrap">อัตราเผางบ</th>
                <th className="py-2.5 px-3 whitespace-nowrap">คาดการณ์สิ้นเดือน</th>
                <th className="py-2.5 px-3 whitespace-nowrap">ผลต่าง (ΔTHB / Δ%)</th>
                <th className="py-2.5 px-3 whitespace-nowrap">วันงบหมด</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EA] bg-white">
              {departments
                .slice()
                .sort((a, b) => b.projectedBurnRatePct - a.projectedBurnRatePct)
                .map(dept => {
                  const isDeptOver = dept.projectedVarianceThb > 0;
                  return (
                    <tr key={dept.deptId} className="hover:bg-[#F3F6F8]/60 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[#0E3A66]">
                        {dept.deptNameTh || dept.deptName}
                      </td>
                      <td className="py-2.5 px-3 text-[#59656D] font-mono">
                        {dept.employeeCount} คน
                      </td>
                      <td className="py-2.5 px-3 text-[#59656D] font-mono">
                        ฿{dept.targetBudgetThb.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#0E3A66] font-mono">
                        ฿{dept.actualSpendToDateThb.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-[#59656D] font-mono">
                        ฿{Math.round(dept.dailySpendBurnRateThb).toLocaleString()}/วัน
                      </td>
                      <td className="py-2.5 px-3 font-bold font-mono text-[#0E3A66]">
                        ฿{dept.projectedMonthEndSpendThb.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className={isDeptOver ? "text-[#B3352C] font-bold" : "text-[#1E9C6E]"}>
                          {dept.projectedVarianceThb > 0 ? "+" : ""}
                          ฿{dept.projectedVarianceThb.toLocaleString()} ({dept.projectedVariancePct}%)
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {dept.estimatedDepletionDay ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#FBEAEA] text-[#B3352C] border border-[#F4B8B4]">
                            วันที่ {dept.estimatedDepletionDay} (อีก {dept.daysUntilDepletion} วัน)
                          </span>
                        ) : (
                          <span className="text-[#6A7B87] text-[11px]">งบพอตลอดเดือน</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            dept.status === "critical"
                              ? "bg-[#FBEAEA] text-[#B3352C] border border-[#F4B8B4]"
                              : dept.status === "warning"
                              ? "bg-[#FCF3DE] text-[#D99B14] border border-[#F3D98F]"
                              : dept.status === "on_track"
                              ? "bg-[#E8F3FA] text-[#0E3A66] border border-[#9FCEE8]"
                              : "bg-[#E8F6F0] text-[#1E9C6E] border border-[#A5DCC5]"
                          }`}
                        >
                          {dept.status === "critical"
                            ? "วิกฤต"
                            : dept.status === "warning"
                            ? "เตือน"
                            : dept.status === "on_track"
                            ? "ตามแผน"
                            : "คงเหลือ"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
