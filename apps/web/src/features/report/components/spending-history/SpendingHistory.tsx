import { useEffect, useMemo, useRef, useState } from 'react';

import { useConsumptionsInfiniteQuery } from '@/features/report/apis/hooks/useConsumptionsInfiniteQuery';
import { useFirstAvailableYearMonthQuery } from '@/features/report/apis/hooks/useFirstAvailableYearMonthQuery';
import MonthlyRecordEmptyState from '@/features/report/components/common/MonthlyRecordEmptyState';
import MonthPickerSheet from '@/features/report/components/common/MonthPickerSheet';
import MonthSelector from '@/features/report/components/common/MonthSelector';
import {
  formatSpendingYearMonth,
  groupConsumptionsByDate,
} from '@/features/report/utils/consumptions';
import { parseSpendingMonthFromDate } from '@/features/report/utils/parseSpendingMonthFromDate';
import { cn } from '@/shared/lib/cn';
import type { YearMonth } from '@/shared/types/yearMonth';
import { StateView } from '@/shared/ui/state-view';
import {
  createYearMonthRange,
  getCurrentMonth,
  isBeforeMonth,
  isSameMonth,
} from '@/shared/utils/yearMonth';

import SpendingHistorySkeleton from './SpendingHistorySkeleton';
import SpendingRecordList from './SpendingRecordList';

import type { ReactNode } from 'react';

type SpendingHistoryProps = {
  contentBottomPaddingClassName?: string;
  headerDescription?: string;
  headerContent?: ReactNode;
  headerContentGapClassName?: string;
  scrollToDate?: string;
};

type MonthSelection = {
  dateValue?: string;
  month: YearMonth;
};

const getSupportedMonthFromDate = (
  dateValue: string | undefined,
  currentMonth: YearMonth
): YearMonth | null => {
  const parsedMonth = parseSpendingMonthFromDate(dateValue);

  if (!parsedMonth || isBeforeMonth(currentMonth, parsedMonth)) return null;

  return parsedMonth;
};

/**
 * 선택한 월의 소비내역을 날짜별로 보여주고 월 이동과 월 선택 시트를 제공합니다.
 *
 * @param props - 소비내역 화면 속성입니다.
 * @param props.contentBottomPaddingClassName - 소비내역 콘텐츠의 하단 여백 클래스입니다.
 * @param props.headerDescription - 월 선택 영역 대신 표시할 상단 안내 문구입니다.
 * @param props.headerContent - 월 선택 영역과 함께 고정할 상단 콘텐츠입니다.
 * @param props.headerContentGapClassName - 상단 콘텐츠와 월 선택 영역 사이의 간격 클래스입니다.
 * @param props.scrollToDate - 진입 후 스크롤할 소비 기록 날짜입니다. `YYYY-MM-DD` 형식을 사용합니다.
 */
