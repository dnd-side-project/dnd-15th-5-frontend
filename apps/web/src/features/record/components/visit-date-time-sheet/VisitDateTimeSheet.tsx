import { formatVisitDateTimeConfirmLabel, getCalendarWeekCount } from '@chapchap/shared/record';
import { useState } from 'react';

import { Button } from '@/shared/ui/button';
import { PickerSheet } from '@/shared/ui/picker-sheet';

import VisitDateCalendar from './VisitDateCalendar';
import VisitPeriodSelector from './VisitPeriodSelector';

import type { VisitDateTimeValue } from '@chapchap/shared/record';

const DATE_TIME_SHEET_SNAP_POINTS = ['hidden', 'medium'] as const;
const FULL_CALENDAR_WEEK_COUNT = 6;

type VisitDateTimeSheetProps = {
  onClose: () => void;
  onConfirm: (value: VisitDateTimeValue) => void;
  value: VisitDateTimeValue;
};

const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** 소비 기록의 방문 날짜와 시간대를 선택하는 바텀시트입니다. */
export default function VisitDateTimeSheet({ onClose, onConfirm, value }: VisitDateTimeSheetProps) {
  const [selectedDate, setSelectedDate] = useState(() => normalizeDate(value.date));
  const [selectedPeriod, setSelectedPeriod] = useState(value.period);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(value.date.getFullYear(), value.date.getMonth(), 1)
  );
  const confirmedValue = { date: selectedDate, period: selectedPeriod };
  const confirmLabel = formatVisitDateTimeConfirmLabel(confirmedValue);
  const missingCalendarWeekCount = Math.max(
    FULL_CALENDAR_WEEK_COUNT - getCalendarWeekCount(visibleMonth),
    0
  );
  const calendarHeightSpacerClassName =
    missingCalendarWeekCount === 2 ? 'h-20' : missingCalendarWeekCount === 1 ? 'h-10' : null;

  return (
    <PickerSheet
      animated
      ariaLabel="방문 일시 선택"
      dialogClassName="flex flex-col"
      fitContent
      onClose={onClose}
      snapPoint="medium"
      snapPoints={DATE_TIME_SHEET_SNAP_POINTS}
    >
      {({ close }) => (
        <>
          <VisitDateCalendar
            onSelect={setSelectedDate}
            onVisibleMonthChange={setVisibleMonth}
            selectedDate={selectedDate}
            visibleMonth={visibleMonth}
          />
          <VisitPeriodSelector onSelect={setSelectedPeriod} selectedPeriod={selectedPeriod} />
          {calendarHeightSpacerClassName && (
            <div
              aria-hidden="true"
              className={calendarHeightSpacerClassName}
              data-testid="calendar-height-spacer"
            />
          )}

          <div className="mt-12 px-1">
            <Button onClick={() => close(() => onConfirm(confirmedValue))}>{confirmLabel}</Button>
          </div>
        </>
      )}
    </PickerSheet>
  );
}
