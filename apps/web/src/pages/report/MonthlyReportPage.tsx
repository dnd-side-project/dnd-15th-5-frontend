import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetMyAccount } from '@/features/my-page';
import {
  CategoryChart,
  MonthlyReportDetailsSkeleton,
  MonthlyReportHeader,
  MonthlyReportUnavailableCard,
  ReportActivitySummary,
  ReportMyPlace,
  ReportPreferenceSection,
  ReportShareSheet,
  ReportTopShops,
  WeekdaySpendingChart,
  useKakaoReportShare,
  useMonthlyReport,
} from '@/features/report';
import { StateView } from '@/shared/ui/state-view';

/** 선택한 월의 상세 리포트를 보여주는 페이지입니다. */
export default function MonthlyReportPage() {
  const navigate = useNavigate();
  const kakaoThumbnailRef = useRef<HTMLDivElement>(null);
  const accountQuery = useGetMyAccount();
  const {
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
    isDownloading,
    isMonthPickerOpen,
    isPending,
    isReportContentLoading,
    isShareSheetOpen,
    refetch,
    report,
    reportCards,
    selectableMonths,
    selectedCardIndex,
    selectedMonth,
  } = useMonthlyReport();
  const nickname = accountQuery.data?.data?.nickname?.trim() || '챱챱 사용자';
  const { isKakaoShareReady, isPreparingKakaoShare, isSharing, shareToKakao } = useKakaoReportShare(
    {
      captureRef: kakaoThumbnailRef,
      isEnabled: isShareSheetOpen,
      nickname,
      onShared: handleShareSheetClose,
      selectedMonth,
    }
  );

  if (hasReportError) {
    return (
      <main className="flex min-h-dvh items-center px-4">
        <StateView
          actionLabel="다시 불러오기"
          description="잠시 후 다시 시도해주세요."
          headingAs="h1"
          onAction={() => void refetch()}
          title="월간 리포트를 불러오지 못했어요"
          variant="error"
        />
      </main>
    );
  }

  return (
    <main
      aria-busy={isReportContentLoading}
      className="relative overflow-hidden bg-neutral-00 pb-10"
    >
      {isReportContentLoading && (
        <span className="sr-only" role="status">
          월간 리포트를 불러오는 중입니다.
        </span>
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-147.25 bg-monthly-report-hero" />

      <div className={`relative pt-4 ${isPending && !report ? 'min-h-147.25' : ''}`}>
        <MonthlyReportHeader
          hasNewerMonth={hasNewerMonth}
          hasOlderMonth={hasOlderMonth}
          isMonthPickerOpen={isMonthPickerOpen}
          onBack={() => navigate(-1)}
          onMonthPickerClose={handleMonthPickerClose}
          onMonthPickerOpen={handleMonthPickerOpen}
          onMonthSelect={handleMonthSelect}
          onNewerMonth={handleNewerMonth}
          onOlderMonth={handleOlderMonth}
          selectableMonths={selectableMonths}
          selectedMonth={selectedMonth}
        />
        {reportCards.length > 0 && (
          <ReportPreferenceSection
            cards={reportCards}
            captureRef={captureRef}
            isCurrentReportActionVisible={hasNewerMonth}
            isFlipped={isCardFlipped}
            nickname={nickname}
            onCardSelect={handleReportCardSelect}
            onCardTransitionChange={handleCardTransitionChange}
            onFlip={handlePreferenceCardFlip}
            onShare={handleShareSheetOpen}
            onViewCurrentReport={handleCurrentReportSelect}
            selectedCardIndex={selectedCardIndex}
            thumbnailCaptureRef={kakaoThumbnailRef}
          />
        )}
        {!isPending && !report && (
          <div className="mt-4.5 flex flex-col items-center">
            {reportCards.length === 0 && (
              <MonthlyReportUnavailableCard
                isActionVisible={hasNewerMonth}
                onViewCurrentReport={handleCurrentReportSelect}
                selectedMonth={selectedMonth}
              />
            )}
            {/* NOTE: 개발용 리포트 생성 버튼은 배포 전까지 노출하지 않는다. */}
            {/* <MonthlyReportEmptyState selectedMonth={selectedMonth} /> */}
          </div>
        )}
      </div>

      {report ? (
        <>
          <div className="relative mt-5.75 h-3 bg-neutral-200" />

          {isReportContentLoading ? (
            <MonthlyReportDetailsSkeleton />
          ) : (
            <>
              <div className="relative flex flex-col gap-13.75 px-4.25 pt-10">
                <ReportActivitySummary items={report.summary} />
                <ReportTopShops shops={report.shops} />
                <ReportMyPlace districts={report.districts} />
                <CategoryChart categories={report.categories} />
                <WeekdaySpendingChart
                  insight={report.weekdayInsight}
                  items={report.weekdaySpending}
                />

                <button
                  className="mx-auto flex items-center gap-1 text-body-02-medium text-neutral-500"
                  onClick={() => window.scrollTo({ behavior: 'smooth', top: 0 })}
                  type="button"
                >
                  <span aria-hidden>⌃</span> 맨위로
                </button>
              </div>

              <ReportShareSheet
                isDownloading={isDownloading}
                isKakaoShareReady={isKakaoShareReady}
                isPreparingKakaoShare={isPreparingKakaoShare}
                isSharing={isSharing}
                isOpen={isShareSheetOpen}
                onClose={handleShareSheetClose}
                onDownload={downloadImage}
                onKakaoShare={shareToKakao}
              />
            </>
          )}
        </>
      ) : null}
    </main>
  );
}
