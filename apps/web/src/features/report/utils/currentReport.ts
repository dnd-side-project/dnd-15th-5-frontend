import type { CurrentStatusResponse } from '@/features/report/apis/dto';
import type { WeeklyRecord } from '@/features/report/types';
import { getStickerImageByName } from '@/shared/assets/images/stickers';

const DAYS_IN_WEEK = 7;
const MAX_VISIBLE_STICKERS = 5;
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** Date 객체를 API와 라우트에서 사용하는 yyyy-MM-dd 형식으로 변환합니다. */
const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/** Date 객체를 리포트 조회 파라미터인 yyyy-MM 형식으로 변환합니다. */
export const formatYearMonth = (date: Date) =>
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

  if (formatYearMonth(fallbackDate) === fallbackYearMonth) return fallbackDate;

  const matchedYearMonth = fallbackYearMonth.match(/^(\d{4})-(\d{2})$/);
  if (matchedYearMonth) {
    const [, year, month] = matchedYearMonth;
    return new Date(Number(year), Number(month) - 1, 1);
  }

  return new Date();
};

/**
 * 서버의 일요일 시작 주간 소비 건수를 날짜 정보가 포함된 7일치 화면 데이터로 변환합니다.
 * 서버 기준일 이후의 날짜는 미래로, 기준일은 오늘로 표시합니다.
 */
const createWeeklyRecords = (
  statusDate: Date,
  weeklyCounts: NonNullable<CurrentStatusResponse['weeklyCounts']>
) => {
  const startDate = new Date(statusDate);
  startDate.setDate(statusDate.getDate() - statusDate.getDay());

  return Array.from({ length: DAYS_IN_WEEK }, (_, index): WeeklyRecord => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const count = weeklyCounts[index] ?? 0;

    return {
      ...(count > 0 ? { count } : {}),
      date: date.getDate(),
      dateValue: formatDateValue(date),
      day: WEEKDAY_LABELS[index],
      ...(index > statusDate.getDay() ? { isFuture: true } : {}),
      ...(index === statusDate.getDay() ? { isToday: true } : {}),
    };
  });
};

/** 주간 기록의 시작일과 종료일을 화면에 표시할 한국어 기간 문구로 변환합니다. */
const formatWeeklyPeriod = (weeklyRecords: readonly WeeklyRecord[]) => {
  const firstRecord = weeklyRecords[0];
  const lastRecord = weeklyRecords[weeklyRecords.length - 1];

  if (!firstRecord || !lastRecord) return '';

  const startMonth = Number(firstRecord.dateValue.slice(5, 7));
  const endMonth = Number(lastRecord.dateValue.slice(5, 7));
  const endMonthLabel = startMonth === endMonth ? '' : `${endMonth}월 `;

  return `${startMonth}월 ${firstRecord.date}일부터 ${endMonthLabel}${lastRecord.date}일까지`;
};

/**
 * 현재 리포트 API 응답을 메인 리포트 화면 모델로 변환합니다.
 * 스티커는 최대 5개까지만 이미지로 노출하고 나머지는 추가 개수로 집계합니다.
 */
export const mapCurrentStatusToReportPageData = (
  status: CurrentStatusResponse | undefined,
  requestedYearMonth: string,
  fallbackDate = new Date()
) => {
  const statusDate = parseStatusDate(status?.date, requestedYearMonth, fallbackDate);
  const weeklyRecords = createWeeklyRecords(statusDate, status?.weeklyCounts ?? []);
  const monthlyRecordCount = status?.monthlyCount ?? 0;
  const monthlyStickerImages = (status?.monthlyStickers ?? [])
    .flatMap(({ itemName }) => {
      const stickerImage = getStickerImageByName(itemName);

      return stickerImage ? [stickerImage] : [];
    })
    .slice(0, MAX_VISIBLE_STICKERS);

  return {
    monthLabel: `${statusDate.getMonth() + 1}월`,
    monthlyAdditionalStickerCount: Math.max(monthlyRecordCount - monthlyStickerImages.length, 0),
    monthlyRecordCount,
    monthlyStickerImages,
    recentDiscovery: status?.recentDiscoveryMessage?.trim() ?? '',
    weeklyPeriodLabel: formatWeeklyPeriod(weeklyRecords),
    weeklyRecords,
  };
};
