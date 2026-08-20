const DAYS_PER_WEEK = 7;
const MORNING_START_HOUR = 5;
const AFTERNOON_START_HOUR = 11;
const EVENING_START_HOUR = 17;
const NIGHT_START_HOUR = 21;

/** 일요일부터 시작하는 한국어 요일 라벨. */
export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** 기록 UI에서 사용하는 시간대와 표시 범위. */
export const VISIT_PERIODS = [
  { value: 'morning', label: '오전', range: '05–11시' },
  { value: 'afternoon', label: '오후', range: '11–17시' },
  { value: 'evening', label: '저녁', range: '17–21시' },
  { value: 'night', label: '밤', range: '21–05시' },
] as const;

export type VisitPeriod = (typeof VISIT_PERIODS)[number]['value'];

/** 날짜와 하루 중 방문 시간대를 함께 보관하는 기록 값. */
export type VisitDateTimeValue = {
  date: Date;
  period: VisitPeriod;
};

/** 현재 시각을 기준으로 기록 폼의 초기 방문 일시를 만든다. */
export const createInitialVisitDateTime = (now = new Date()): VisitDateTimeValue => ({
  date: now,
  period: getVisitPeriodForHour(now.getHours()),
});

/** 24시간제 시각을 기록 UI의 네 시간대 중 하나로 분류한다. */
export const getVisitPeriodForHour = (hour: number): VisitPeriod => {
  if (hour >= MORNING_START_HOUR && hour < AFTERNOON_START_HOUR) {
    return 'morning';
  }
  if (hour >= AFTERNOON_START_HOUR && hour < EVENING_START_HOUR) {
    return 'afternoon';
  }
  if (hour >= EVENING_START_HOUR && hour < NIGHT_START_HOUR) {
    return 'evening';
  }
  return 'night';
};

/** 시간대 값에 대응하는 한국어 라벨을 반환한다. */
export const getVisitPeriodLabel = (period: VisitPeriod) =>
  VISIT_PERIODS.find((item) => item.value === period)?.label ?? '';

/** 기록의 방문 날짜와 시간대를 사용자에게 보여줄 한국어 문자열로 만든다. */
export const formatVisitDateTime = ({ date, period }: VisitDateTimeValue) => {
  const weekday = new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(date);

  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday}) · ${getVisitPeriodLabel(period)}`;
};

/** 기준 날짜에서 월 단위로 이동한 달의 1일을 만든다. */
export const createMonthDate = (date: Date, monthOffset: number) =>
  new Date(date.getFullYear(), date.getMonth() + monthOffset, 1);

/** 두 날짜가 현지 시간 기준으로 같은 연·월·일인지 확인한다. */
export const isSameDate = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

/** 두 날짜가 현지 시간 기준으로 같은 연·월인지 확인한다. */
export const isSameMonth = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();

/** 첫 번째 날짜의 달이 기준 날짜의 달과 같거나 이후인지 확인한다. */
export const isSameOrAfterMonth = (date: Date, referenceDate: Date) => {
  const month = new Date(date.getFullYear(), date.getMonth(), 1);
  const referenceMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);

  return month.getTime() >= referenceMonth.getTime();
};

/** 해당 월을 일요일부터 토요일까지 7열로 렌더링할 날짜 셀 목록을 만든다. */
export const getCalendarDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / DAYS_PER_WEEK) * DAYS_PER_WEEK;

  return Array.from({ length: cellCount }, (_, index) => {
    const day = index - firstWeekday + 1;

    return day >= 1 && day <= daysInMonth ? day : null;
  });
};
