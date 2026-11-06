import {
  ReportCategoryDistribution,
  createFrequentShopListPath,
  ReportContentSkeleton,
  ReportHeroSection,
  ReportLoyaltySummary,
  ReportLinkButton,
  ReportSection,
  WeeklyRecordCalendar,
  useCurrentReportQuery,
} from '@/features/report';
import {
  ReportFavoriteShopsLinkImage,
  ReportSpendingRecordLinkImage,
} from '@/shared/assets/images/report-page';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import PageHeader from '@/shared/layout/PageHeader';
import { StateView } from '@/shared/ui/state-view';

export default function ReportPage() {
  const { data: report, hasReportError, isPending, refetch } = useCurrentReportQuery();

  if (hasReportError) {
    return (
      <main className="flex min-h-dvh flex-col bg-primary-50 px-4">
        <PageHeader className="pb-3" title="리포트" />
        <div className="flex flex-1 items-center">
          <StateView
            actionLabel="다시 불러오기"
            description="잠시 후 다시 시도해주세요."
            headingAs="h2"
            onAction={() => void refetch()}
            title="리포트를 불러오지 못했어요"
            variant="error"
          />
        </div>
      </main>
    );
  }

  const { monthLabel, weeklyPeriodLabel, weeklyRecords } = report;

  return (
    <main aria-busy={isPending} className="overflow-hidden bg-primary-50 px-4">
      <PageHeader className="pb-3" title="리포트" />
      {isPending && (
        <span className="sr-only" role="status">
          리포트를 불러오는 중입니다.
        </span>
      )}

      <div className="flex flex-col gap-5 pb-[calc(var(--spacing-page-bottom)+6.5rem)]">
        <ReportHeroSection to={ROUTE_PATHS.monthlyReport} monthLabel={monthLabel} />
        <ReportLoyaltySummary />

        <div className="rounded-16 bg-neutral-00 p-3.5">
          <ReportSection title="이 주의 소비 기록">
            {isPending ? (
              <ReportContentSkeleton variant="weekly" />
            ) : (
              <WeeklyRecordCalendar
                historyPath={ROUTE_PATHS.spendingHistory}
                periodLabel={weeklyPeriodLabel}
                records={weeklyRecords}
              />
            )}
          </ReportSection>
        </div>

        <ReportCategoryDistribution />

        <div className="grid grid-cols-2 gap-4">
          <ReportLinkButton image={ReportSpendingRecordLinkImage} to={ROUTE_PATHS.spendingHistory}>
            소비 기록
            <br />
            보러가기
          </ReportLinkButton>
          <ReportLinkButton
            image={ReportFavoriteShopsLinkImage}
            to={createFrequentShopListPath('all')}
          >
            단골리스트
            <br />
            보러가기
          </ReportLinkButton>
        </div>
      </div>
    </main>
  );
}
