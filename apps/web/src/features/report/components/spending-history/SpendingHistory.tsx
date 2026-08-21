import { useState } from 'react';

import { MOCK_SPENDING_MONTHS, MOCK_SPENDING_RECORD_GROUPS } from '@/features/report/mockData';
import type { SpendingMonth } from '@/features/report/types';
import { CaretLeftIcon, CaretRightIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { StateView } from '@/shared/ui/state-view';

import MonthPickerSheet from './MonthPickerSheet';
import SpendingRecordItem from './SpendingRecordItem';

const isSameMonth = (month: SpendingMonth, target: SpendingMonth) =>
  month.year === target.year && month.month === target.month;

/**
 * 선택한 월의 소비내역을 날짜별로 보여주고 월 이동과 월 선택 시트를 제공합니다.
 */
export default function SpendingHistory() {
  const [selectedMonth, setSelectedMonth] = useState<SpendingMonth>(MOCK_SPENDING_MONTHS[0]);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const selectedMonthIndex = MOCK_SPENDING_MONTHS.findIndex((month) =>
    isSameMonth(month, selectedMonth)
  );
  const hasNewerMonth = selectedMonthIndex > 0;
  const hasOlderMonth = selectedMonthIndex < MOCK_SPENDING_MONTHS.length - 1;
  const recordGroups = selectedMonthIndex === 0 ? MOCK_SPENDING_RECORD_GROUPS : [];

  const handleMonthSelect = (month: SpendingMonth) => {
    setSelectedMonth(month);
    setIsMonthPickerOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-sticky-header bg-neutral-00 pb-5">
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="이전 달 보기"
            disabled={!hasOlderMonth}
            onClick={() => setSelectedMonth(MOCK_SPENDING_MONTHS[selectedMonthIndex + 1])}
            className="flex size-6 items-center justify-center text-neutral-900 disabled:text-neutral-300"
          >
            <CaretLeftIcon aria-hidden="true" className="size-6" />
          </button>
          <h1 aria-label={`${selectedMonth.month}월 소비 내역`}>
            <button
              type="button"
              aria-label="월 선택"
              aria-expanded={isMonthPickerOpen}
              onClick={() => setIsMonthPickerOpen(true)}
              className="min-w-10 text-title-02-bold text-neutral-900"
            >
              {selectedMonth.month}월
            </button>
          </h1>
          <button
            type="button"
            aria-label="다음 달 보기"
            disabled={!hasNewerMonth}
            onClick={() => setSelectedMonth(MOCK_SPENDING_MONTHS[selectedMonthIndex - 1])}
            className="flex size-6 items-center justify-center text-neutral-900 disabled:text-neutral-300"
          >
            <CaretRightIcon aria-hidden="true" className="size-6" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col">
        {recordGroups.length > 0 ? (
          <div className="space-y-5">
            {recordGroups.map((group) => (
              <section key={group.dateLabel} aria-labelledby={`date-${group.dateLabel}`}>
                <h2
                  id={`date-${group.dateLabel}`}
                  className="mb-3 text-body-01-semibold text-neutral-900"
                >
                  {group.dateLabel}
                </h2>
                <ul className="space-y-3">
                  {group.records.map((record) => (
                    <SpendingRecordItem key={record.id} record={record} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <StateView
            variant="empty"
            title="아직 기록이 없어요"
            description={'소비 기록을 작성해보세요.\n빈 공간이 채워질 거예요.'}
            actionLabel="소비 기록 작성하기"
            headingAs="h2"
            to={ROUTE_PATHS.record}
            className="my-auto"
          />
        )}
      </div>

      {isMonthPickerOpen && (
        <MonthPickerSheet
          months={MOCK_SPENDING_MONTHS}
          selectedMonth={selectedMonth}
          onClose={() => setIsMonthPickerOpen(false)}
          onSelect={handleMonthSelect}
        />
      )}
    </div>
  );
}
