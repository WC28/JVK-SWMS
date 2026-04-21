import { ExportPngButton } from "@/components/export-png-button";
import { DonutChart, HorizontalBarChart } from "@/components/kpi-charts";
import { MetricCard } from "@/components/metric-card";
import { MonthYearFilter } from "@/components/month-year-filter";
import { SectionCard } from "@/components/section-card";
import {
  buildAgeBreakdown,
  buildIntakeBreakdown,
  buildProblemBreakdown,
  buildSummary
} from "@/lib/analytics";
import { filterCasesByMonthYear, getMonthLabel, parseMonthYear } from "@/lib/date-filters";
import { listCases } from "@/lib/db";

export const dynamic = "force-dynamic";

type TeamDashboardPageProps = {
  searchParams?: Promise<{
    month?: string;
    year?: string;
  }>;
};

export default async function TeamDashboardPage({ searchParams }: TeamDashboardPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const { month, year } = parseMonthYear(resolvedSearchParams);
  const rows = filterCasesByMonthYear(await listCases(), month, year);
  const summary = buildSummary(rows);
  const intakeBreakdown = buildIntakeBreakdown(rows);
  const ageBreakdown = buildAgeBreakdown(rows);
  const problems = buildProblemBreakdown(rows);
  const monthLabel = getMonthLabel(month, year);
  const statusChart = [
    { label: "In Progress", value: summary.inProgress, color: "#5663ff" },
    { label: "D/C", value: summary.dc, color: "#dfff3d" },
    { label: "WAIT D/C", value: summary.waitDc, color: "#ff6a5d" },
    { label: "LATE", value: summary.late, color: "#ffab3d" }
  ];
  const intakeChart = intakeBreakdown.map((row, index) => ({
    label: row.label,
    value: row.total,
    color: ["#214cff", "#17c2ff", "#19c37d", "#ffab3d", "#ff5bc7", "#5663ff"][index]
  }));
  const topProblemsChart = problems.slice(0, 5).map((row, index) => ({
    label: row.label,
    value: row.total,
    color: ["#214cff", "#19c37d", "#17c2ff", "#ffab3d", "#5663ff"][index]
  }));

  return (
    <div className="stack-xl">
      <section className="dashboard-banner team-banner">
        <div>
          <p className="eyebrow eyebrow-light">Team Intelligence Dashboard</p>
          <h1>Care Operations Overview</h1>
          <p>{monthLabel}</p>
        </div>
        <ExportPngButton
          fileName={`JVK-SWMS-team-dashboard-${year}-${String(month).padStart(2, "0")}.png`}
          targetId="team-dashboard-export"
        />
      </section>

      <section className="filter-bar">
        <MonthYearFilter month={month} year={year} />
      </section>

      <div id="team-dashboard-export" className="stack-xl export-surface">
        <section className="dashboard-hero-grid">
          <div className="dashboard-overview-card">
            <div className="dashboard-overview-copy">
              <span className="dashboard-overline">JVK Social Work Department</span>
              <h2>ภาพรวม KPI กลุ่มงาน</h2>
              <p>
                สรุปจำนวนเคส สถานะการดำเนินงาน และ clinical mix ของเดือนที่เลือก
                ในมุมมองที่อ่านเร็วและพร้อมใช้บนหน้าจอคอม iPad และโทรศัพท์
              </p>
            </div>

            <div className="dashboard-stat-strip">
              <div className="stat-chip">
                <span>Total cases</span>
                <strong>{summary.totalCases}</strong>
              </div>
              <div className="stat-chip">
                <span>Male / Female</span>
                <strong>{summary.male} / {summary.female}</strong>
              </div>
              <div className="stat-chip">
                <span>OPD / IPD / ER</span>
                <strong>{summary.opd} / {summary.ipd} / {summary.er}</strong>
              </div>
            </div>
          </div>

          <div className="dashboard-kpi-stack">
            <MetricCard label="Total Cases" note="all consultations" tone="blue" value={summary.totalCases} variant="hero" />
            <MetricCard label="In Progress" note="active cases" tone="indigo" value={summary.inProgress} />
            <MetricCard label="D/C" note="completed discharge" tone="lime" value={summary.dc} />
            <MetricCard label="WAIT D/C" note="waiting for discharge" tone="red" value={summary.waitDc} />
          </div>
        </section>

        <section className="dashboard-ticker-grid">
          <MetricCard label="Total Male" tone="navy" value={summary.male} variant="compact" />
          <MetricCard label="Total Female" tone="pink" value={summary.female} variant="compact" />
          <MetricCard label="LATE" tone="orange" value={summary.late} variant="compact" />
          <MetricCard label="OPD เด็ก" tone="aqua" value={summary.childOpd} variant="compact" />
          <MetricCard label="นิติจิตเวช OPD" tone="navy" value={summary.forensicOpd} variant="compact" />
          <MetricCard label="นิติจิตเวช IPD" tone="indigo" value={summary.forensicIpd} variant="compact" />
        </section>

        <section className="content-grid dashboard-grid-balanced">
          <SectionCard title="KPI Status Graph" subtitle="กราฟสัดส่วนสถานะเคสของเดือนที่เลือก">
            <DonutChart data={statusChart} totalLabel="cases" />
          </SectionCard>

          <SectionCard title="Intake Mix Graph" subtitle="จำนวนเคสแยกตามช่องทางรับบริการ">
            <HorizontalBarChart data={intakeChart} />
          </SectionCard>
        </section>

        <section className="content-grid dashboard-grid-balanced">
          <SectionCard title="Total Intake Cases" subtitle="Male / Female / Total">
            <table className="compact-table">
              <thead>
                <tr>
                  <th>Intake</th>
                  <th>Male</th>
                  <th>Female</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {intakeBreakdown.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.male}</td>
                    <td>{row.female}</td>
                    <td>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          <SectionCard title="Top ปัญหา/เรื่อง" subtitle="สรุปจาก Problem Social List">
            <HorizontalBarChart data={topProblemsChart} />
          </SectionCard>
        </section>

        <section>
          <SectionCard
            title="Clinical Service Utilization Overview"
            subtitle="สถิติรายเดือนแบ่งตามกลุ่มวัย เพศ และ intake"
          >
            <div className="table-scroll">
              <table className="compact-table">
                <thead>
                  <tr>
                    <th>กลุ่มวัย</th>
                    <th>Male</th>
                    <th>Female</th>
                    <th>OPD</th>
                    <th>OPD เด็ก</th>
                    <th>ER</th>
                    <th>นิติจิตเวช OPD</th>
                    <th>นิติจิตเวช IPD</th>
                    <th>IPD</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ageBreakdown.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td>{row.male}</td>
                      <td>{row.female}</td>
                      <td>{row.byIntake.OPD}</td>
                      <td>{row.byIntake["OPD เด็ก"]}</td>
                      <td>{row.byIntake.ER}</td>
                      <td>{row.byIntake["นิติจิตเวช OPD"]}</td>
                      <td>{row.byIntake["นิติจิตเวช IPD"]}</td>
                      <td>{row.byIntake.IPD}</td>
                      <td>{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </section>
      </div>
    </div>
  );
}
