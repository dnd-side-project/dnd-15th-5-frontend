import { useEffect, useState } from 'react';

import { MOCK_MONTHLY_REPORTS } from '@/features/report/mockData';
import { useToast } from '@/shared/ui/toast';

import { useReportImageDownload } from './useReportImageDownload';

/** 월간 상세 리포트의 월 이동, 취향 카드, 공유 상태를 관리합니다. */
export const useMonthlyReport = () => {
  const { showToast } = useToast();
  const [selectedReportIndex, setSelectedReportIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const report = MOCK_MONTHLY_REPORTS[selectedReportIndex] ?? MOCK_MONTHLY_REPORTS[0];
  const { captureRef, downloadImage, hasDownloadError, isDownloading } = useReportImageDownload(
    `${report.monthLabel}-취향카드.png`
  );

  const hasNewerMonth = selectedReportIndex > 0;
  const hasOlderMonth = selectedReportIndex < MOCK_MONTHLY_REPORTS.length - 1;

  useEffect(() => {
    if (!hasDownloadError) return;

    showToast({
      message: '이미지 저장에 실패했어요. 다시 시도해 주세요.',
      type: 'error',
    });
  }, [hasDownloadError, showToast]);

  const handleNewerMonth = () => {
    if (!hasNewerMonth) return;

    setIsCardFlipped(false);
    setSelectedReportIndex((index) => index - 1);
  };

  const handleOlderMonth = () => {
    if (!hasOlderMonth) return;

    setIsCardFlipped(false);
    setSelectedReportIndex((index) => index + 1);
  };

  const handlePreferenceCardFlip = () => setIsCardFlipped((isFlipped) => !isFlipped);
  const handleShareSheetClose = () => setIsShareSheetOpen(false);
  const handleShareSheetOpen = () => setIsShareSheetOpen(true);

  return {
    captureRef,
    downloadImage,
    handleNewerMonth,
    handleOlderMonth,
    handlePreferenceCardFlip,
    handleShareSheetClose,
    handleShareSheetOpen,
    hasNewerMonth,
    hasOlderMonth,
    isCardFlipped,
    isDownloading,
    isShareSheetOpen,
    report,
    selectedMonth: report.month,
  };
};
