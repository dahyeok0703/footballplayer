/* ================================================================
 *  캘린더 / 날짜 유틸리티
 * ================================================================ */

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export function daysInMonth(month) { return MONTH_DAYS[month - 1]; }

export function nextDay(date) {
  let { year, month, day } = date;
  day++;
  if (day > daysInMonth(month)) {
    day = 1; month++;
    if (month > 12) { month = 1; year++; }
  }
  return { year, month, day };
}

export function addDays(date, n) {
  let d = { ...date };
  for (let i = 0; i < n; i++) d = nextDay(d);
  return d;
}

export function compareDate(a, b) {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function sameDate(a, b) {
  return a && b && a.year === b.year && a.month === b.month && a.day === b.day;
}

export function getDayOfWeek(d) {
  // Zeller (returns 0=Sunday)
  let { year, month, day } = d;
  if (month < 3) { month += 12; year--; }
  const K = year % 100;
  const J = Math.floor(year / 100);
  const h = (day + Math.floor(13 * (month + 1) / 5) + K + Math.floor(K / 4) + Math.floor(J / 4) - 2 * J) % 7;
  return ((h + 6) % 7 + 7) % 7;
}

export function dateLabel(d) {
  return `${d.year}년 ${d.month}월 ${d.day}일 (${DAY_NAMES[getDayOfWeek(d)]})`;
}

export function shortDate(d) {
  return `${d.month}/${d.day} ${DAY_NAMES[getDayOfWeek(d)]}`;
}

export function daysBetween(a, b) {
  // 정확하지 않지만 충분 (한 시즌 내)
  const A = a.year * 372 + (a.month - 1) * 31 + a.day;
  const B = b.year * 372 + (b.month - 1) * 31 + b.day;
  return B - A;
}

// 시즌 시작일 = 8월 1일
export const SEASON_START = { month: 8, day: 1 };
// 시즌 종료일 = 다음해 7월 31일
export function isSeasonEnd(date) {
  // 새 시즌이 시작되기 직전 (7월 31일까지가 이전 시즌)
  return date.month === 7 && date.day >= 31;
}
