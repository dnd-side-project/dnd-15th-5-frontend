import { VISIT_PERIODS } from '@chapchap/shared/record';

import { cn } from '@/shared/lib/cn';

import type { VisitDateTimeValue } from '@chapchap/shared/record';

type VisitPeriodSelectorProps = {
  onSelect: (period: VisitDateTimeValue['period']) => void;
  selectedPeriod: VisitDateTimeValue['period'];
};

/** 방문 시간대 선택지를 표시합니다. */
export default function VisitPeriodSelector({
  onSelect,
  selectedPeriod,
}: VisitPeriodSelectorProps) {
  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      {VISIT_PERIODS.map((period) => {
        const isSelected = selectedPeriod === period.value;

        return (
          <button
            aria-pressed={isSelected}
            className={cn(
              'flex flex-col items-center justify-center rounded-16 border px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1',
              isSelected
                ? 'border-primary-500 bg-primary-500 text-neutral-00'
                : 'border-neutral-300 bg-neutral-00 text-neutral-600 hover:bg-neutral-50'
            )}
            key={period.value}
            onClick={() => onSelect(period.value)}
            type="button"
          >
            <span className="text-body-01-semibold">{period.label}</span>
            <span
              className={cn(
                'mt-1 text-caption-01-regular',
                isSelected ? 'text-primary-100' : 'text-neutral-500'
              )}
            >
              {period.range}
            </span>
          </button>
        );
      })}
    </div>
  );
}
