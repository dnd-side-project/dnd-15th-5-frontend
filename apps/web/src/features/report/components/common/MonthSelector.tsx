import { CaretLeftIcon, CaretRightIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';
import type { YearMonth } from '@/shared/types/yearMonth';

type MonthSelectorProps = {
  className?: string;
  hasNewerMonth: boolean;
  hasOlderMonth: boolean;
  headingAs?: 'div' | 'h1';
  headingLabel: string;
  isMonthPickerOpen?: boolean;
  onMonthClick?: () => void;
  onNewerMonth: () => void;
  onOlderMonth: () => void;
  selectedMonth: YearMonth;
  variant?: 'default' | 'prominent';
};

/** 리포트 화면에서 월 이동과 현재 월 표시를 동일하게 제공하는 공통 선택기입니다. */
export default function MonthSelector({
  className,
  hasNewerMonth,
  hasOlderMonth,
  headingAs: Heading = 'h1',
  headingLabel,
  isMonthPickerOpen = false,
  onMonthClick,
  onNewerMonth,
  onOlderMonth,
  selectedMonth,
  variant = 'default',
}: MonthSelectorProps) {
  const isProminent = variant === 'prominent';

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        isProminent ? 'gap-1.5' : 'gap-0.5',
        className
      )}
    >
      <button
        aria-label="이전 달 보기"
        className="flex size-6 items-center justify-center text-neutral-900 disabled:text-neutral-400"
        disabled={!hasOlderMonth}
        onClick={onOlderMonth}
        type="button"
      >
        <CaretLeftIcon aria-hidden="true" className="size-6" />
      </button>
      <Heading aria-label={headingLabel}>
        {onMonthClick ? (
          <button
            aria-expanded={isMonthPickerOpen}
            aria-label="월 선택"
            className={cn(
              'text-neutral-900',
              isProminent ? 'min-w-7.5 text-title-01-semibold' : 'min-w-10 text-title-02-bold'
            )}
            onClick={onMonthClick}
            type="button"
          >
            {selectedMonth.month}월
          </button>
        ) : (
          <span
            className={cn(
              'block text-center text-neutral-900',
              isProminent ? 'min-w-7.5 text-title-01-semibold' : 'min-w-10 text-title-02-bold'
            )}
          >
            {selectedMonth.month}월
          </span>
        )}
      </Heading>
      <button
        aria-label="다음 달 보기"
        className="flex size-6 items-center justify-center text-neutral-900 disabled:text-neutral-400"
        disabled={!hasNewerMonth}
        onClick={onNewerMonth}
        type="button"
      >
        <CaretRightIcon aria-hidden="true" className="size-6" />
      </button>
    </div>
  );
}
