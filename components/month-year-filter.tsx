"use client";

import { useRouter, useSearchParams } from "next/navigation";

type MonthYearFilterProps = {
  month: number;
  year: number;
  includeSw?: boolean;
  swName?: string;
};

const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, index) => currentYear - 2 + index);

export function MonthYearFilter({
  month,
  year,
  includeSw,
  swName
}: MonthYearFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(nextMonth: number, nextYear: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", String(nextMonth));
    params.set("year", String(nextYear));

    if (includeSw && swName) {
      params.set("sw", swName);
    }

    router.push(`?${params.toString()}`);
  }

  return (
    <div className="month-filter">
      <label className="field">
        <span>เดือน</span>
        <select onChange={(event) => update(Number(event.target.value), year)} value={month}>
          {monthOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>ปี</span>
        <select onChange={(event) => update(month, Number(event.target.value))} value={year}>
          {yearOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
