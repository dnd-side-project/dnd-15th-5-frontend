import { isAxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAdjacentMonthlyReportPrefetch } from '@/features/report/apis/hooks/useAdjacentMonthlyReportPrefetch';
import { useFirstAvailableYearMonthQuery } from '@/features/report/apis/hooks/useFirstAvailableYearMonthQuery';
import { useMonthlyReportQuery } from '@/features/report/apis/hooks/useMonthlyReportQuery';
import { createMonthlyReportCarouselCards } from '@/features/report/utils/monthlyReportCarousel';
import { YEAR_MONTH_SEARCH_PARAM } from '@/shared/constants/searchParams';
import type { YearMonth } from '@/shared/types/yearMonth';
import { useToast } from '@/shared/ui/toast';
import {
  addMonth,
  createYearMonthRange,
  formatYearMonth,
  getCurrentMonth,
  isBeforeMonth,
  isSameMonth,
  parseYearMonth,
} from '@/shared/utils/yearMonth';

import { useReportImageDownload } from './useReportImageDownload';

/** 월간 상세 리포트의 월 이동, 취향 카드, 공유 상태를 관리합니다. */
export const useMonthlyReport = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isCardTransitioning, setIsCardTransitioning] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const firstAvailableYearMonthQuery = useFirstAvailableYearMonthQuery();
  const requestedYearMonth = searchParams.get(YEAR_MONTH_SEARCH_PARAM);
  const requestedMonth = parseYearMonth(requestedYearMonth);
  const latestMonth = addMonth(getCurrentMonth(), -1);
  const isRequestedMonthInRange =
    requestedMonth !== null && !isBeforeMonth(latestMonth, requestedMonth);
  const fallbackOldestMonth = isRequestedMonthInRange ? requestedMonth : latestMonth;
  const selectableMonths = createYearMonthRange(
    latestMonth,
    firstAvailableYearMonthQuery.data ?? fallbackOldestMonth
  );
  const requestedMonthIndex = requestedMonth
    ? selectableMonths.findIndex((month) => isSameMonth(month, requestedMonth))
    : -1;
  const selectedMonthIndex = requestedMonthIndex >= 0 ? requestedMonthIndex : 0;
  const selectedMonth = selectableMonths[selectedMonthIndex] ?? latestMonth;
  const monthlyReportQuery = useMonthlyReportQuery(selectedMonth);
  const reportData = monthlyReportQuery.data;
  const report = reportData && !('isUnavailable' in reportData) ? reportData : undefined;
  useAdjacentMonthlyReportPrefetch(reportData?.adjacentCards);
  const selectedYearMonth = formatYearMonth(selectedMonth);
  const { captureRef, downloadImage, hasDownloadError, isDownloading } = useReportImageDownload(
    `${selectedMonth.month}월-취향카드.png`
  );

  const hasNewerMonth = selectedMonthIndex > 0;
  const hasOlderMonth = selectedMonthIndex < selectableMonths.length - 1;
  const reportCards = createMonthlyReportCarouselCards({
    reportData,
    selectableMonths,
    selectedMonth,
  });
  const selectedCardIndex = reportCards.findIndex((card) => card.id === selectedYearMonth);
  const hasReportError =
    monthlyReportQuery.isError &&
    !(isAxiosError(monthlyReportQuery.error) && monthlyReportQuery.error.response?.status === 404);

  useEffect(() => {
    if (requestedYearMonth === selectedYearMonth) return;

    setSearchParams(
      (currentSearchParams) => {
        const nextSearchParams = new URLSearchParams(currentSearchParams);
        nextSearchParams.set(YEAR_MONTH_SEARCH_PARAM, selectedYearMonth);
        return nextSearchParams;
      },
      { replace: true }
    );
  }, [requestedYearMonth, selectedYearMonth, setSearchParams]);

  useEffect(() => {
    if (!hasDownloadError) return;

    showToast({
      message: '이미지 저장에 실패했어요. 다시 시도해 주세요.',
      type: 'error',
    });
  }, [hasDownloadError, showToast]);

  const handleMonthChange = (month: YearMonth | undefined) => {
    if (!month || isSameMonth(month, selectedMonth)) return;

    setIsCardFlipped(false);

    setSearchParams(
      (currentSearchParams) => {
        const nextSearchParams = new URLSearchParams(currentSearchParams);
        nextSearchParams.set(YEAR_MONTH_SEARCH_PARAM, formatYearMonth(month));
        return nextSearchParams;
      },
      { replace: true }
    );
  };

  const handleNewerMonth = () => handleMonthChange(selectableMonths[selectedMonthIndex - 1]);

  const handleOlderMonth = () => {
    handleMonthChange(selectableMonths[selectedMonthIndex + 1]);
  };

  const handleMonthSelect = (month: YearMonth) => {
    handleMonthChange(month);
    setIsMonthPickerOpen(false);
  };

  const handleCurrentReportSelect = () => handleMonthChange(selectableMonths[0]);

  const handleReportCardSelect = (index: number) => {
    const reportCard = reportCards[index];

    handleMonthChange(reportCard?.month);
  };

  const handlePreferenceCardFlip = () => setIsCardFlipped((isFlipped) => !isFlipped);
  const handleCardTransitionChange = useCallback(
    (isTransitioning: boolean) => setIsCardTransitioning(isTransitioning),
    []
  );
  const handleMonthPickerClose = () => setIsMonthPickerOpen(false);
  const handleMonthPickerOpen = () => setIsMonthPickerOpen(true);
  const handleShareSheetClose = () => setIsShareSheetOpen(false);
  const handleShareSheetOpen = () => setIsShareSheetOpen(true);

  const isPending = monthlyReportQuery.isPending || monthlyReportQuery.isPlaceholderData;

  return {
    captureRef,
    downloadImage,
    handleCardTransitionChange,
    handleCurrentReportSelect,
    handleNewerMonth,
    handleOlderMonth,
    handleMonthPickerClose,
    handleMonthPickerOpen,
    handleMonthSelect,
    handlePreferenceCardFlip,
    handleReportCardSelect,
    handleShareSheetClose,
    handleShareSheetOpen,
    hasNewerMonth,
    hasOlderMonth,
    hasReportError,
    isCardFlipped,
    isCardTransitioning,
    isDownloading,
    isMonthPickerOpen,
    isPending,
    isReportContentLoading: isPending || isCardTransitioning,
    isShareSheetOpen,
    refetch: monthlyReportQuery.refetch,
    report,
    reportCards,
    selectableMonths,
    selectedCardIndex,
    selectedMonth,
  };
};
