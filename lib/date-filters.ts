import type { CaseRecord } from "@/lib/types";

export function getDefaultMonthYear() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
}

export function parseMonthYear(params?: { month?: string; year?: string }) {
  const defaults = getDefaultMonthYear();
  const month = Number(params?.month);
  const year = Number(params?.year);

  return {
    month: month >= 1 && month <= 12 ? month : defaults.month,
    year: year >= 2000 && year <= 3000 ? year : defaults.year
  };
}

export function getMonthLabel(month: number, year: number) {
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat("th-TH", {
    month: "long",
    year: "numeric"
  }).format(date);
}

export function filterCasesByMonthYear(
  rows: CaseRecord[],
  month: number,
  year: number
) {
  const mm = String(month).padStart(2, "0");
  const prefix = `${year}-${mm}-`;

  return rows.filter((row) => {
    const source = row.consultDate || row.admitDate || row.createdAt.slice(0, 10);
    return source.startsWith(prefix);
  });
}
