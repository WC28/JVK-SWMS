const thaiHolidayList = [
  "2025-01-01",
  "2025-02-12",
  "2025-04-07",
  "2025-04-14",
  "2025-04-15",
  "2025-05-01",
  "2025-05-05",
  "2025-05-12",
  "2025-06-03",
  "2025-07-10",
  "2025-07-28",
  "2025-08-12",
  "2025-10-13",
  "2025-10-23",
  "2025-12-05",
  "2025-12-10",
  "2025-12-31",
  "2026-01-01",
  "2026-01-02",
  "2026-03-03",
  "2026-04-06",
  "2026-04-13",
  "2026-04-14",
  "2026-04-15",
  "2026-05-01",
  "2026-05-04",
  "2026-05-11",
  "2026-06-01",
  "2026-06-03",
  "2026-07-28",
  "2026-07-29",
  "2026-07-30",
  "2026-08-12",
  "2026-10-13",
  "2026-10-23",
  "2026-12-07",
  "2026-12-10",
  "2026-12-31"
] as const;

const holidaySet = new Set<string>(thaiHolidayList);

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseLocalDate(input: string) {
  const [year, month, day] = input.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isHoliday(date: Date) {
  return holidaySet.has(formatLocalDate(date));
}

export function addBusinessDays(startDate: string, days: number) {
  if (!startDate) {
    return "";
  }

  const current = parseLocalDate(startDate);

  if (!current) {
    return "";
  }

  let added = 0;

  // Mirrors Google Sheets / Excel WORKDAY(startDate, days, holidays):
  // start date itself is not counted, then we move forward by N valid workdays.
  while (added < days) {
    current.setDate(current.getDate() + 1);
    if (!isWeekend(current) && !isHoliday(current)) {
      added += 1;
    }
  }

  return formatLocalDate(current);
}

export function calculateJvkDeadline(startDate: string, days: number) {
  if (!startDate) {
    return "";
  }

  const workdayResult = addBusinessDays(startDate, days);

  if (!workdayResult) {
    return "";
  }

  const current = parseLocalDate(workdayResult);

  if (!current) {
    return "";
  }

  // JVK internal rule:
  // after completing 5 workdays, the deadline is the following calendar day.
  current.setDate(current.getDate() + 1);
  return formatLocalDate(current);
}

export function normalizeStatus({
  deadline,
  status,
  isDone
}: {
  deadline: string;
  status: string;
  isDone: boolean;
}) {
  if (!deadline || isDone || status === "D/C" || status === "WAIT D/C") {
    return status;
  }

  const deadlineDate = parseLocalDate(deadline);

  if (!deadlineDate) {
    return status;
  }

  const today = new Date();
  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return todayLocal.getTime() > deadlineDate.getTime() ? "LATE" : status;
}
