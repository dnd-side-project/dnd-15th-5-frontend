import { createInitialVisitDateTime } from '@chapchap/shared/record';

import { parseYearMonth } from '@/shared/utils/yearMonth';

/** 요청한 과거 월의 말일 또는 현재 날짜를 방문 일시 초기값으로 만듭니다. */
export const createInitialVisitDateTimeForMonth = (yearMonth: string | null, now = new Date()) => {
  const initialVisitDateTime = createInitialVisitDateTime(now);
  const requestedMonth = parseYearMonth(yearMonth);

  if (!requestedMonth) return initialVisitDateTime;

  const lastDayOfMonth = new Date(requestedMonth.year, requestedMonth.month, 0);

  return {
    ...initialVisitDateTime,
    date: lastDayOfMonth.getTime() < now.getTime() ? lastDayOfMonth : now,
  };
};
