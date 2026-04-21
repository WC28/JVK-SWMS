import { ReportsClient } from "@/components/reports-client";
import {
  buildAreaBySwBoards,
  buildCountsByArea,
  buildCountsByMd,
  buildCountsBySw,
  buildCountsByWard,
  buildMdSwMatrix,
  buildProblemBreakdown,
  buildSwBoardSummaries
} from "@/lib/analytics";
import { filterCasesByMonthYear, getDefaultMonthYear, parseMonthYear } from "@/lib/date-filters";
import { listCases, listSnapshots } from "@/lib/db";

export const dynamic = "force-dynamic";

type ReportsPageProps = {
  searchParams?: Promise<{
    month?: string;
    year?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const defaults = getDefaultMonthYear();
  const snapshots = await listSnapshots();
  const { month, year } = resolvedSearchParams
    ? parseMonthYear(resolvedSearchParams)
    : defaults;
  const currentRows = filterCasesByMonthYear(await listCases(), month, year);
  const swBoards = buildSwBoardSummaries(currentRows);
  const topProblems = buildProblemBreakdown(currentRows).slice(0, 10);
  const swTotals = buildCountsBySw(currentRows);
  const swOpd = buildCountsBySw(currentRows, (row) => row.intake === "OPD");
  const swIpd = buildCountsBySw(currentRows, (row) => row.intake === "IPD");
  const swEr = buildCountsBySw(currentRows, (row) => row.intake === "ER");
  const swChildOpd = buildCountsBySw(currentRows, (row) => row.intake === "OPD เด็ก");
  const swMale = buildCountsBySw(currentRows, (row) => row.sex === "Male");
  const swFemale = buildCountsBySw(currentRows, (row) => row.sex === "Female");
  const mdTotal = buildCountsByMd(currentRows);
  const mdOpd = buildCountsByMd(currentRows, (row) => row.intake === "OPD");
  const mdIpd = buildCountsByMd(currentRows, (row) => row.intake === "IPD");
  const mdMatrixOpd = buildMdSwMatrix(currentRows, (row) => row.intake === "OPD");
  const mdMatrixIpd = buildMdSwMatrix(currentRows, (row) => row.intake === "IPD");
  const wardCounts = buildCountsByWard(currentRows);
  const areaCounts = buildCountsByArea(currentRows);
  const areaBySwBoards = buildAreaBySwBoards(currentRows);

  return (
    <div className="stack-xl">
      <section className="dashboard-banner reports-banner">
        <div>
          <p className="eyebrow filter-pill-light">Monthly Executive Reports</p>
          <h1>ศูนย์จัดการ Snapshot และ Monthly Reporting</h1>
          <p>
            บันทึกประวัติรายงานรายเดือนอย่างเป็นระบบ พร้อมทางลัดไปยัง dashboard
            สำหรับ export PNG และตรวจสอบข้อมูลก่อนส่งต่อผู้บริหาร
          </p>
        </div>
        <div className="dashboard-banner-meta">
          <div className="filter-pill filter-pill-light">{`Period ${month}/${year}`}</div>
          <div className="filter-pill filter-pill-light">{`Saved snapshots ${snapshots.length}`}</div>
        </div>
      </section>

      <ReportsClient
        initialSnapshots={snapshots}
        areaCounts={areaCounts}
        areaBySwBoards={areaBySwBoards}
        mdIpd={mdIpd}
        mdMatrixIpd={mdMatrixIpd}
        mdMatrixOpd={mdMatrixOpd}
        mdOpd={mdOpd}
        mdTotal={mdTotal}
        month={month}
        swChildOpd={swChildOpd}
        swBoards={swBoards}
        swEr={swEr}
        swFemale={swFemale}
        swIpd={swIpd}
        swMale={swMale}
        swOpd={swOpd}
        swTotals={swTotals}
        topProblems={topProblems}
        wardCounts={wardCounts}
        year={year}
      />
    </div>
  );
}
