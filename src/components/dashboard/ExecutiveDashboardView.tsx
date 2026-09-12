import React, { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Users,
  Calendar,
  DollarSign
} from "lucide-react";
import { Employee, Department } from "../../types";
import {
  calculateExecutiveForecastSummary,
  getDaysInMonth
} from "../../utils/budgetForecastEngine";
import { computeProactiveRiskRadar } from "../../utils/riskRadarEngine";
import StrategicActionHub from "./StrategicActionHub";
import MonthEndBudgetForecastCard from "./MonthEndBudgetForecastCard";
import AdvancedRiskRadarCard from "./AdvancedRiskRadarCard";

export interface ExecutiveDashboardViewProps {
  state: any;
  employees: Employee[];
  departments: Department[];
  otRequests: any[];
  setOtRequests: React.Dispatch<React.SetStateAction<any[]>>;
  selectedMonthFilter: string;
  setSelectedMonthFilter: (m: string) => void;
  onNavigateToShifts: () => void;
  onNavigateToEmployees: () => void;
  getEmpCalculatedOt: (emp: any, monthKey?: string) => number;
  getEmpCalculatedOtPay: (emp: any, monthKey?: string) => number;
}

export default function ExecutiveDashboardView({
  state,
  employees,
  departments,
  otRequests,
  setOtRequests,
  selectedMonthFilter,
  setSelectedMonthFilter,
  onNavigateToShifts,
  onNavigateToEmployees,
  getEmpCalculatedOt,
  getEmpCalculatedOtPay
}: ExecutiveDashboardViewProps) {
  const currentMonthKey = state?.shiftConfig?.currentMonth || "2026-08";

  // Calculate AsOfDay: if viewing current calendar month use today's date, otherwise default to day 15 or month end
  const asOfDay = useMemo(() => {
    const [yStr, mStr] = currentMonthKey.split("-");
    const yr = Number(yStr) || 2026;
    const mn = Number(mStr) || 8;
    const now = new Date();
    if (now.getFullYear() === yr && now.getMonth() + 1 === mn) {
      return Math.min(now.getDate(), getDaysInMonth(currentMonthKey));
    }
    // For simulation & review, evaluate at mid-month or completed
    return 15;
  }, [currentMonthKey]);

  // Pure Budget Forecast Engine execution
  const forecastSummary = useMemo(() => {
    return calculateExecutiveForecastSummary(
      employees,
      departments,
      currentMonthKey,
      asOfDay,
      state?.companyHolidays,
      state?.restDayPolicies
    );
  }, [employees, departments, currentMonthKey, asOfDay, state?.companyHolidays, state?.restDayPolicies]);

  // Pure Proactive Risk Radar Engine execution
  const riskSummary = useMemo(() => {
    return computeProactiveRiskRadar(employees, departments, currentMonthKey);
  }, [employees, departments, currentMonthKey]);

  // High-Level Cost Drivers Tree Aggregations
  const totalOtHours = useMemo(() => {
    return employees.reduce((sum, emp) => sum + getEmpCalculatedOt(emp, currentMonthKey), 0);
  }, [employees, currentMonthKey, getEmpCalculatedOt]);

  const totalBaseSalary = useMemo(() => {
    return employees.reduce((acc, curr) => acc + (Number(curr.salary) || 15000), 0);
  }, [employees]);

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* 1. Strategic Action Hub (R4) */}
      <StrategicActionHub
        monthKey={currentMonthKey}
        otRequests={otRequests}
        setOtRequests={setOtRequests}
        forecastSummary={forecastSummary}
        riskSummary={riskSummary}
        onNavigateToShifts={onNavigateToShifts}
      />

      {/* 2. Executive KPI Bento Grid (4 Strategic Tiles) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6 font-sans">
        {/* Tile 1: Projected Total Spend */}
        <div className="col-span-1 md:col-span-1 lg:col-span-3 bg-white border border-[#DCE4EA] p-5 rounded shadow-maritime-xs flex flex-col justify-between min-h-[145px] hover:border-[#9FCEE8] transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="text-xs font-bold text-[#6A7B87] tracking-wider uppercase">
              คาดการณ์ค่าล่วงเวลาสิ้นเดือน
            </h3>
            <div className="w-8 h-8 rounded bg-[#E8F3FA] text-[#0E3A66] border border-[#9FCEE8] flex items-center justify-center font-bold">
              {forecastSummary.totalProjectedVarianceThb > 0 ? (
                <TrendingUp className="w-4 h-4 text-[#B3352C]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#1E9C6E]" />
              )}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#0E3A66] font-mono tabular-nums">
              ฿{forecastSummary.totalProjectedMonthEndSpendThb.toLocaleString()}
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-[11px] text-[#6A7B87]">
                งบจัดสรร ฿{forecastSummary.totalTargetBudgetThb.toLocaleString()}
              </span>
              <span
                className={`tag ${
                  forecastSummary.totalProjectedVarianceThb > 0 ? "t-y" : "t-g"
                }`}
              >
                Burn {forecastSummary.totalProjectedBurnRatePct}%
              </span>
            </div>
          </div>
        </div>

        {/* Tile 2: Actual MTD Spend */}
        <div className="col-span-1 md:col-span-1 lg:col-span-3 bg-white border border-[#DCE4EA] p-5 rounded shadow-maritime-xs flex flex-col justify-between min-h-[145px] hover:border-[#9FCEE8] transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="text-xs font-bold text-[#6A7B87] tracking-wider uppercase">
              ค่าล่วงเวลาสะสมจริง (MTD)
            </h3>
            <div className="w-8 h-8 rounded bg-[#E8F3FA] text-[#0E3A66] border border-[#9FCEE8] flex items-center justify-center font-bold text-xs font-mono">
              ฿
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#0E3A66] font-mono tabular-nums">
              ฿{forecastSummary.totalActualSpendToDateThb.toLocaleString()}
            </div>
            <div className="w-full bg-[#F3F6F8] h-1.5 rounded-full overflow-hidden border border-[#DCE4EA] mt-2">
              <div
                style={{
                  width: `${Math.min(
                    100,
                    forecastSummary.totalTargetBudgetThb > 0
                      ? Math.round(
                          (forecastSummary.totalActualSpendToDateThb /
                            forecastSummary.totalTargetBudgetThb) *
                            100
                        )
                      : 0
                  )}%`
                }}
                className="bg-[#0E3A66] h-full rounded-full transition-all"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#6A7B87] font-medium mt-1.5">
              <span>ถึงวันที่ {asOfDay}</span>
              <span>{Math.round(totalOtHours).toLocaleString()} ชม.</span>
            </div>
          </div>
        </div>

        {/* Tile 3: Daily Burn Velocity */}
        <div className="col-span-1 md:col-span-1 lg:col-span-3 bg-white border border-[#DCE4EA] p-5 rounded shadow-maritime-xs flex flex-col justify-between min-h-[145px] hover:border-[#9FCEE8] transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="text-xs font-bold text-[#6A7B87] tracking-wider uppercase">
              อัตราการเผางบเฉลี่ย
            </h3>
            <div className="w-8 h-8 rounded bg-[#E8F3FA] text-[#2E90CB] border border-[#9FCEE8] flex items-center justify-center font-bold">
              <Activity className="w-4 h-4 text-[#2E90CB]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#0E3A66] font-mono tabular-nums">
              ฿{Math.round(forecastSummary.totalDailyBurnRateThb).toLocaleString()}/วัน
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-[11px] text-[#6A7B87]">เกณฑ์มาตรฐาน</span>
              <span className="text-[11px] font-mono text-[#0E3A66] font-bold">
                ฿{Math.round(forecastSummary.totalTargetPacingToDateThb / Math.max(1, asOfDay)).toLocaleString()}/วัน
              </span>
            </div>
          </div>
        </div>

        {/* Tile 4: Compliance & Safety Margin */}
        <div className="col-span-1 md:col-span-1 lg:col-span-3 bg-white border border-[#DCE4EA] p-5 rounded shadow-maritime-xs flex flex-col justify-between min-h-[145px] hover:border-[#9FCEE8] transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="text-xs font-bold text-[#6A7B87] tracking-wider uppercase">
              ดัชนีความปลอดภัยแรงงาน
            </h3>
            <div className="w-8 h-8 rounded bg-[#E8F6F0] text-[#1E9C6E] border border-[#A5DCC5] flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4 text-[#1E9C6E]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#0E3A66] font-mono tabular-nums">
              {Math.round(riskSummary.radarMetrics.weeklyOtSafety * 100)}%
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-[11px] text-[#6A7B87]">อัตรากำลังพร้อม</span>
              <span
                className={`tag ${
                  riskSummary.radarMetrics.staffingSufficiency >= 1 ? "t-g" : "t-y"
                }`}
              >
                {Math.round(riskSummary.radarMetrics.staffingSufficiency * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Month-End Budget Forecast & Burn Rate Card (R2) */}
      <MonthEndBudgetForecastCard summary={forecastSummary} />

      {/* 4. Advanced Risk & Fatigue Radar Card (R3) */}
      <AdvancedRiskRadarCard summary={riskSummary} />

      {/* 5. Strategic Cost Drivers: Shift-to-Cost Driver Tree (F3.1) & Department Variance (F3.2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Cause-and-Effect Driver Tree */}
        <div className="lg:col-span-6 bg-white border border-[#DCE4EA] rounded p-4 sm:p-5 shadow-maritime-xs flex flex-col justify-between">
          <div>
            <span className="eyebrow">โครงสร้างต้นทุนเชิงสาเหตุ</span>
            <h3 className="text-sm font-bold text-[#0E3A66] tracking-tight mb-2">
              แผนผังเชื่อมโยงการจัดกะสู่ค่าใช้จ่าย (Shift-to-Cost Driver Tree)
            </h3>
            <p className="text-xs text-[#59656D] leading-relaxed mb-3">
              แสดงการกระจายของประเภทกะทำงาน จำนวนชั่วโมง OT และผลคูณตามกฎหมายที่แปลงเป็นต้นทุนค่าล่วงเวลาสะสม
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-[#F3F6F8] p-2.5 rounded border border-[#DCE4EA]">
                <div className="text-[10px] text-[#59656D] font-bold uppercase">กะทำงานทั้งหมด</div>
                <div className="text-base font-bold text-[#0E3A66] font-mono mt-1">
                  {employees.length * asOfDay} กะ
                </div>
              </div>
              <div className="bg-[#F3F6F8] p-2.5 rounded border border-[#DCE4EA]">
                <div className="text-[10px] text-[#59656D] font-bold uppercase">ชั่วโมง OT สะสม</div>
                <div className="text-base font-bold text-[#0E3A66] font-mono mt-1">
                  {Math.round(totalOtHours)} ชม.
                </div>
              </div>
              <div className="bg-[#F3F6F8] p-2.5 rounded border border-[#DCE4EA]">
                <div className="text-[10px] text-[#59656D] font-bold uppercase">ตัวคูณถ่วงน้ำหนัก</div>
                <div className="text-base font-bold text-[#0E3A66] font-mono mt-1">
                  1.5x - 3.0x
                </div>
              </div>
              <div className="bg-[#F3F6F8] p-2.5 rounded border border-[#DCE4EA]">
                <div className="text-[10px] text-[#59656D] font-bold uppercase">ค่าใช้จ่ายรวม (THB)</div>
                <div className="text-base font-bold text-[#0E3A66] font-mono mt-1">
                  ฿{forecastSummary.totalActualSpendToDateThb.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#DCE4EA] flex items-center justify-between text-xs">
            <span className="text-[#6A7B87]">อัตราส่วน OT ต่อเงินเดือนฐาน</span>
            <span className="font-bold text-[#0E3A66] font-mono">
              {totalBaseSalary > 0
                ? Math.round((forecastSummary.totalActualSpendToDateThb / totalBaseSalary) * 100)
                : 0}
              %
            </span>
          </div>
        </div>

        {/* High-Risk Hotspots Action Summary */}
        <div className="lg:col-span-6 bg-white border border-[#DCE4EA] rounded p-4 sm:p-5 shadow-maritime-xs flex flex-col justify-between">
          <div>
            <span className="eyebrow">จุดเฝ้าระวังผู้บริหาร</span>
            <h3 className="text-sm font-bold text-[#0E3A66] tracking-tight mb-2">
              สรุปความเสี่ยงและแนวทางแก้ปัญหาเร่งด่วน
            </h3>
            <p className="text-xs text-[#59656D] leading-relaxed mb-3">
              ตำแหน่งงานและแผนกที่ต้องได้รับการติดตามอย่างใกล้ชิดเพื่อป้องกันการจัดกะควบและละเมิดกฎหมายแรงงาน
            </p>

            <div className="space-y-2">
              {riskSummary.roleAssessments.slice(0, 3).map((role, idx) => (
                <div
                  key={idx}
                  className="bg-[#F3F6F8] border border-[#DCE4EA] p-2.5 rounded flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-[#0E3A66] flex items-center gap-1.5">
                      <span>{role.role}</span>
                      <span className="text-[11px] font-normal text-[#6A7B87]">
                        ({role.department})
                      </span>
                    </div>
                    <div className="text-[11px] text-[#59656D] mt-0.5">{role.proactiveWarning}</div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        role.riskLevel === "CRITICAL"
                          ? "bg-[#FBEAEA] text-[#B3352C] border border-[#F4B8B4]"
                          : role.riskLevel === "HIGH"
                          ? "bg-[#FCF3DE] text-[#D99B14] border border-[#F3D98F]"
                          : "bg-[#E8F3FA] text-[#0E3A66] border border-[#9FCEE8]"
                      }`}
                    >
                      {role.riskLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#DCE4EA] flex items-center justify-between text-xs">
            <span className="text-[#6A7B87]">ต้องการตรวจสอบรายชื่อพนักงานทั้งหมด?</span>
            <button
              type="button"
              onClick={onNavigateToEmployees}
              className="text-[#0E3A66] hover:text-[#17538F] font-bold underline cursor-pointer"
            >
              ดูฐานข้อมูลบุคลากร
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
