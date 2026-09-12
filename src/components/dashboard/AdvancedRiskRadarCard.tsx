import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, Users, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { ProactiveRiskRadarSummary } from "../../utils/riskRadarEngine";

export interface AdvancedRiskRadarCardProps {
  summary: ProactiveRiskRadarSummary;
}

export default function AdvancedRiskRadarCard({ summary }: AdvancedRiskRadarCardProps) {
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const { overallRiskScore, riskStatus, radarMetrics, roleAssessments, departmentAssessments } = summary;

  // 5-Axis Radar Calculation
  const axes = [
    { key: "staffingSufficiency", label: "อัตรากำลังขั้นต่ำ", val: radarMetrics.staffingSufficiency },
    { key: "weeklyOtSafety", label: "ความปลอดภัย OT รายสัปดาห์", val: radarMetrics.weeklyOtSafety },
    { key: "restTurnaroundSafety", label: "การพักผ่อนระหว่างกะ (11h)", val: radarMetrics.restTurnaroundSafety },
    { key: "workdayAdherence", label: "วันหยุดประจำสัปดาห์ (<=6d)", val: radarMetrics.workdayAdherence },
    { key: "rosterResilience", label: "ความยืดหยุ่นกำลังพลสำรอง", val: radarMetrics.rosterResilience }
  ];

  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 85;

  const getCoordinates = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const r = radius * Math.max(0.1, Math.min(1.0, value));
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  };

  const polygonPoints = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axis.val);
      return `${x},${y}`;
    })
    .join(" ");

  const levels = [0.25, 0.5, 0.75, 1.0];

  const filteredRoles = roleAssessments.filter(r => {
    if (filterLevel === "ALL") return true;
    return r.riskLevel === filterLevel;
  });

  return (
    <div className="bg-white border border-[#DCE4EA] rounded p-4 sm:p-5 shadow-maritime-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <span className="eyebrow">ระบบเรดาร์เตือนภัยความเสี่ยงเชิงรุก</span>
          <h2 className="text-base sm:text-lg font-bold text-[#0E3A66] tracking-tight">
            เรดาร์ประเมินความเสี่ยงและความล้าสะสม (Risk Radar)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border ${
              riskStatus === "CRITICAL"
                ? "bg-[#FBEAEA] text-[#B3352C] border-[#F4B8B4]"
                : riskStatus === "HIGH"
                ? "bg-[#FCF3DE] text-[#D99B14] border-[#F3D98F]"
                : riskStatus === "MODERATE"
                ? "bg-[#E8F3FA] text-[#0E3A66] border-[#9FCEE8]"
                : "bg-[#E8F6F0] text-[#1E9C6E] border-[#A5DCC5]"
            }`}
          >
            สถานะความเสี่ยงองค์กร: {riskStatus}
          </span>
        </div>
      </div>

      {/* Main Grid: Radar Chart on Left, Risk Matrix on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Radar SVG Panel (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-[#F3F6F8] border border-[#DCE4EA] rounded p-4 flex flex-col items-center justify-between">
          <div className="text-xs font-bold text-[#0E3A66] w-full text-left mb-1">
            แผนผังเรดาร์ 5 มิติ (Proactive 5-Axis Spider Chart)
          </div>
          <div className="text-[11px] text-[#59656D] w-full text-left mb-2">
            ดัชนีชี้วัดความพร้อมของกำลังพลและความสอดคล้องตามกฎหมาย (1.0 = ปลอดภัยสูงสุด)
          </div>

          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[280px] h-auto select-none overflow-visible"
          >
            {/* Concentric grid pentagons */}
            {levels.map((lvl, lIdx) => {
              const pts = axes
                .map((_, i) => {
                  const { x, y } = getCoordinates(i, lvl);
                  return `${x},${y}`;
                })
                .join(" ");
              return (
                <polygon
                  key={lIdx}
                  points={pts}
                  fill="none"
                  stroke="#DCE4EA"
                  strokeWidth="1"
                  strokeDasharray={lvl === 1.0 ? "none" : "2 2"}
                />
              );
            })}

            {/* Axis lines */}
            {axes.map((_, i) => {
              const { x, y } = getCoordinates(i, 1.0);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke="#DCE4EA"
                  strokeWidth="1"
                />
              );
            })}

            {/* Data Polygon */}
            <polygon
              points={polygonPoints}
              fill="#2E90CB"
              fillOpacity="0.22"
              stroke="#0E3A66"
              strokeWidth="2"
            />

            {/* Vertex Dots & Labels */}
            {axes.map((axis, i) => {
              const { x, y } = getCoordinates(i, axis.val);
              const labelPos = getCoordinates(i, 1.25);
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="3.5" fill="#0E3A66" stroke="#ffffff" strokeWidth="1.5" />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8.5"
                    fontWeight="bold"
                    fill="#333B41"
                  >
                    {Math.round(axis.val * 100)}%
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Radar Metric Legend */}
          <div className="w-full grid grid-cols-1 gap-1.5 mt-3 pt-2.5 border-t border-[#DCE4EA] text-xs">
            {axes.map((axis, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[#59656D]">{axis.label}</span>
                <span className="font-bold font-mono text-[#0E3A66]">
                  {Math.round(axis.val * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Proactive Risk Matrix Table (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs font-bold text-[#0E3A66] uppercase tracking-wider">
              เมทริกซ์ความเสี่ยงตำแหน่งและแผนก (Risk Matrix)
            </div>

            {/* Level Filter Buttons */}
            <div className="flex items-center gap-1 bg-[#F3F6F8] p-1 rounded border border-[#DCE4EA]">
              {["ALL", "CRITICAL", "HIGH", "MODERATE", "LOW"].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    filterLevel === lvl
                      ? "bg-[#0E3A66] text-white"
                      : "text-[#59656D] hover:bg-white"
                  }`}
                >
                  {lvl === "ALL" ? "ทั้งหมด" : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Department Risk Summary Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {departmentAssessments.map(dept => (
              <div
                key={dept.deptId}
                className="bg-[#F3F6F8] border border-[#DCE4EA] p-2.5 rounded flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0E3A66]">{dept.deptName}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                      dept.riskLevel === "CRITICAL"
                        ? "bg-[#FBEAEA] text-[#B3352C]"
                        : dept.riskLevel === "HIGH"
                        ? "bg-[#FCF3DE] text-[#D99B14]"
                        : dept.riskLevel === "MODERATE"
                        ? "bg-[#E8F3FA] text-[#0E3A66]"
                        : "bg-[#E8F6F0] text-[#1E9C6E]"
                    }`}
                  >
                    {dept.riskLevel}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-[#59656D] leading-tight line-clamp-1">
                  {dept.warning}
                </div>
              </div>
            ))}
          </div>

          {/* Roles Warning List */}
          <div className="overflow-x-auto border border-[#DCE4EA] rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F3F6F8] text-[#0E3A66] font-bold border-b border-[#DCE4EA]">
                  <th className="py-2 px-3 whitespace-nowrap">ตำแหน่ง / แผนก</th>
                  <th className="py-2 px-3 whitespace-nowrap">กำลังพล (จริง/ต่ำสุด)</th>
                  <th className="py-2 px-3 whitespace-nowrap">ระดับความเสี่ยง</th>
                  <th className="py-2 px-3 whitespace-nowrap">สัญญาณเตือนเชิงรุก</th>
                  <th className="py-2 px-3 whitespace-nowrap">คำแนะนำแก้ไข</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4EA] bg-white">
                {filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-xs text-[#6A7B87]">
                      ไม่พบตำแหน่งงานในระดับความเสี่ยงที่เลือก
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((role, idx) => (
                    <tr key={idx} className="hover:bg-[#F3F6F8]/60 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[#0E3A66]">
                        <div>{role.role}</div>
                        <div className="text-[11px] font-normal text-[#6A7B87]">{role.department}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#333B41]">
                        <span className={role.isUnderstaffed ? "text-[#B3352C] font-bold" : ""}>
                          {role.activeHeadcount}/{role.minimumRequired}
                        </span>
                        {role.isUnderstaffed && (
                          <span className="ml-1 text-[10px] text-[#B3352C]">
                            (ขาด {role.staffingShortfall})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            role.riskLevel === "CRITICAL"
                              ? "bg-[#FBEAEA] text-[#B3352C] border border-[#F4B8B4]"
                              : role.riskLevel === "HIGH"
                              ? "bg-[#FCF3DE] text-[#D99B14] border border-[#F3D98F]"
                              : role.riskLevel === "MODERATE"
                              ? "bg-[#E8F3FA] text-[#0E3A66] border border-[#9FCEE8]"
                              : "bg-[#E8F6F0] text-[#1E9C6E] border border-[#A5DCC5]"
                          }`}
                        >
                          {role.riskLevel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#59656D] max-w-[200px]">
                        <div className="text-xs leading-relaxed">{role.proactiveWarning}</div>
                        {(role.projectedFatigueCount > 0 || role.consecutiveDaysNearBreach > 0) && (
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-[#D99B14]">
                            <Clock className="w-3 h-3" />
                            <span>
                              ใกล้ชนเกณฑ์ {role.projectedFatigueCount} คน / ติดต่อกัน 5 วัน {role.consecutiveDaysNearBreach} คน
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-[#0E3A66] max-w-[220px]">
                        <div className="font-medium leading-relaxed bg-[#F3F6F8] px-2 py-1 rounded border border-[#DCE4EA]">
                          {role.recommendedMitigation}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
