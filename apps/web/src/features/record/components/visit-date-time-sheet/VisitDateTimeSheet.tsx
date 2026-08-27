import { getVisitPeriodLabel } from '@chapchap/shared/record';
import { useState } from 'react';

import { Button } from '@/shared/ui/button';
import { PickerSheet } from '@/shared/ui/picker-sheet';

import VisitDateCalendar from './VisitDateCalendar';
import VisitPeriodSelector from './VisitPeriodSelector';

import type { VisitDateTimeValue } from '@chapchap/shared/record';

const DATE_TIME_SHEET_SNAP_POINTS = ['hidden', 'medium'] as const;

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
  const confirmLabel = `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 ${getVisitPeriodLabel(
    selectedPeriod
  )}`;
  const confirmedValue = { date: selectedDate, period: selectedPeriod };

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
          <VisitDateCalendar onSelect={setSelectedDate} selectedDate={selectedDate} />
          <VisitPeriodSelector onSelect={setSelectedPeriod} selectedPeriod={selectedPeriod} />

          <div className="mt-12 px-1">
            <Button onClick={() => close(() => onConfirm(confirmedValue))}>{confirmLabel}</Button>
          </div>
        </>
      )}
    </PickerSheet>
  );
}
