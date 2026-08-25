import { getVisitPeriodForHour } from '@chapchap/shared/record';

import type { VisitDateTimeValue } from '@chapchap/shared/record';

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/u;
const TIME_PATTERN = /^(\d{2}):(\d{2})(?::(\d{2}))?$/u;

/** OCR 날짜·시각을 유효하고 미래가 아닌 방문 일시로 변환한다. */
export const parseReceiptVisitDateTime = (
  purchaseDate?: string | null,
  purchaseTime?: string | null,
  now = new Date()
): VisitDateTimeValue | undefined => {
  const dateMatch = purchaseDate?.match(DATE_PATTERN);

  if (!dateMatch) {
    return undefined;
  }

  const [, yearText, monthText, dayText] = dateMatch;
  const timeMatch = purchaseTime?.match(TIME_PATTERN);

  if (purchaseTime && !timeMatch) {
    return undefined;
  }

  const hour = timeMatch ? Number(timeMatch[1]) : now.getHours();
  const minute = timeMatch ? Number(timeMatch[2]) : 0;
  const second = timeMatch?.[3] ? Number(timeMatch[3]) : 0;
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);
  const date = new Date(year, month, day, hour, minute, second);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute ||
    date.getSeconds() !== second ||
    date.getTime() > now.getTime()
  ) {
    return undefined;
  }

  return { date, period: getVisitPeriodForHour(hour) };
};
