/**
 * Live Indian Standard Time (IST / Asia/Kolkata / Gujarat) Date Utilities
 * Ensures all calendar, sadhana logs, reminders, and streak calculations
 * are strictly synchronized with the live Indian clock.
 */

export const IST_TIMEZONE = 'Asia/Kolkata';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const WEEKDAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Returns today's date in 'YYYY-MM-DD' formatted according to Indian Standard Time (IST).
 * Example: "2026-10-05"
 */
export function getIndianTodayStr(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * Returns yesterday's date in 'YYYY-MM-DD' formatted according to IST.
 * Example: "2026-10-04"
 */
export function getIndianYesterdayStr(): string {
  const today = getIndianTodayStr();
  return addDaysToDateStr(today, -1);
}

/**
 * Parses a 'YYYY-MM-DD' string into [year, monthIndex (0-11), day (1-31)]
 */
export function parseDateParts(dateStr: string): [number, number, number] {
  const parts = dateStr.split('-').map(Number);
  return [parts[0], parts[1] - 1, parts[2]];
}

/**
 * Adds or subtracts days from a 'YYYY-MM-DD' string safely using UTC timestamps
 */
export function addDaysToDateStr(dateStr: string, days: number): string {
  const [year, monthIndex, day] = parseDateParts(dateStr);
  const utcDate = new Date(Date.UTC(year, monthIndex, day + days));
  const y = utcDate.getUTCFullYear();
  const m = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(utcDate.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calculates exact days difference: (refDate - targetDate) in days
 * Positive means targetDate is in the past.
 * Zero means targetDate is today.
 * Negative means targetDate is in the future.
 */
export function getDaysDifference(referenceDateStr: string, targetDateStr: string): number {
  const [ry, rm, rd] = parseDateParts(referenceDateStr);
  const [ty, tm, td] = parseDateParts(targetDateStr);
  const refMs = Date.UTC(ry, rm, rd);
  const targetMs = Date.UTC(ty, tm, td);
  return Math.round((refMs - targetMs) / (1000 * 60 * 60 * 24));
}

/**
 * Checks whether a given date is older than 3 days compared to today (IST)
 */
export function isOlderThan3DaysIST(dateStr: string, todayStr = getIndianTodayStr()): boolean {
  return getDaysDifference(todayStr, dateStr) > 3;
}

/**
 * Checks whether a given date string is Sunday
 */
export function isSundayDate(dateStr: string): boolean {
  const [year, monthIndex, day] = parseDateParts(dateStr);
  // Using Date.UTC to get day of week is completely timezone-invariant
  return new Date(Date.UTC(year, monthIndex, day)).getUTCDay() === 0;
}

/**
 * Formats a 'YYYY-MM-DD' date string into a friendly short label:
 * Example: "5 Oct, Mon"
 */
export function formatIndianDateShort(dateStr: string = getIndianTodayStr()): string {
  const [year, monthIndex, day] = parseDateParts(dateStr);
  const dayOfWeek = new Date(Date.UTC(year, monthIndex, day)).getUTCDay();
  const weekday = WEEKDAY_NAMES_SHORT[dayOfWeek];
  const month = MONTH_NAMES_SHORT[monthIndex];
  return `${day} ${month}, ${weekday}`;
}

/**
 * Formats a 'YYYY-MM-DD' date string into a day + month string:
 * Example: "5 Oct"
 */
export function formatIndianDayAndMonth(dateStr: string = getIndianTodayStr()): string {
  const [, monthIndex, day] = parseDateParts(dateStr);
  const month = MONTH_NAMES_SHORT[monthIndex];
  return `${day} ${month}`;
}

/**
 * Formats a 'YYYY-MM-DD' date string into a full long label:
 * Example: "Monday, 5 October 2026"
 */
export function formatIndianDateLong(dateStr: string = getIndianTodayStr()): string {
  const [year, monthIndex, day] = parseDateParts(dateStr);
  const dayOfWeek = new Date(Date.UTC(year, monthIndex, day)).getUTCDay();
  const weekday = WEEKDAY_NAMES[dayOfWeek];
  const month = MONTH_NAMES[monthIndex];
  return `${weekday}, ${day} ${month} ${year}`;
}

/**
 * Formats month and year:
 * Example: "October 2026"
 */
export function formatIndianMonthYear(year: number, monthIndex: number): string {
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

/**
 * Returns the number of days in a given year & month (monthIndex 0-11)
 */
export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/**
 * Returns the starting day of week for the 1st day of a month (0 = Sun, 6 = Sat)
 */
export function getMonthStartDayOfWeek(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
}

export interface DynamicMonthConfig {
  id: string; // e.g. "2026-10"
  label: string; // e.g. "October 2026"
  shortLabel: string; // e.g. "Oct"
  year: number;
  monthIndex: number; // 0-11
  daysCount: number;
  prefix: string; // "2026-10"
  isCurrentMonth: boolean;
}

/**
 * Returns dynamic month metadata for a specific year and monthIndex (0-11)
 */
export function getMonthConfig(year: number, monthIndex: number, currentTodayStr = getIndianTodayStr()): DynamicMonthConfig {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  const isCurrentMonth = currentTodayStr.startsWith(prefix);
  const daysCount = getDaysInMonth(year, monthIndex);
  return {
    id: prefix,
    label: formatIndianMonthYear(year, monthIndex),
    shortLabel: MONTH_NAMES_SHORT[monthIndex],
    year,
    monthIndex,
    daysCount,
    prefix,
    isCurrentMonth,
  };
}

/**
 * Returns the last N months up to and including the current month in IST.
 * For example, if today is Oct 2026 and count is 3: [August 2026, September 2026, October 2026]
 */
export function getRecentMonthsIST(count: number = 3): DynamicMonthConfig[] {
  const todayStr = getIndianTodayStr();
  const [currentYear, currentMonthIndex] = parseDateParts(todayStr);

  const months: DynamicMonthConfig[] = [];
  for (let i = count - 1; i >= 0; i--) {
    let year = currentYear;
    let monthIndex = currentMonthIndex - i;
    while (monthIndex < 0) {
      monthIndex += 12;
      year -= 1;
    }
    months.push(getMonthConfig(year, monthIndex, todayStr));
  }
  return months;
}
