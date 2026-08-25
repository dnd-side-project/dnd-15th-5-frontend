import { useRef } from 'react';

import type { FrequentShopPeriod } from '@/features/report/types';
import { CheckIcon } from '@/shared/assets/icons';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { useOutsidePress } from '@/shared/hooks/useOutsidePress';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import type { BottomSheetSnapPoint } from '@/shared/ui/bottom-sheet';
import { Overlay } from '@/shared/ui/overlay';

type PeriodFilterSheetProps = {
  onClose: () => void;
  onSelect: (period: FrequentShopPeriod) => void;
  selectedPeriod: FrequentShopPeriod;
};

const PERIOD_OPTIONS = [
  { label: '이번달', value: 'currentMonth' },
  { label: '전체', value: 'all' },
] as const satisfies readonly { label: string; value: FrequentShopPeriod }[];

const PERIOD_FILTER_SNAP_POINTS = ['hidden', 'medium'] as const;

/** 단골 순위의 집계 기간을 선택하는 바텀시트입니다. */
export default function PeriodFilterSheet({
  onClose,
  onSelect,
  selectedPeriod,
}: PeriodFilterSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useScrollLock();
  useOutsidePress(sheetRef, onClose);
  useFocusTrap(sheetRef, { initialFocusSelector: '[aria-pressed="true"]', onEscape: onClose });

  const handleSnapPointChange = (snapPoint: BottomSheetSnapPoint) => {
    if (snapPoint === 'hidden') {
      onClose();
    }
  };

  return (
    <>
      <Overlay />
      <BottomSheet
        rootRef={sheetRef}
        snapPoint="medium"
        snapPoints={PERIOD_FILTER_SNAP_POINTS}
        onSnapPointChange={handleSnapPointChange}
        fitContent
        contentClassName="px-5 pt-2 pb-9.5"
      >
        <section role="dialog" aria-modal="true" aria-labelledby="period-filter-title">
          <h2
            id="period-filter-title"
            className="px-2 pt-1 pb-3 text-title-01-bold text-neutral-900"
          >
            기간
          </h2>
          <ul>
            {PERIOD_OPTIONS.map(({ label, value }) => {
              const isSelected = value === selectedPeriod;

              return (
                <li key={value}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onSelect(value)}
                    className="flex h-13 w-full items-center justify-between rounded-08 px-2 text-body-01-medium text-neutral-600 outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1"
                  >
                    <span>{label}</span>
                    {isSelected && (
                      <span className="flex size-8 items-center justify-center text-primary-500">
                        <CheckIcon aria-hidden="true" className="w-4" />
                      </span>
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
