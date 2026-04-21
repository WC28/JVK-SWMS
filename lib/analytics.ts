import { areaOptions, intakeOptions, mdOptions, swOptions, wardOptions } from "@/lib/constants";
import type { CaseRecord } from "@/lib/types";

const intakeOrder = [...intakeOptions];

const ageGroups = [
  { label: "0-5 ปี", min: 0, max: 5 },
  { label: "6-14 ปี", min: 6, max: 14 },
  { label: "15-21 ปี", min: 15, max: 21 },
  { label: "22-59 ปี", min: 22, max: 59 },
  { label: "60+ ปี", min: 60, max: 999 }
];

export function buildSummary(rows: CaseRecord[]) {
  return {
    totalCases: rows.length,
    male: rows.filter((row) => row.sex === "Male").length,
    female: rows.filter((row) => row.sex === "Female").length,
    inProgress: rows.filter((row) => row.status === "In progress").length,
    dc: rows.filter((row) => row.status === "D/C").length,
    late: rows.filter((row) => row.status === "LATE").length,
    waitDc: rows.filter((row) => row.status === "WAIT D/C").length,
    opd: rows.filter((row) => row.intake === "OPD").length,
    ipd: rows.filter((row) => row.intake === "IPD").length,
    er: rows.filter((row) => row.intake === "ER").length,
    childOpd: rows.filter((row) => row.intake === "OPD เด็ก").length,
    forensicOpd: rows.filter((row) => row.intake === "นิติจิตเวช OPD").length,
    forensicIpd: rows.filter((row) => row.intake === "นิติจิตเวช IPD").length
  };
}

export function buildIntakeBreakdown(rows: CaseRecord[]) {
  return intakeOrder.map((intake) => {
    const intakeRows = rows.filter((row) => row.intake === intake);

    return {
      label: intake,
      male: intakeRows.filter((row) => row.sex === "Male").length,
      female: intakeRows.filter((row) => row.sex === "Female").length,
      total: intakeRows.length
    };
  });
}

export function buildAgeBreakdown(rows: CaseRecord[]) {
  return ageGroups.map((group) => {
    const groupRows = rows.filter((row) => {
      const age = Number(row.age);
      return Number.isFinite(age) && age >= group.min && age <= group.max;
    });

    const byIntake = intakeOrder.reduce<Record<(typeof intakeOptions)[number], number>>(
      (acc, intake) => {
        acc[intake] = groupRows.filter((row) => row.intake === intake).length;
        return acc;
      },
      {
        OPD: 0,
        IPD: 0,
        "OPD เด็ก": 0,
        ER: 0,
        "นิติจิตเวช OPD": 0,
        "นิติจิตเวช IPD": 0
      }
    );

    return {
      label: group.label,
      male: groupRows.filter((row) => row.sex === "Male").length,
      female: groupRows.filter((row) => row.sex === "Female").length,
      total: groupRows.length,
      byIntake
    };
  });
}

export function buildProblemBreakdown(rows: CaseRecord[]) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    counts.set(row.problemSocialList, (counts.get(row.problemSocialList) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
}

export function filterCasesBySw(rows: CaseRecord[], swName: string) {
  return rows.filter((row) => row.swName === swName);
}

export function buildLongStayRanking(rows: CaseRecord[]) {
  const today = new Date();

  return rows
    .map((row) => {
      const consult = row.consultDate ? new Date(`${row.consultDate}T00:00:00`) : today;
      const ms = today.getTime() - consult.getTime();

      return {
        patientName: row.patientName,
        days: Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
      };
    })
    .sort((a, b) => b.days - a.days)
    .slice(0, 5);
}

export function buildSwBoardSummaries(rows: CaseRecord[]) {
  const grouped = new Map<string, CaseRecord[]>();

  for (const row of rows) {
    const existing = grouped.get(row.swName) ?? [];
    existing.push(row);
    grouped.set(row.swName, existing);
  }

  return [...grouped.entries()]
    .map(([swName, swRows]) => {
      const summary = buildSummary(swRows);
      const topProblems = buildProblemBreakdown(swRows).slice(0, 5);
      const longStay = buildLongStayRanking(swRows).slice(0, 5);

      return {
        swName,
        summary,
        topProblems,
        longStay
      };
    })
    .sort((a, b) => b.summary.totalCases - a.summary.totalCases || a.swName.localeCompare(b.swName));
}

export function buildCountsBySw(
  rows: CaseRecord[],
  selector: (row: CaseRecord) => boolean = () => true
) {
  const counts = new Map<string, number>(swOptions.map((option) => [option, 0]));

  for (const row of rows) {
    if (!selector(row)) {
      continue;
    }

    counts.set(row.swName, (counts.get(row.swName) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function buildCountsByMd(
  rows: CaseRecord[],
  selector: (row: CaseRecord) => boolean = () => true
) {
  const counts = new Map<string, number>(mdOptions.map((option) => [option, 0]));

  for (const row of rows) {
    if (!selector(row)) {
      continue;
    }

    counts.set(row.mdName, (counts.get(row.mdName) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function buildCountsByWard(rows: CaseRecord[]) {
  const counts = new Map<string, number>(wardOptions.map((option) => [option, 0]));

  for (const row of rows) {
    counts.set(row.ward, (counts.get(row.ward) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
}

export function buildCountsByArea(rows: CaseRecord[]) {
  const counts = new Map<string, number>(areaOptions.map((option) => [option, 0]));

  for (const row of rows) {
    counts.set(row.area, (counts.get(row.area) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
}

export function buildMdSwMatrix(
  rows: CaseRecord[],
  selector: (row: CaseRecord) => boolean = () => true
) {
  return mdOptions.map((mdName) => ({
    mdName,
    swCounts: swOptions.map((swName) => ({
      swName,
      total: rows.filter(
        (row) => selector(row) && row.mdName === mdName && row.swName === swName
      ).length
    }))
  }));
}

export function buildAreaBySwBoards(rows: CaseRecord[]) {
  return swOptions.map((swName) => ({
    swName,
    areas: areaOptions.map((area) => ({
      area,
      total: rows.filter((row) => row.swName === swName && row.area === area).length
    }))
  }));
}
