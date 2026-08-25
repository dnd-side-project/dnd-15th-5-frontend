import type { SpendingMonth } from '@/features/report/types';

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

const isLeapYear = (year: number) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

/** 유효한 `YYYY-MM-DD` 날짜 문자열에서 소비내역의 연도와 월을 추출합니다. */
export function parseSpendingMonthFromDate(dateValue?: string): SpendingMonth | null {
  const match = dateValue?.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12) return null;

  const lastDay = month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1];

  if (day < 1 || day > lastDay) return null;

  return { month, year };
}
