import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { MOCK_MONTHLY_REPORTS } from '@/features/report/mockData';
import { YEAR_MONTH_SEARCH_PARAM } from '@/shared/constants/searchParams';
import type { YearMonth } from '@/shared/types/yearMonth';
import { useToast } from '@/shared/ui/toast';
import { formatYearMonth } from '@/shared/utils/yearMonth';

import { useReportImageDownload } from './useReportImageDownload';

/** 월간 상세 리포트의 월 이동, 취향 카드, 공유 상태를 관리합니다. */
export const useMonthlyReport = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const requestedYearMonth = searchParams.get(YEAR_MONTH_SEARCH_PARAM);
  const requestedReportIndex = MOCK_MONTHLY_REPORTS.findIndex(
    ({ month }) => formatYearMonth(month) === requestedYearMonth
  );
  const selectedReportIndex = requestedReportIndex >= 0 ? requestedReportIndex : 0;
  const report = MOCK_MONTHLY_REPORTS[selectedReportIndex] ?? MOCK_MONTHLY_REPORTS[0];
  const selectedYearMonth = formatYearMonth(report.month);
  const { captureRef, downloadImage, hasDownloadError, isDownloading } = useReportImageDownload(
    `${report.monthLabel}-취향카드.png`
  );

  const hasNewerMonth = selectedReportIndex > 0;
  const hasOlderMonth = selectedReportIndex < MOCK_MONTHLY_REPORTS.length - 1;
  const reportCards = [...MOCK_MONTHLY_REPORTS].reverse().map(({ month, persona }) => ({
    ...persona,
    id: `${month.year}-${month.month}`,
  }));
  const selectedCardIndex = reportCards.length - 1 - selectedReportIndex;

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

  const handleReportSelect = (index: number) => {
    if (index < 0 || index >= MOCK_MONTHLY_REPORTS.length || index === selectedReportIndex) return;

    const nextReport = MOCK_MONTHLY_REPORTS[index];

    setIsCardFlipped(false);
    setSearchParams((currentSearchParams) => {
      const nextSearchParams = new URLSearchParams(currentSearchParams);
      nextSearchParams.set(YEAR_MONTH_SEARCH_PARAM, formatYearMonth(nextReport.month));
      return nextSearchParams;
    });
  };

  const handleNewerMonth = () => handleReportSelect(selectedReportIndex - 1);

  const handleOlderMonth = () => {
    handleReportSelect(selectedReportIndex + 1);
  };

  const handleMonthSelect = (month: YearMonth) => {
    const reportIndex = MOCK_MONTHLY_REPORTS.findIndex(
      ({ month: reportMonth }) => formatYearMonth(reportMonth) === formatYearMonth(month)
    );

    handleReportSelect(reportIndex);
    setIsMonthPickerOpen(false);
  };

  const handleReportCardSelect = (index: number) => {
    handleReportSelect(reportCards.length - 1 - index);
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
    selectableMonths: MOCK_MONTHLY_REPORTS.map(({ month }) => month),
    selectedCardIndex,
    selectedMonth: report.month,
  };
};
