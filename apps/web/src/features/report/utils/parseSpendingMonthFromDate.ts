import type { SpendingMonth } from '../types';

/** `YYYY-MM-DD` 날짜 문자열에서 소비내역의 연도와 월을 추출합니다. */
export function parseSpendingMonthFromDate(dateValue?: string): SpendingMonth | null {
  const match = dateValue?.match(/^(\d{4})-(\d{2})-\d{2}$/);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (month < 1 || month > 12) return null;

  return { month, year };
}
