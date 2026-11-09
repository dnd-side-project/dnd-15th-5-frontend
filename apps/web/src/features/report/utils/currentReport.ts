import type { CurrentStatusResponse } from '@/features/report/apis/dto';

/** Date 객체를 API와 라우트에서 사용하는 yyyy-MM-dd 형식으로 변환합니다. */
const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/** Date 객체를 리포트 조회 파라미터인 yyyy-MM 형식으로 변환합니다. */
export const formatDateYearMonth = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

/**
 * 서버 기준일을 Date 객체로 변환합니다.
 * 기준일이 없거나 유효하지 않으면 요청 월과 일치하는 fallbackDate를 사용하고,
 * 일치하지 않으면 요청 월의 1일을 사용합니다.
 */
const parseStatusDate = (
  dateValue: CurrentStatusResponse['date'],
  fallbackYearMonth: string,
  fallbackDate: Date
) => {
  const matchedDate = dateValue?.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (matchedDate) {
    const [, year, month, day] = matchedDate;
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

    if (formatDateValue(parsedDate) === dateValue) return parsedDate;
  }

  if (formatDateYearMonth(fallbackDate) === fallbackYearMonth) return fallbackDate;

  const matchedYearMonth = fallbackYearMonth.match(/^(\d{4})-(\d{2})$/);
  if (matchedYearMonth) {
    const [, year, month] = matchedYearMonth;
    return new Date(Number(year), Number(month) - 1, 1);
  }

  return new Date();
};

/** 서버 기준일을 바탕으로 배너에 표시할 월을 계산합니다. */
export const mapCurrentStatusToReportPageData = (
  status: CurrentStatusResponse | undefined,
  requestedYearMonth: string,
  fallbackDate = new Date()
) => {
  const statusDate = parseStatusDate(status?.date, requestedYearMonth, fallbackDate);

  return { monthLabel: `${statusDate.getMonth() + 1}월` };
};
