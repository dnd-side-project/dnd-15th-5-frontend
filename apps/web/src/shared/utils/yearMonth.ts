import type { YearMonth } from '@/shared/types/yearMonth';

const YEAR_MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

/** 기준 날짜가 속한 연월을 반환합니다. */
export const getCurrentMonth = (now = new Date()): YearMonth => ({
  month: now.getMonth() + 1,
  year: now.getFullYear(),
});

/** 연월을 지정한 개월 수만큼 이동합니다. */
export const addMonth = ({ month, year }: YearMonth, offset: number): YearMonth => {
  const date = new Date(year, month - 1 + offset, 1);

  return { month: date.getMonth() + 1, year: date.getFullYear() };
};

/** 두 연월이 같은지 확인합니다. */
export const isSameMonth = (month: YearMonth, target: YearMonth) =>
  month.year === target.year && month.month === target.month;

/** 첫 번째 연월이 기준 연월보다 이전인지 확인합니다. */
export const isBeforeMonth = (month: YearMonth, target: YearMonth) =>
  month.year < target.year || (month.year === target.year && month.month < target.month);

/** 두 연월 사이의 개월 수 차이를 반환합니다. */
export const getMonthDifference = (newerMonth: YearMonth, olderMonth: YearMonth) =>
  (newerMonth.year - olderMonth.year) * 12 + newerMonth.month - olderMonth.month;

/** 연월을 API와 쿼리 파라미터에서 사용하는 `YYYY-MM` 형식으로 변환합니다. */
export const formatYearMonth = ({ month, year }: YearMonth) =>
  `${year}-${String(month).padStart(2, '0')}`;

/** 연월을 화면에 표시하는 `YYYY년 M월` 형식으로 변환합니다. */
export const formatMonthLabel = ({ month, year }: YearMonth) => `${year}년 ${month}월`;

/** `YYYY-MM` 형식의 문자열을 연월로 변환합니다. */
export const parseYearMonth = (value?: string | null): YearMonth | null => {
  const match = value ? YEAR_MONTH_PATTERN.exec(value) : null;

  if (!match) return null;

  return { year: Number(match[1]), month: Number(match[2]) };
};

/** 값이 `YYYY-MM` 연월 형식인지 확인합니다. */
export const isValidYearMonth = (value?: string | null) => parseYearMonth(value) !== null;