export default function SpendingHistory({
  contentBottomPaddingClassName = 'pb-8',
  headerDescription,
  headerContent,
  headerContentGapClassName = 'mt-5',
  scrollToDate,
}: SpendingHistoryProps) {
  const currentMonth = getCurrentMonth();
  const initialMonth = parseSpendingMonthFromDate(scrollToDate);
  const initialSelectedMonth =
    getSupportedMonthFromDate(scrollToDate, currentMonth) ?? currentMonth;
  const hasScrolledToDateRef = useRef(false);
  const [monthSelection, setMonthSelection] = useState<MonthSelection>(() => ({
    dateValue: scrollToDate,
    month: initialSelectedMonth,
  }));
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const requestedMonth =
    monthSelection.dateValue === scrollToDate ? monthSelection.month : initialSelectedMonth;
  const firstAvailableYearMonthQuery = useFirstAvailableYearMonthQuery();
  const selectableMonths = createYearMonthRange(
    currentMonth,
    firstAvailableYearMonthQuery.data ?? initialSelectedMonth
  );
  const oldestSelectableMonth = selectableMonths.at(-1) ?? currentMonth;
  const isRequestedMonthSelectable = selectableMonths.some((month) =>
    isSameMonth(month, requestedMonth)
  );
  const selectedMonth =
    firstAvailableYearMonthQuery.data && !isRequestedMonthSelectable
      ? oldestSelectableMonth
      : requestedMonth;
  const selectedMonthIndex = selectableMonths.findIndex((month) =>
    isSameMonth(month, selectedMonth)
  );
  const isPastMonth = selectedMonthIndex > 0;
  const hasNewerMonth = isPastMonth;
  const hasOlderMonth = selectedMonthIndex >= 0 && selectedMonthIndex < selectableMonths.length - 1;
  const consumptionsQuery = useConsumptionsInfiniteQuery(formatSpendingYearMonth(selectedMonth));
  const consumptions = useMemo(
    () => consumptionsQuery.data?.pages.flatMap((page) => page.data?.consumptions ?? []) ?? [],
    [consumptionsQuery.data]
  );
  const recordGroups = useMemo(() => groupConsumptionsByDate(consumptions), [consumptions]);
  const targetDate =
    scrollToDate && initialMonth && isSameMonth(selectedMonth, initialMonth)
      ? scrollToDate
      : undefined;
  const hasTargetDate = recordGroups.some(({ purchaseDate }) => purchaseDate === targetDate);
  const lastLoadedDate = consumptions.at(-1)?.purchaseDate;
  const shouldFetchMoreForDate = Boolean(
    targetDate &&
    !hasTargetDate &&
    consumptionsQuery.hasNextPage &&
    (!lastLoadedDate || lastLoadedDate >= targetDate)
  );
  const { fetchNextPage, isFetchingNextPage } = consumptionsQuery;
  const isEmpty =
    !consumptionsQuery.isPending &&
    !consumptionsQuery.isError &&
    !shouldFetchMoreForDate &&
    recordGroups.length === 0;

  useEffect(() => {
    hasScrolledToDateRef.current = false;
  }, [scrollToDate]);

  useEffect(() => {
    if (!targetDate || hasScrolledToDateRef.current) return;

    const targetSection = document.getElementById(`date-${targetDate}`);
    if (!targetSection) return;

    targetSection.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    hasScrolledToDateRef.current = true;
  }, [recordGroups, targetDate]);

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
    setMonthSelection({ dateValue: scrollToDate, month });
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
            onNewerMonth={() => setSelectedMonth(selectableMonths[selectedMonthIndex - 1])}
            onOlderMonth={() => setSelectedMonth(selectableMonths[selectedMonthIndex + 1])}
            selectedMonth={selectedMonth}
          />
        )}
      </header>

      {headerDescription && (
        <>
          <h1 className="sr-only">{selectedMonth.month}월 소비 내역</h1>
          {!isEmpty && (
            <p
              className={cn(
                'text-center text-body-02-medium text-neutral-500 mb-2',
                headerContent && headerContentGapClassName
              )}
            >
              {headerDescription}
            </p>
          )}
        </>
      )}

      <div className={cn('flex flex-1 flex-col', contentBottomPaddingClassName)}>
        {consumptionsQuery.isPending && <SpendingHistorySkeleton />}

        {!consumptionsQuery.isPending && consumptionsQuery.isError && recordGroups.length === 0 && (
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

        {isEmpty && (
          <MonthlyRecordEmptyState isPastMonth={isPastMonth} selectedMonth={selectedMonth} />
        )}

        {!consumptionsQuery.isPending && recordGroups.length > 0 && (
          <SpendingRecordList
            groups={recordGroups}
            hasNextPage={!shouldFetchMoreForDate && consumptionsQuery.hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isLoadMoreError={consumptionsQuery.isFetchNextPageError}
            onLoadMore={() => void fetchNextPage()}
            onRetry={() => void fetchNextPage()}
            targetDate={targetDate}
          />
        )}
      </div>

      {!headerDescription && isMonthPickerOpen && (
        <MonthPickerSheet
          months={selectableMonths}
          selectedMonth={selectedMonth}
          onClose={() => setIsMonthPickerOpen(false)}
          onSelect={handleMonthSelect}
        />
      )}
    </div>
  );
}
