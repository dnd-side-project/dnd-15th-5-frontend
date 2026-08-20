import {
  createMonthDate,
  getCalendarDays,
  getVisitPeriodLabel,
  isSameDate,
  isSameOrAfterMonth,
  VISIT_PERIODS,
  WEEKDAY_LABELS,
} from '@chapchap/shared/record';
import { useState } from 'react';

import { ChevronLeftIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';

import { useBottomSheetTransition } from '../hooks/useBottomSheetTransition';

import type { VisitDateTimeValue } from '@chapchap/shared/record';

const SUNDAY_INDEX = 0;
const SATURDAY_INDEX = 6;

const getWeekdayLabelClassName = (index: number) => {
  if (index === SUNDAY_INDEX) {
    return 'text-notification';
  }
  if (index === SATURDAY_INDEX) {
    return 'text-primary-500';
  }
  return 'text-neutral-500';
};

const getCalendarDayClassName = (weekday: number, selected: boolean, disabled: boolean) => {
  if (disabled) {
    return 'text-neutral-300';
  }
  if (selected) {
    return 'bg-primary-500 text-neutral-00';
  }
  if (weekday === SUNDAY_INDEX) {
    return 'text-notification hover:bg-neutral-50';
  }
  if (weekday === SATURDAY_INDEX) {
    return 'text-primary-500 hover:bg-neutral-50';
  }
  return 'text-neutral-700 hover:bg-neutral-50';
};

type VisitDateTimePickerProps = {
  value: VisitDateTimeValue;
  onClose: () => void;
  onConfirm: (value: VisitDateTimeValue) => void;
};

/** 과거 방문 날짜와 시간대를 선택하는 웹 기록 바텀시트. */
export default function VisitDateTimePicker({
  value,
  onClose,
  onConfirm,
}: VisitDateTimePickerProps) {
  const { closeBottomSheet, isVisible } = useBottomSheetTransition(onClose);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date(value.date.getFullYear(), value.date.getMonth(), value.date.getDate())
  );
  const [selectedPeriod, setSelectedPeriod] = useState(value.period);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(value.date.getFullYear(), value.date.getMonth(), 1)
  );

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isNextMonthDisabled = isSameOrAfterMonth(visibleMonth, today);
  const calendarDays = getCalendarDays(visibleMonth);
  const confirmLabel = `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 ${getVisitPeriodLabel(
    selectedPeriod
  )}`;

  const handleConfirm = () => {
    closeBottomSheet(() => onConfirm({ date: selectedDate, period: selectedPeriod }));
  };

  return (
    <>
      <button
        type="button"
        aria-label="방문 일시 선택 닫기"
        onClick={() => closeBottomSheet()}
        className={cn(
          'fixed inset-0 z-10 mx-auto w-full max-w-120 bg-neutral-900/30 transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
      />
      <BottomSheet snapPoint={isVisible ? 'medium' : 'hidden'} fitContent>
        <div role="dialog" aria-modal="true" aria-label="방문 일시 선택" className="flex flex-col">
          <div className="mt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              aria-label="이전 달"
              onClick={() => setVisibleMonth((current) => createMonthDate(current, -1))}
              className="flex size-7 items-center justify-center rounded-full text-neutral-600 outline-none hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-primary-300 [&_svg]:h-3 [&_svg]:w-1.5"
            >
              <ChevronLeftIcon aria-hidden="true" />
            </button>
            <strong className="min-w-25 text-center text-body-01-medium text-neutral-700">
              {year}년 {month + 1}월
            </strong>
            <button
              type="button"
              aria-label="다음 달"
              disabled={isNextMonthDisabled}
              onClick={() => setVisibleMonth((current) => createMonthDate(current, 1))}
              className="flex size-7 items-center justify-center rounded-full text-neutral-600 outline-none hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-primary-300 disabled:text-neutral-300 disabled:hover:bg-transparent [&_svg]:h-3 [&_svg]:w-1.5 [&_svg]:rotate-180"
            >
              <ChevronLeftIcon aria-hidden="true" />
            </button>
          </div>

          <div className="mt-2 grid grid-cols-7 text-center text-caption-01-regular">
            {WEEKDAY_LABELS.map((weekday, index) => (
              <span key={weekday} className={getWeekdayLabelClassName(index)}>
                {weekday}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 justify-items-center gap-y-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <span key={`empty-${index}`} className="size-9" aria-hidden="true" />;
              }

              const date = new Date(year, month, day);
              const selected = isSameDate(date, selectedDate);
              const isFutureDate = date.getTime() > today.getTime();
              const weekday = index % WEEKDAY_LABELS.length;

              return (
                <button
                  key={`${year}-${month}-${day}`}
                  type="button"
                  aria-label={`${year}년 ${month + 1}월 ${day}일`}
                  aria-pressed={selected}
                  disabled={isFutureDate}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-32 text-body-02-medium outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1',
                    getCalendarDayClassName(weekday, selected, isFutureDate)
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {VISIT_PERIODS.map((period) => {
              const selected = selectedPeriod === period.value;

              return (
                <button
                  key={period.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-16 border px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1',
                    selected
                      ? 'border-primary-500 bg-primary-500 text-neutral-00'
                      : 'border-neutral-300 bg-neutral-00 text-neutral-600 hover:bg-neutral-50'
                  )}
                >
                  <span className="text-body-01-semibold">{period.label}</span>
                  <span
                    className={cn(
                      'mt-1 text-caption-01-regular',
                      selected ? 'text-primary-100' : 'text-neutral-500'
                    )}
                  >
                    {period.range}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-12 px-1">
            <Button onClick={handleConfirm}>{confirmLabel}</Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
