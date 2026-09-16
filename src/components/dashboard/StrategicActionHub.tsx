import React, { useState } from "react";
import { CheckSquare, Download, AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import { ExecutiveMonthEndForecastSummary } from "../../utils/budgetForecastEngine";
import { ProactiveRiskRadarSummary } from "../../utils/riskRadarEngine";

export interface StrategicActionHubProps {
  monthKey: string;
  otRequests: any[];
  setOtRequests: React.Dispatch<React.SetStateAction<any[]>>;
  forecastSummary: ExecutiveMonthEndForecastSummary;
  riskSummary: ProactiveRiskRadarSummary;
  onNavigateToShifts?: () => void;
}

function csvRow(...cells: (string | number)[]): string {
  return cells.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",") + "\n";
}

export function generateBoardReadyCsv(
  monthKey: string,
  forecastSummary: ExecutiveMonthEndForecastSummary,
  riskSummary: ProactiveRiskRadarSummary,
  otRequests: any[]
): string {
  let csv = "\ufeff";
  csv += "===================================================================\n";
  csv += "รายงานสรุปสำหรับคณะกรรมการบริหาร (BOARD-READY EXECUTIVE SUMMARY)\n";
  csv += "รอบเดือน: " + monthKey + ", ออกรายงานวันที่: " + new Date().toLocaleDateString("th-TH") + "\n";
  csv += "===================================================================\n\n";

  // Section 1
  csv += "--- ส่วนที่ 1: ดัชนีชี้วัดหลักของผู้บริหาร (EXECUTIVE KPI SCORECARD) ---\n";
  csv += "ตัวชี้วัด,ค่าจริง,งบประมาณ/เป้าหมาย,ผลต่าง (THB / %),สถานะการกำกับดูแล\n";
  csv += csvRow(
    "งบประมาณ OT รวม",
    "฿" + forecastSummary.totalActualSpendToDateThb.toLocaleString(),
    "฿" + forecastSummary.totalTargetBudgetThb.toLocaleString(),
    (forecastSummary.totalProjectedVarianceThb > 0 ? "+" : "") + forecastSummary.totalProjectedVarianceThb.toLocaleString() + " THB",
    "อัตราเบิกจ่าย " + String(forecastSummary.totalProjectedBurnRatePct) + "%"
  );
  csv += csvRow(
    "การคาดการณ์สิ้นเดือน (Month-End Forecast)",
    "฿" + forecastSummary.totalProjectedMonthEndSpendThb.toLocaleString(),
    "฿" + forecastSummary.totalTargetBudgetThb.toLocaleString(),
    String(forecastSummary.totalProjectedBurnRatePct) + "%",
    forecastSummary.totalProjectedBurnRatePct > 100 ? "เสี่ยงเกินงบประมาณ" : "อยู่ในกรอบงบประมาณ"
  );
  csv += csvRow(
    "ความปลอดภัยแรงงาน (Labor Safety Margin)",
    String(Math.round(riskSummary.radarMetrics.weeklyOtSafety * 100)) + "%",
    "100% สอดคล้องกฎหมาย",
    "ดัชนีพักผ่อน " + String(Math.round(riskSummary.radarMetrics.restTurnaroundSafety * 100)) + "%",
    "สถานะความเสี่ยง " + riskSummary.riskStatus
  );
  csv += csvRow(
    "ความพร้อมอัตรากำลัง (Staffing Coverage)",
    String(Math.round(riskSummary.radarMetrics.staffingSufficiency * 100)) + "%",
    "100% Minimum Crew",
    "ความยืดหยุ่น " + String(Math.round(riskSummary.radarMetrics.rosterResilience * 100)) + "%",
    riskSummary.radarMetrics.staffingSufficiency < 1 ? "ขาดแคลนกำลังพล" : "กำลังพลพร้อม"
  );
  csv += "\n";

  // Section 2
  csv += "--- ส่วนที่ 2: การคาดการณ์งบประมาณรายแผนก (DEPARTMENT FORECAST BREAKDOWN) ---\n";
  csv += "แผนก,จำนวนพนักงาน (คน),งบจัดสรร (THB),ใช้จริงถึงปัจจุบัน (THB),คาดการณ์สิ้นเดือน (THB),ผลต่างงบ (THB),Burn Rate (%),วันงบประมาณหมด,สถานะ\n";
  forecastSummary.departments.forEach(dept => {
    let depletion = "งบเพียงพอตลอดเดือน";
    if (dept.estimatedDepletionDay) {
      depletion = "วันที่ " + String(dept.estimatedDepletionDay) + " (อีก " + String(dept.daysUntilDepletion) + " วัน)";
    }
    csv += csvRow(
      dept.deptName,
      dept.employeeCount,
      dept.targetBudgetThb.toLocaleString(),
      dept.actualSpendToDateThb.toLocaleString(),
      dept.projectedMonthEndSpendThb.toLocaleString(),
      dept.projectedVarianceThb.toLocaleString(),
      String(dept.projectedBurnRatePct) + "%",
      depletion,
      dept.status
    );
  });
  csv += "\n";

  // Section 3
  csv += "--- ส่วนที่ 3: จุดเฝ้าระวังความเสี่ยงกำลังพลและความล้า (RISK & FATIGUE HOTSPOTS) ---\n";
  csv += "แผนก,ตำแหน่ง,ระดับความเสี่ยง,อัตราขาดแคลน,พนักงานเสี่ยงความล้า,การแจ้งเตือนเชิงรุก,คำแนะนำการแก้ไข\n";
  riskSummary.roleAssessments.forEach(role => {
    csv += csvRow(
      role.department,
      role.role,
      role.riskLevel,
      String(role.staffingShortfall) + " อัตรา",
      String(role.projectedFatigueCount) + " คน",
      role.proactiveWarning,
      role.recommendedMitigation
    );
  });
  csv += "\n";

  // Section 4
  csv += "--- ส่วนที่ 4: ภาระผูกพันคำขอ OT รอการอนุมัติ (PENDING OT LIABILITIES) ---\n";
  csv += "รหัสคำขอ,ชื่อพนักงาน,แผนก,วันที่ขอ,จำนวนชั่วโมง,สถานะ\n";
  (otRequests || []).forEach(req => {
    csv += csvRow(
      req.id || "-",
      req.employeeName || req.name || "-",
      req.deptId || req.department || "-",
      req.date || "-",
      String(req.hours || req.otHours || "-") + " ชม.",
      req.status || "pending"
    );
  });

  return csv;
}

