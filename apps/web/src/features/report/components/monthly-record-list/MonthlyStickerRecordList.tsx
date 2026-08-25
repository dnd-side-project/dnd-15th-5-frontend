import { useState } from 'react';

import { useMonthlyStickerRecordsQuery } from '@/features/report/apis/hooks/useMonthlyStickerRecordsQuery';
import MonthPickerSheet from '@/features/report/components/common/MonthPickerSheet';
import MonthSelector from '@/features/report/components/common/MonthSelector';
import { createYearMonthPath, ROUTE_PATHS } from '@/shared/constants/routePaths';
import type { YearMonth } from '@/shared/types/yearMonth';
import { StateView } from '@/shared/ui/state-view';
import { StickerCollection } from '@/shared/ui/sticker-collection';
import {
  addMonth,
  formatYearMonth,
  getCurrentMonth,
  getMonthDifference,
  isBeforeMonth,
} from '@/shared/utils/yearMonth';

import type { ReactNode } from 'react';

type MonthlyStickerRecordListProps = {
  headerContent?: ReactNode;
};

const DEFAULT_MONTH_PICKER_ITEM_COUNT = 12;

/** 선택한 월에 획득한 스티커를 날짜별 5열 슬롯으로 보여줍니다. */
export default function MonthlyStickerRecordList({ headerContent }: MonthlyStickerRecordListProps) {
  const currentMonth = getCurrentMonth();
  const [selectedMonth, setSelectedMonth] = useState<YearMonth>(currentMonth);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const stickerRecordsQuery = useMonthlyStickerRecordsQuery(selectedMonth);
  const hasNewerMonth = isBeforeMonth(selectedMonth, currentMonth);
  const isPastMonth = isBeforeMonth(selectedMonth, currentMonth);
  const recordGroups = stickerRecordsQuery.data ?? [];
  const emptyActionPath = isPastMonth
    ? createYearMonthPath(ROUTE_PATHS.record, formatYearMonth(selectedMonth))
    : ROUTE_PATHS.record;
  // TODO: 백엔드에서 최초 조회 가능 연월을 제공하면 월 목록과 이전 달 이동 범위를 API 기준으로 제한한다.
  const monthPickerItemCount = Math.max(
    DEFAULT_MONTH_PICKER_ITEM_COUNT,
    getMonthDifference(currentMonth, selectedMonth) + 1
  );
  const selectableMonths = Array.from({ length: monthPickerItemCount }, (_, index) =>
    addMonth(currentMonth, -index)
  );

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
          hasOlderMonth
          headingLabel={`${selectedMonth.month}월에 쌓인 기록`}
          isMonthPickerOpen={isMonthPickerOpen}
          onMonthClick={() => setIsMonthPickerOpen(true)}
          onNewerMonth={() => setSelectedMonth((month) => addMonth(month, 1))}
          onOlderMonth={() => setSelectedMonth((month) => addMonth(month, -1))}
          selectedMonth={selectedMonth}
          variant="prominent"
        />
      </header>

      {/* TODO: isPending 상태를 월별 스티커 목록 스켈레톤 UI로 교체한다. */}
      {stickerRecordsQuery.isPending ? (
        <div
          aria-live="polite"
          className="my-auto text-center text-body-02-medium text-neutral-500"
          role="status"
        >
          기록을 불러오는 중이에요
        </div>
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
        <StateView
          actionLabel={
            isPastMonth ? `${selectedMonth.month}월 기록 추가하기` : '소비 기록 작성하기'
          }
          className="my-auto"
          description={
            isPastMonth
              ? '지난 소비를 기록하면\n빈 공간이 채워질 거예요.'
              : '소비 기록을 작성해보세요.\n빈 공간이 채워질 거예요.'
          }
          headingAs="h2"
          title={isPastMonth ? `${selectedMonth.month}월에는 기록이 없어요` : '아직 기록이 없어요'}
          to={emptyActionPath}
          variant="empty"
        />
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
