import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useFirstAvailableYearMonthQuery } from '@/features/report/apis/hooks/useFirstAvailableYearMonthQuery';
import { MOCK_MONTHLY_REPORTS } from '@/features/report/mockData';
import { YEAR_MONTH_SEARCH_PARAM } from '@/shared/constants/searchParams';
import type { YearMonth } from '@/shared/types/yearMonth';
import { useToast } from '@/shared/ui/toast';
import {
  createYearMonthRange,
  formatYearMonth,
  isSameMonth,
  parseYearMonth,
} from '@/shared/utils/yearMonth';

import { useReportImageDownload } from './useReportImageDownload';

/** 월간 상세 리포트의 월 이동, 취향 카드, 공유 상태를 관리합니다. */
export const useMonthlyReport = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const firstAvailableYearMonthQuery = useFirstAvailableYearMonthQuery();
  const requestedYearMonth = searchParams.get(YEAR_MONTH_SEARCH_PARAM);
  const requestedMonth = parseYearMonth(requestedYearMonth);
  const latestMonth = MOCK_MONTHLY_REPORTS[0].month;
  const fallbackOldestMonth = MOCK_MONTHLY_REPORTS.at(-1)?.month ?? latestMonth;
  const selectableMonths = createYearMonthRange(
    latestMonth,
    firstAvailableYearMonthQuery.data ?? fallbackOldestMonth
  );
  const requestedMonthIndex = requestedMonth
    ? selectableMonths.findIndex((month) => isSameMonth(month, requestedMonth))
    : -1;
  const selectedMonthIndex = requestedMonthIndex >= 0 ? requestedMonthIndex : 0;
  const selectedMonth = selectableMonths[selectedMonthIndex] ?? latestMonth;
  const report = MOCK_MONTHLY_REPORTS.find(({ month }) => isSameMonth(month, selectedMonth));
  const selectedYearMonth = formatYearMonth(selectedMonth);
  const { captureRef, downloadImage, hasDownloadError, isDownloading } = useReportImageDownload(
    `${selectedMonth.month}월-취향카드.png`
  );

  const hasNewerMonth = selectedMonthIndex > 0;
  const hasOlderMonth = selectedMonthIndex < selectableMonths.length - 1;
  const reportCards = [...MOCK_MONTHLY_REPORTS].reverse().map(({ month, persona }) => ({
    ...persona,
    id: `${month.year}-${month.month}`,
    month,
  }));
  const selectedReportIndex = MOCK_MONTHLY_REPORTS.findIndex(({ month }) =>
    isSameMonth(month, selectedMonth)
  );
  const selectedCardIndex =
    selectedReportIndex >= 0 ? reportCards.length - 1 - selectedReportIndex : -1;

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
    setSearchParams((currentSearchParams) => {
      const nextSearchParams = new URLSearchParams(currentSearchParams);
      nextSearchParams.set(YEAR_MONTH_SEARCH_PARAM, formatYearMonth(month));
      return nextSearchParams;
    });
  };

  const handleNewerMonth = () => handleMonthChange(selectableMonths[selectedMonthIndex - 1]);

  const handleOlderMonth = () => {
    handleMonthChange(selectableMonths[selectedMonthIndex + 1]);
  };

  const handleMonthSelect = (month: YearMonth) => {
    handleMonthChange(month);
    setIsMonthPickerOpen(false);
  };

  const handleReportCardSelect = (index: number) => {
    const reportCard = reportCards[index];

    handleMonthChange(reportCard?.month);
  };

  const handlePreferenceCardFlip = () => setIsCardFlipped((isFlipped) => !isFlipped);
  const handleMonthPickerClose = () => setIsMonthPickerOpen(false);
  const handleMonthPickerOpen = () => setIsMonthPickerOpen(true);
  const handleShareSheetClose = () => setIsShareSheetOpen(false);
  const handleShareSheetOpen = () => setIsShareSheetOpen(true);

  return {
    captureRef,
    downloadImage,
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
    isCardFlipped,
    isDownloading,
    isMonthPickerOpen,
    isShareSheetOpen,
    report,
    reportCards,
    selectableMonths,
    selectedCardIndex,
    selectedMonth,
  };
};
