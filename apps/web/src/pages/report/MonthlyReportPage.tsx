import { useNavigate } from 'react-router-dom';

import {
  CategoryChart,
  MonthlyReportHeader,
  ReportActivitySummary,
  ReportMyPlace,
  ReportPreferenceSection,
  ReportShareSheet,
  ReportTopShops,
  WeekdaySpendingChart,
  useMonthlyReport,
} from '@/features/report';

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
    isCardFlipped,
    isDownloading,
    isMonthPickerOpen,
    isShareSheetOpen,
    report,
    reportCards,
    selectableMonths,
    selectedCardIndex,
    selectedMonth,
  } = useMonthlyReport();

  return (
    <main className="relative overflow-hidden bg-neutral-00 pb-10">
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
        <ReportPreferenceSection
          cards={reportCards}
          captureRef={captureRef}
          isFlipped={isCardFlipped}
          onCardSelect={handleReportCardSelect}
          onFlip={handlePreferenceCardFlip}
          onShare={handleShareSheetOpen}
          selectedCardIndex={selectedCardIndex}
        />
      </div>

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
    </main>
  );
}
