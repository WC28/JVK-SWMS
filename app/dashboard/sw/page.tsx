import Link from "next/link";
import { requirePageSession } from "@/lib/app-auth";
import { ExportPngButton } from "@/components/export-png-button";
import { DonutChart, HorizontalBarChart } from "@/components/kpi-charts";
import { MetricCard } from "@/components/metric-card";
import { MonthYearFilter } from "@/components/month-year-filter";
import { SectionCard } from "@/components/section-card";
import {
  buildLongStayRanking,
  buildProblemBreakdown,
  buildSummary,
  filterCasesBySw
} from "@/lib/analytics";
import { swOptions } from "@/lib/constants";
import { filterCasesByMonthYear, getMonthLabel, parseMonthYear } from "@/lib/date-filters";
import { listCases } from "@/lib/db";

export const dynamic = "force-dynamic";

type SwDashboardPageProps = {
  searchParams?: Promise<{
    sw?: string;
    month?: string;
    year?: string;
  }>;
};

export default async function SwDashboardPage({ searchParams }: SwDashboardPageProps) {
  await requirePageSession();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const { month, year } = parseMonthYear(resolvedSearchParams);
  const selectedSw =
    resolvedSearchParams?.sw && swOptions.includes(resolvedSearchParams.sw as (typeof swOptions)[number])
      ? resolvedSearchParams.sw
      : swOptions[0];
  const swCases = filterCasesBySw(
    filterCasesByMonthYear(await listCases(), month, year),
    selectedSw
  );
  const summary = buildSummary(swCases);
  const longStay = buildLongStayRanking(swCases);
  const problems = buildProblemBreakdown(swCases);
  const monthLabel = getMonthLabel(month, year);
  const statusChart = [
    { label: "In Progress", value: summary.inProgress, color: "#5663ff" },
    { label: "D/C", value: summary.dc, color: "#dfff3d" },
    { label: "WAIT D/C", value: summary.waitDc, color: "#ff6a5d" },
    { label: "LATE", value: summary.late, color: "#ffab3d" }
  ];
  const longStayChart = longStay.map((row, index) => ({
    label: row.patientName,
    value: row.days,
    color: ["#214cff", "#19c37d", "#17c2ff", "#ffab3d", "#5663ff"][index]
  }));
  const topProblemsChart = problems.slice(0, 5).map((row, index) => ({
    label: row.label,
    value: row.total,
    color: ["#214cff", "#19c37d", "#17c2ff", "#ffab3d", "#5663ff"][index]
  }));

  return (
    <div className="stack-xl">
      <section className="dashboard-banner sw-banner">
        <div>
          <p className="eyebrow eyebrow-light">SW Performance Dashboard</p>
          <h1>{selectedSw}</h1>
          <p>{monthLabel}</p>
        </div>
        <div className="banner-actions">
          <ExportPngButton
            fileName={`JVK-SWMS-${selectedSw}-${year}-${String(month).padStart(2, "0")}.png`}
            targetId="sw-dashboard-export"
          />
        </div>
      </section>

      <section className="filter-bar">
        <MonthYearFilter includeSw month={month} swName={selectedSw} year={year} />
      </section>

      <section className="sw-selector">
        {swOptions.map((name) => (
          <Link
            href={`/dashboard/sw?sw=${encodeURIComponent(name)}&month=${month}&year=${year}`}
            key={name}
            className={name === selectedSw ? "chip chip-active" : "chip"}
          >
            {name}
          </Link>
        ))}
      </section>

      <div id="sw-dashboard-export" className="stack-xl export-surface">
        <section className="dashboard-hero-grid">
          <div className="dashboard-overview-card dashboard-overview-card-sw">
            <div className="dashboard-overview-copy">
              <span className="dashboard-overline">Personal Care Intelligence</span>
              <h2>{selectedSw}</h2>
              <p>
                มุมมอง KPI รายบุคคลสำหรับติดตามจำนวนเคส active, discharge,
                late case และแนวโน้มงานค้างในเดือนที่เลือก
              </p>
            </div>

            <div className="dashboard-stat-strip">
              <div className="stat-chip">
                <span>Assigned cases</span>
                <strong>{summary.totalCases}</strong>
              </div>
              <div className="stat-chip">
                <span>Current flow</span>
                <strong>{summary.inProgress} active</strong>
              </div>
              <div className="stat-chip">
                <span>Care mix</span>
                <strong>{summary.opd} / {summary.ipd} / {summary.er}</strong>
              </div>
            </div>
          </div>

          <div className="dashboard-kpi-stack">
            <MetricCard label="Total Cases" note="assigned this month" tone="blue" value={summary.totalCases} variant="hero" />
            <MetricCard label="In Progress" note="currently active" tone="indigo" value={summary.inProgress} />
            <MetricCard label="D/C" note="completed cases" tone="lime" value={summary.dc} />
            <MetricCard label="LATE" note="over deadline" tone="orange" value={summary.late} />
          </div>
        </section>

        <section className="dashboard-ticker-grid">
          <MetricCard label="WAIT D/C" tone="red" value={summary.waitDc} variant="compact" />
          <MetricCard label="OPD" tone="aqua" value={summary.opd} variant="compact" />
          <MetricCard label="IPD" tone="navy" value={summary.ipd} variant="compact" />
          <MetricCard label="ER" tone="orange" value={summary.er} variant="compact" />
        </section>

        <section className="content-grid dashboard-grid-balanced">
          <SectionCard title="KPI Status Graph" subtitle="กราฟสัดส่วนสถานะเคสของนักสังคมคนนี้">
            <DonutChart data={statusChart} totalLabel="cases" />
          </SectionCard>

          <SectionCard title="Top 5 ผู้ป่วยค้างวอร์ด/นอนเรือนนาน" subtitle="จัดอันดับจาก consult date ถึงวันนี้">
            <HorizontalBarChart data={longStayChart} />
          </SectionCard>
        </section>

        <section className="content-grid dashboard-grid-balanced">
          <SectionCard title="Top 5 ผู้ป่วยค้างวอร์ด/นอนเรือนนาน" subtitle="จัดอันดับจาก consult date ถึงวันนี้">
            <table className="compact-table">
              <thead>
                <tr>
                  <th>อันดับ</th>
                  <th>ชื่อผู้ป่วย</th>
                  <th>จำนวนวัน</th>
                </tr>
              </thead>
              <tbody>
                {longStay.map((row, index) => (
                  <tr key={`${row.patientName}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{row.patientName}</td>
                    <td>{row.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          <SectionCard title="Top ปัญหา/เรื่อง" subtitle="นับจาก Problem Social List ของ SW คนนี้">
            <HorizontalBarChart data={topProblemsChart} />
          </SectionCard>
        </section>
      </div>
    </div>
  );
}
