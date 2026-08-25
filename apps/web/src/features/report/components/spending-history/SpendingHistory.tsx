import { useEffect, useMemo, useState } from 'react';

import { useConsumptionsInfiniteQuery } from '@/features/report/apis/hooks/useConsumptionsInfiniteQuery';
import MonthlyRecordEmptyState from '@/features/report/components/common/MonthlyRecordEmptyState';
import MonthPickerSheet from '@/features/report/components/common/MonthPickerSheet';
import MonthSelector from '@/features/report/components/common/MonthSelector';
import {
  createRecentSpendingMonths,
  formatSpendingYearMonth,
  groupConsumptionsByDate,
} from '@/features/report/utils/consumptions';
import { parseSpendingMonthFromDate } from '@/features/report/utils/parseSpendingMonthFromDate';
import { cn } from '@/shared/lib/cn';
import type { YearMonth } from '@/shared/types/yearMonth';
import { StateView } from '@/shared/ui/state-view';
import { isSameMonth } from '@/shared/utils/yearMonth';

import SpendingHistorySkeleton from './SpendingHistorySkeleton';
import SpendingRecordList from './SpendingRecordList';

import type { ReactNode } from 'react';

type SpendingHistoryProps = {
  headerDescription?: string;
  headerContent?: ReactNode;
  headerContentGapClassName?: string;
  initialDate?: string;
};

const SPENDING_MONTHS = createRecentSpendingMonths(10);

type MonthSelection = {
  dateValue?: string;
  month: YearMonth;
};

const getSupportedMonthFromDate = (dateValue?: string): YearMonth | null => {
  const parsedMonth = parseSpendingMonthFromDate(dateValue);

  if (!parsedMonth) return null;

  return SPENDING_MONTHS.find((month) => isSameMonth(month, parsedMonth)) ?? null;
};

/**
 * 선택한 월의 소비내역을 날짜별로 보여주고 월 이동과 월 선택 시트를 제공합니다.
 *
 * @param props - 소비내역 화면 속성입니다.
 * @param props.headerDescription - 월 선택 영역 대신 표시할 상단 안내 문구입니다.
 * @param props.headerContent - 월 선택 영역과 함께 고정할 상단 콘텐츠입니다.
 * @param props.headerContentGapClassName - 상단 콘텐츠와 월 선택 영역 사이의 간격 클래스입니다.
 * @param props.initialDate - 처음 표시할 소비 기록 날짜입니다. `YYYY-MM-DD` 형식을 사용합니다.
 */
