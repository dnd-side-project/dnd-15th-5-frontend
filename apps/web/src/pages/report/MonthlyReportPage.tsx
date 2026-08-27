import { useNavigate } from 'react-router-dom';

import {
  CategoryChart,
  MonthlyReportEmptyState,
  MonthlyReportHeader,
  ReportActivitySummary,
  ReportMyPlace,
  ReportPreferenceSection,
  ReportShareSheet,
  ReportTopShops,
  WeekdaySpendingChart,
  useMonthlyReport,
} from '@/features/report';
import { StateView } from '@/shared/ui/state-view';

/** 선택한 월의 상세 리포트를 보여주는 페이지입니다. */
export default function MonthlyReportPage() {
  const navigate = useNavigate();
  const {
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
    hasReportError,
    isCardFlipped,
    isDownloading,
    isMonthPickerOpen,
    isPending,
    isShareSheetOpen,
    refetch,
    report,
    reportCards,
    selectableMonths,
    selectedCardIndex,
    selectedMonth,
  } = useMonthlyReport();

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
    <main aria-busy={isPending} className="relative overflow-hidden bg-neutral-00 pb-10">
      {isPending && (
        <span className="sr-only" role="status">
          월간 리포트를 불러오는 중입니다.
        </span>
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-147.25 bg-monthly-report-hero" />

      <div className="relative pt-4">
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
        {report && (
          <ReportPreferenceSection
            cards={reportCards}
            captureRef={captureRef}
            isFlipped={isCardFlipped}
            onCardSelect={handleReportCardSelect}
            onFlip={handlePreferenceCardFlip}
            onShare={handleShareSheetOpen}
            selectedCardIndex={selectedCardIndex}
          />
        )}
      </div>

      {isPending ? (
        <div className="relative min-h-[70dvh]" />
      ) : report ? (
        <>
          <div className="relative mt-5.75 h-3 bg-neutral-200" />

          <div className="relative flex flex-col gap-13.75 px-4.25 pt-10">
            <ReportActivitySummary items={report.summary} />
            <ReportTopShops shops={report.shops} />
            <ReportMyPlace districts={report.districts} />
            <CategoryChart categories={report.categories} />
            <WeekdaySpendingChart insight={report.weekdayInsight} items={report.weekdaySpending} />

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
            isOpen={isShareSheetOpen}
            onClose={handleShareSheetClose}
            onDownload={downloadImage}
          />
        </>
      ) : (
        <div className="relative flex min-h-[70dvh] flex-col px-4">
          <MonthlyReportEmptyState selectedMonth={selectedMonth} />
        </div>
      )}
    </main>
  );
}