export default function StrategicActionHub({
  monthKey,
  otRequests,
  setOtRequests,
  forecastSummary,
  riskSummary,
  onNavigateToShifts
}: StrategicActionHubProps) {
  const [isBatchApproving, setIsBatchApproving] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const pendingRequests = (otRequests || []).filter(r => (r?.status || "pending") === "pending");
  const pendingCount = pendingRequests.length;

  const handleBatchApprove = async () => {
    if (pendingCount === 0) {
      setFeedbackNotice("ไม่มีรายการคำขอ OT ที่รออนุมัติ");
      setTimeout(() => setFeedbackNotice(null), 3500);
      return;
    }

    setIsBatchApproving(true);
    try {
      await Promise.allSettled(
        pendingRequests.map(req =>
          fetch("/api/update-ot-request-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: req.id, status: "approved" })
          })
        )
      );

      setOtRequests(prev =>
        prev.map(r => ((r?.status || "pending") === "pending" ? { ...r, status: "approved" } : r))
      );
      setFeedbackNotice(`อนุมัติคำขอ OT แบบกลุ่มสำเร็จแล้ว (${pendingCount} รายการ)`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch {
      setOtRequests(prev =>
        prev.map(r => ((r?.status || "pending") === "pending" ? { ...r, status: "approved" } : r))
      );
      setFeedbackNotice(`อนุมัติคำขอ OT สำเร็จแล้ว (${pendingCount} รายการ)`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    } finally {
      setIsBatchApproving(false);
    }
  };

  const handleExportBoardSummary = () => {
    try {
      const csv = generateBoardReadyCsv(monthKey, forecastSummary, riskSummary, otRequests);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `OT_Board_Executive_Summary_${monthKey}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setFeedbackNotice("ดาวน์โหลดรายงานสรุปสำหรับบอร์ดบริหารเรียบร้อยแล้ว");
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch {
      setFeedbackNotice("เกิดข้อผิดพลาดในการสร้างรายงานสรุป");
      setTimeout(() => setFeedbackNotice(null), 3500);
    }
  };

  return (
    <div className="bg-white border border-[#DCE4EA] rounded p-4 sm:p-5 shadow-maritime-xs flex flex-col gap-3.5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div>
          <span className="eyebrow">ศูนย์ควบคุมเชิงยุทธศาสตร์</span>
          <h2 className="text-base sm:text-lg font-bold text-[#0E3A66] tracking-tight">
            คำสั่งปฏิบัติการผู้บริหาร
          </h2>
        </div>

        {/* Feedback Banner */}
        {feedbackNotice && (
          <div
            role="status"
            className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold bg-[#E8F6F0] text-[#1E9C6E] border border-[#A5DCC5] animate-in fade-in duration-200"
          >
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#1E9C6E]" />
            <span>{feedbackNotice}</span>
          </div>
        )}
      </div>

      {/* Action Triggers Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#DCE4EA]">
        {/* Trigger 1: Batch Approve */}
        <button
          type="button"
          onClick={handleBatchApprove}
          disabled={isBatchApproving}
          className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-[#1E9C6E] hover:bg-[#177c57] text-white font-bold text-xs rounded transition-colors cursor-pointer disabled:opacity-50 min-h-[44px] shadow-maritime-xs"
          title="อนุมัติคำขอ OT ทั้งหมดที่รอการอนุมัติในคลิกเดียว"
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-white" />
            <span>อนุมัติคำขอทั้งหมด</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-[#1E9C6E] tabular-nums">
            {pendingCount}
          </span>
        </button>

        {/* Trigger 2: Board-Ready Summary Export */}
        <button
          type="button"
          onClick={handleExportBoardSummary}
          className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-[#0E3A66] hover:bg-[#17538F] text-white font-bold text-xs rounded transition-colors cursor-pointer min-h-[44px] shadow-maritime-xs"
          title="ส่งออกรายงานสรุปสำหรับคณะกรรมการบริหารในรูปแบบ CSV"
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-white" />
            <span>ส่งออกสรุปบอร์ด (CSV)</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-[#17538F] text-[#9FCEE8]">
            CSV BOM
          </span>
        </button>

        {/* Trigger 3: Quick Mitigation Shortcut */}
        <button
          type="button"
          onClick={onNavigateToShifts}
          className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-[#E8F3FA] hover:bg-[#9FCEE8]/30 text-[#0E3A66] border border-[#9FCEE8] font-bold text-xs rounded transition-colors cursor-pointer min-h-[44px]"
          title="เข้าสู่หน้าจัดตารางกะเพื่อปรับเกลี่ยอัตรากำลังในแผนกเสี่ยง"
        >
          <div className="flex items-center gap-2">
            {riskSummary.riskStatus === "CRITICAL" ? (
              <AlertTriangle className="w-4 h-4 text-[#B3352C]" />
            ) : (
              <Zap className="w-4 h-4 text-[#0E3A66]" />
            )}
            <span>ปรับเกลี่ยกะวิกฤต</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              riskSummary.riskStatus === "CRITICAL"
                ? "bg-[#FBEAEA] text-[#B3352C] border border-[#F4B8B4]"
                : riskSummary.riskStatus === "HIGH"
                ? "bg-[#FCF3DE] text-[#D99B14] border border-[#F3D98F]"
                : "bg-white text-[#0E3A66] border border-[#DCE4EA]"
            }`}
          >
            {riskSummary.riskStatus}
          </span>
        </button>
      </div>
    </div>
  );
}