export default function SpendingHistory({
  headerDescription,
  headerContent,
  headerContentGapClassName = 'mt-5',
  initialDate,
}: SpendingHistoryProps) {
  const initialMonth = parseSpendingMonthFromDate(initialDate);
  const initialSelectedMonth = getSupportedMonthFromDate(initialDate) ?? SPENDING_MONTHS[0];
  const [monthSelection, setMonthSelection] = useState<MonthSelection>(() => ({
    dateValue: initialDate,
    month: initialSelectedMonth,
  }));
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const selectedMonth =
    monthSelection.dateValue === initialDate ? monthSelection.month : initialSelectedMonth;

  const selectedMonthIndex = SPENDING_MONTHS.findIndex((month) =>
    isSameMonth(month, selectedMonth)
  );
  const isPastMonth = selectedMonthIndex > 0;
  const hasNewerMonth = isPastMonth;
  const hasOlderMonth = selectedMonthIndex < SPENDING_MONTHS.length - 1;
  const consumptionsQuery = useConsumptionsInfiniteQuery(formatSpendingYearMonth(selectedMonth));
  const consumptions = useMemo(
    () => consumptionsQuery.data?.pages.flatMap((page) => page.data?.consumptions ?? []) ?? [],
    [consumptionsQuery.data]
  );
  const recordGroups = useMemo(() => groupConsumptionsByDate(consumptions), [consumptions]);
  const filteredDate =
    initialDate && initialMonth && isSameMonth(selectedMonth, initialMonth)
      ? initialDate
      : undefined;
  const isFilteringInitialDate = filteredDate !== undefined;
  const visibleRecordGroups = isFilteringInitialDate
    ? recordGroups.filter(({ dateValue }) => dateValue === filteredDate)
    : recordGroups;
  const lastLoadedDate = consumptions.at(-1)?.purchaseDate;
  const shouldFetchMoreForDate = Boolean(
    filteredDate &&
    consumptionsQuery.hasNextPage &&
    (!lastLoadedDate || lastLoadedDate >= filteredDate)
  );
  const { fetchNextPage, isFetchingNextPage } = consumptionsQuery;

  useEffect(() => {
    if (shouldFetchMoreForDate && !isFetchingNextPage && !consumptionsQuery.isFetchNextPageError) {
      void fetchNextPage();
    }
  }, [
    consumptionsQuery.isFetchNextPageError,
    fetchNextPage,
    isFetchingNextPage,
    shouldFetchMoreForDate,
  ]);

  const setSelectedMonth = (month: YearMonth) => {
    setMonthSelection({ dateValue: initialDate, month });
  };

  const handleMonthSelect = (month: YearMonth) => {
    setSelectedMonth(month);
    setIsMonthPickerOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      <header
        className={cn(
          'sticky top-0 z-sticky-header bg-neutral-00',
          !headerDescription && 'pb-5',
          headerContent ? 'pt-1' : 'pt-2'
        )}
      >
        {headerContent}
        {!headerDescription && (
          <MonthSelector
            className={cn(headerContent && headerContentGapClassName)}
            hasNewerMonth={hasNewerMonth}
            hasOlderMonth={hasOlderMonth}
            headingLabel={`${selectedMonth.month}월 소비 내역`}
            isMonthPickerOpen={isMonthPickerOpen}
            onMonthClick={() => setIsMonthPickerOpen(true)}
            onNewerMonth={() => setSelectedMonth(SPENDING_MONTHS[selectedMonthIndex - 1])}
            onOlderMonth={() => setSelectedMonth(SPENDING_MONTHS[selectedMonthIndex + 1])}
            selectedMonth={selectedMonth}
          />
        )}
      </header>

      {headerDescription && (
        <>
          <h1 className="sr-only">{selectedMonth.month}월 소비 내역</h1>
          <p
            className={cn(
              'text-center text-body-02-medium text-neutral-500 mb-2',
              headerContent && headerContentGapClassName
            )}
          >
            {headerDescription}
          </p>
        </>
      )}

      <div className="flex flex-1 flex-col pb-8">
        {consumptionsQuery.isPending && <SpendingHistorySkeleton />}

        {!consumptionsQuery.isPending &&
          consumptionsQuery.isError &&
          visibleRecordGroups.length === 0 && (
            <StateView
              variant="error"
              title="소비내역을 불러오지 못했어요"
              description={'잠시 후 다시 시도해주세요.'}
              actionLabel="다시 불러오기"
              headingAs="h2"
              onAction={() =>
                void (consumptionsQuery.isFetchNextPageError
                  ? fetchNextPage()
                  : consumptionsQuery.refetch())
              }
              className="my-auto"
            />
          )}

        {!consumptionsQuery.isPending &&
          !consumptionsQuery.isError &&
          !shouldFetchMoreForDate &&
          visibleRecordGroups.length === 0 && (
            <MonthlyRecordEmptyState isPastMonth={isPastMonth} selectedMonth={selectedMonth} />
          )}

        {!consumptionsQuery.isPending && visibleRecordGroups.length > 0 && (
          <SpendingRecordList
            groups={visibleRecordGroups}
            hasNextPage={!isFilteringInitialDate && consumptionsQuery.hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isLoadMoreError={consumptionsQuery.isFetchNextPageError}
            onLoadMore={() => void fetchNextPage()}
            onRetry={() => void fetchNextPage()}
          />
        )}
      </div>

      {!headerDescription && isMonthPickerOpen && (
        <MonthPickerSheet
          months={SPENDING_MONTHS}
          selectedMonth={selectedMonth}
          onClose={() => setIsMonthPickerOpen(false)}
          onSelect={handleMonthSelect}
        />
      )}
    </div>
  );
}
