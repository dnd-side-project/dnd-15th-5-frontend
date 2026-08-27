import {
  createMonthDate,
  getCalendarDays,
  isSameDate,
  isSameOrAfterMonth,
  WEEKDAY_LABELS,
} from '@chapchap/shared/record';
import { useState } from 'react';

import { ChevronLeftIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';

const SUNDAY_INDEX = 0;
const SATURDAY_INDEX = 6;

const getWeekdayLabelClassName = (index: number) => {
  if (index === SUNDAY_INDEX) return 'text-notification';
  if (index === SATURDAY_INDEX) return 'text-primary-500';
  return 'text-neutral-500';
};

const getCalendarDayClassName = (weekday: number, isSelected: boolean, isDisabled: boolean) => {
  if (isDisabled) return 'text-neutral-300';
  if (isSelected) return 'bg-primary-500 text-neutral-00';
  if (weekday === SUNDAY_INDEX) return 'text-notification hover:bg-neutral-50';
  if (weekday === SATURDAY_INDEX) return 'text-primary-500 hover:bg-neutral-50';
  return 'text-neutral-700 hover:bg-neutral-50';
};

type VisitDateCalendarProps = {
  onSelect: (date: Date) => void;
  selectedDate: Date;
};

/** 방문 날짜 선택에 필요한 월 이동과 과거 날짜 달력을 표시합니다. */
export default function VisitDateCalendar({ onSelect, selectedDate }: VisitDateCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isNextMonthDisabled = isSameOrAfterMonth(visibleMonth, today);
  const calendarDays = getCalendarDays(visibleMonth);

  return (
    <>
      <div className="mt-2 flex items-center justify-center gap-3">
        <button
          aria-label="이전 달"
          className="flex size-7 items-center justify-center rounded-full text-neutral-600 outline-none hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-primary-300 [&_svg]:h-3 [&_svg]:w-1.5"
          onClick={() => setVisibleMonth((current) => createMonthDate(current, -1))}
          type="button"
        >
          <ChevronLeftIcon aria-hidden="true" />
        </button>
        <strong className="min-w-25 text-center text-body-01-medium text-neutral-700">
          {year}년 {month + 1}월
        </strong>
        <button
          aria-label="다음 달"
          className="flex size-7 items-center justify-center rounded-full text-neutral-600 outline-none hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-primary-300 disabled:text-neutral-300 disabled:hover:bg-transparent [&_svg]:h-3 [&_svg]:w-1.5 [&_svg]:rotate-180"
          disabled={isNextMonthDisabled}
          onClick={() => setVisibleMonth((current) => createMonthDate(current, 1))}
          type="button"
        >
          <ChevronLeftIcon aria-hidden="true" />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 text-center text-caption-01-regular">
        {WEEKDAY_LABELS.map((weekday, index) => (
          <span className={getWeekdayLabelClassName(index)} key={weekday}>
            {weekday}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 justify-items-center gap-y-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <span aria-hidden="true" className="size-9" key={`empty-${index}`} />;
          }

          const date = new Date(year, month, day);
          const isSelected = isSameDate(date, selectedDate);
          const isFutureDate = date.getTime() > today.getTime();
          const weekday = index % WEEKDAY_LABELS.length;

          return (
            <button
              aria-label={`${year}년 ${month + 1}월 ${day}일`}
              aria-pressed={isSelected}
              className={cn(
                'flex size-9 items-center justify-center rounded-32 text-body-02-medium outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1',
                getCalendarDayClassName(weekday, isSelected, isFutureDate)
              )}
              disabled={isFutureDate}
              key={`${year}-${month}-${day}`}
              onClick={() => onSelect(date)}
              type="button"
            >
              {day}
            </button>
          );
        })}
      </div>
    </>
  );
}
