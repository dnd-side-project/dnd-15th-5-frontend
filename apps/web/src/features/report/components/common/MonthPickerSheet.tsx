import { useState } from 'react';

import { CheckIcon } from '@/shared/assets/icons';
import type { YearMonth } from '@/shared/types/yearMonth';
import type { BottomSheetSnapPoint } from '@/shared/ui/bottom-sheet';
import { PickerSheet } from '@/shared/ui/picker-sheet';
import { formatMonthLabel, isSameMonth } from '@/shared/utils/yearMonth';

import type { UIEvent } from 'react';

type MonthPickerSheetProps = {
  months: readonly YearMonth[];
  onClose: () => void;
  onSelect: (month: YearMonth) => void;
  selectedMonth: YearMonth;
};

const MONTH_PICKER_SNAP_POINTS = ['hidden', 'large', 'full'] as const;

/** 월 목록과 선택 상태를 보여주며, 목록 스크롤 시 전체 높이로 확장되는 월 선택 바텀시트입니다. */
export default function MonthPickerSheet({
  months,
  onClose,
  onSelect,
  selectedMonth,
}: MonthPickerSheetProps) {
  const [snapPoint, setSnapPoint] = useState<Exclude<BottomSheetSnapPoint, 'hidden'>>('large');

  const handleMonthListScroll = (event: UIEvent<HTMLUListElement>) => {
    if (snapPoint === 'large' && event.currentTarget.scrollTop > 0) {
      setSnapPoint('full');
    }
  };

  return (
    <PickerSheet
      ariaLabelledBy="month-picker-title"
      contentClassName="overflow-hidden px-0 pb-0"
      dialogClassName="flex h-full min-h-0 flex-col"
      initialFocusSelector={'[aria-pressed="true"]'}
      onClose={onClose}
      onSnapPointChange={setSnapPoint}
      snapPoint={snapPoint}
      snapPoints={MONTH_PICKER_SNAP_POINTS}
    >
      <h2
        id="month-picker-title"
        className="shrink-0 px-4 pt-1 pb-4 text-title-02-bold text-neutral-900"
      >
        월 선택하기
      </h2>
      <ul
        onScroll={handleMonthListScroll}
        className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 pb-8"
      >
        {months.map((month) => {
          const isSelected = isSameMonth(month, selectedMonth);

          return (
            <li key={`${month.year}-${month.month}`}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(month)}
                className="flex h-13 w-full items-center justify-between rounded-08 text-left text-body-01-regular text-neutral-600 outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1"
              >
                <span>{formatMonthLabel(month)}</span>
                {isSelected && (
                  <CheckIcon aria-hidden="true" className="mr-1 w-4 text-primary-600" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </PickerSheet>
  );
}
