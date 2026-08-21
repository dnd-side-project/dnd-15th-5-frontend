import { useEffect, useRef, useState } from 'react';

import type { SpendingMonth } from '@/features/report/types';
import { CheckIcon } from '@/shared/assets/icons';
import { useOutsidePress } from '@/shared/hooks/useOutsidePress';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import type { BottomSheetSnapPoint } from '@/shared/ui/bottom-sheet';
import { Overlay } from '@/shared/ui/overlay';

type MonthPickerSheetProps = {
  months: readonly SpendingMonth[];
  onClose: () => void;
  onSelect: (month: SpendingMonth) => void;
  selectedMonth: SpendingMonth;
};

const isSameMonth = (month: SpendingMonth, target: SpendingMonth) =>
  month.year === target.year && month.month === target.month;

const formatMonth = ({ year, month }: SpendingMonth) => `${year}년 ${month}월`;
const MONTH_PICKER_SNAP_POINTS: readonly BottomSheetSnapPoint[] = ['small', 'large', 'full'];

/** 월 목록과 선택 상태를 보여주는 드래그 가능한 월 선택 바텀시트입니다. */
export default function MonthPickerSheet({
  months,
  onClose,
  onSelect,
  selectedMonth,
}: MonthPickerSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [snapPoint, setSnapPoint] = useState<BottomSheetSnapPoint>('large');

  useScrollLock();
  useOutsidePress(sheetRef, onClose);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSnapPointChange = (nextSnapPoint: BottomSheetSnapPoint) => {
    if (nextSnapPoint === 'hidden') {
      onClose();
      return;
    }

    setSnapPoint(nextSnapPoint);
  };

  return (
    <>
      <Overlay />
      <BottomSheet
        rootRef={sheetRef}
        snapPoint={snapPoint}
        snapPoints={MONTH_PICKER_SNAP_POINTS}
        onSnapPointChange={handleSnapPointChange}
        contentClassName="overflow-hidden px-0 pb-0"
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="month-picker-title"
          className="flex h-full min-h-0 flex-col"
        >
          <h2
            id="month-picker-title"
            className="shrink-0 px-4 pt-1 pb-4 text-title-02-bold text-neutral-900"
          >
            월 선택하기
          </h2>
          <ul className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 pb-8">
            {months.map((month) => {
              const isSelected = isSameMonth(month, selectedMonth);

              return (
                <li key={`${month.year}-${month.month}`}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onSelect(month)}
                    className="flex h-13 w-full items-center justify-between text-left text-body-01-regular text-neutral-600"
                  >
                    <span>{formatMonth(month)}</span>
                    {isSelected && (
                      <CheckIcon aria-hidden="true" className="mr-1 w-4 text-primary-600" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </BottomSheet>
    </>
  );
}
