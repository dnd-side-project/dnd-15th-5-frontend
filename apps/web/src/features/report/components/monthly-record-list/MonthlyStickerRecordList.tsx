import { useState } from 'react';

import { useFirstAvailableYearMonthQuery } from '@/features/report/apis/hooks/useFirstAvailableYearMonthQuery';
import { useMonthlyStickerRecordsQuery } from '@/features/report/apis/hooks/useMonthlyStickerRecordsQuery';
import MonthlyRecordEmptyState from '@/features/report/components/common/MonthlyRecordEmptyState';
import MonthPickerSheet from '@/features/report/components/common/MonthPickerSheet';
import MonthSelector from '@/features/report/components/common/MonthSelector';
import MonthlyStickerRecordListSkeleton from '@/features/report/components/monthly-record-list/MonthlyStickerRecordListSkeleton';
import type { YearMonth } from '@/shared/types/yearMonth';
import { StateView } from '@/shared/ui/state-view';
import { StickerCollection } from '@/shared/ui/sticker-collection';
import {
  createYearMonthRange,
  getCurrentMonth,
  isBeforeMonth,
  isSameMonth,
} from '@/shared/utils/yearMonth';

import type { ReactNode } from 'react';

type MonthlyStickerRecordListProps = {
  headerContent?: ReactNode;
};

/** 선택한 월에 획득한 스티커를 날짜별 5열 슬롯으로 보여줍니다. */
export default function MonthlyStickerRecordList({ headerContent }: MonthlyStickerRecordListProps) {
  const currentMonth = getCurrentMonth();
  const [selectedMonth, setSelectedMonth] = useState<YearMonth>(currentMonth);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const stickerRecordsQuery = useMonthlyStickerRecordsQuery(selectedMonth);
  const firstAvailableYearMonthQuery = useFirstAvailableYearMonthQuery();
  const isPastMonth = isBeforeMonth(selectedMonth, currentMonth);
  const recordGroups = stickerRecordsQuery.data ?? [];
  const selectableMonths = createYearMonthRange(
    currentMonth,
    firstAvailableYearMonthQuery.data ?? currentMonth
  );
  const selectedMonthIndex = selectableMonths.findIndex((month) =>
    isSameMonth(month, selectedMonth)
  );
  const hasNewerMonth = selectedMonthIndex > 0;
  const hasOlderMonth = selectedMonthIndex >= 0 && selectedMonthIndex < selectableMonths.length - 1;

  const handleMonthSelect = (month: YearMonth) => {
    setSelectedMonth(month);
    setIsMonthPickerOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-sticky-header bg-neutral-00 pt-4 pb-4">
        {headerContent}
        <MonthSelector
          className="mt-5"
          hasNewerMonth={hasNewerMonth}
          hasOlderMonth={hasOlderMonth}
          headingLabel={`${selectedMonth.month}월에 쌓인 기록`}
          isMonthPickerOpen={isMonthPickerOpen}
          onMonthClick={() => setIsMonthPickerOpen(true)}
          onNewerMonth={() => setSelectedMonth(selectableMonths[selectedMonthIndex - 1])}
          onOlderMonth={() => setSelectedMonth(selectableMonths[selectedMonthIndex + 1])}
          selectedMonth={selectedMonth}
          variant="prominent"
        />
      </header>

      {stickerRecordsQuery.isPending ? (
        <MonthlyStickerRecordListSkeleton />
      ) : stickerRecordsQuery.isError ? (
        <StateView
          actionLabel="다시 시도하기"
          className="my-auto"
          description={'잠시 후에\n다시 시도해주세요.'}
          headingAs="h2"
          onAction={() => void stickerRecordsQuery.refetch()}
          title="기록을 불러오지 못했어요"
          variant="error"
        />
      ) : recordGroups.length > 0 ? (
        <div className="flex flex-col gap-6.75 pb-8">
          {recordGroups.map(({ dateLabel, dateValue, stickerImages }) => (
            <section key={dateValue} aria-labelledby={`monthly-sticker-record-${dateValue}`}>
              <h2
                id={`monthly-sticker-record-${dateValue}`}
                className="mb-2 text-body-01-semibold text-neutral-900"
              >
                {dateLabel}
              </h2>
              <StickerCollection
                ariaLabel={`${dateLabel}에 받은 스티커`}
                size="compact"
                stickers={stickerImages}
              />
            </section>
          ))}
        </div>
      ) : (
        <MonthlyRecordEmptyState isPastMonth={isPastMonth} selectedMonth={selectedMonth} />
      )}

      {isMonthPickerOpen && (
        <MonthPickerSheet
          months={selectableMonths}
          onClose={() => setIsMonthPickerOpen(false)}
          onSelect={handleMonthSelect}
          selectedMonth={selectedMonth}
        />
      )}
    </div>
  );
}
