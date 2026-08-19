import { VISIT_PERIODS } from '../constants';

import type { VisitDateTimeValue, VisitPeriod } from '../types';

const DAYS_PER_WEEK = 7;
const MORNING_START_HOUR = 5;
const AFTERNOON_START_HOUR = 11;
const EVENING_START_HOUR = 17;
const NIGHT_START_HOUR = 21;

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

export const getVisitPeriodLabel = (period: VisitPeriod) =>
  VISIT_PERIODS.find((item) => item.value === period)?.label ?? '';

export const formatVisitDateTime = ({ date, period }: VisitDateTimeValue) => {
  const weekday = new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(date);

  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday}) · ${getVisitPeriodLabel(
    period
  )}`;
};

export const createMonthDate = (date: Date, monthOffset: number) =>
  new Date(date.getFullYear(), date.getMonth() + monthOffset, 1);

export const isSameDate = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const isSameMonth = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();

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
