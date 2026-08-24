import { useNavigate } from 'react-router-dom';

import {
  MonthlyStickerSummary,
  RecentDiscoveryPanel,
  ReportContentSkeleton,
  ReportHeroSection,
  ReportLinkButton,
  ReportSection,
  WeeklyRecordCalendar,
  useCurrentReportQuery,
} from '@/features/report';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { Skeleton } from '@/shared/ui/skeleton';
import { StateView } from '@/shared/ui/state-view';

export default function ReportPage() {
  const navigate = useNavigate();
  const { data: report, hasReportError, isPending, refetch } = useCurrentReportQuery();

  if (hasReportError) {
    return (
      <main className="flex min-h-dvh items-center px-4">
        <StateView
          actionLabel="다시 불러오기"
          description="잠시 후 다시 시도해주세요."
          headingAs="h1"
          onAction={() => void refetch()}
          title="리포트를 불러오지 못했어요"
          variant="error"
        />
      </main>
    );
  }

  const {
    monthLabel,
    monthlyAdditionalStickerCount,
    monthlyRecordCount,
    monthlyStickerImages,
    recentDiscovery,
    weeklyPeriodLabel,
    weeklyRecords,
  } = report;

  return (
    <main aria-busy={isPending} className="overflow-hidden">
      {isPending && (
        <span className="sr-only" role="status">
          리포트를 불러오는 중입니다.
        </span>
      )}

      <ReportHeroSection
        monthlyReportPath={ROUTE_PATHS.monthlyReport}
        monthLabel={monthLabel}
        onBack={() => navigate(-1)}
      />

      <div className="relative rounded-t-30 bg-neutral-00 pt-10 pr-4 pb-page-bottom pl-4.25">
        <div className="flex flex-col gap-6">
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

          <ReportSection
            title={
              <>
                이번달{' '}
                {isPending ? (
                  <Skeleton
                    as="span"
                    className="inline-block h-5 w-8 rounded-05 bg-primary-100 align-text-bottom"
                  />
                ) : (
                  <span className="text-primary-500">{monthlyRecordCount}개</span>
                )}
                의 기록이 쌓이고 있어요 !
              </>
            }
          >
            {isPending ? (
              <ReportContentSkeleton variant="stickers" />
            ) : (
              <MonthlyStickerSummary
                additionalCount={monthlyAdditionalStickerCount}
                emptyActionPath={ROUTE_PATHS.record}
                recordCount={monthlyRecordCount}
                stickers={monthlyStickerImages}
              />
            )}
          </ReportSection>

          <ReportSection title="최근발견">
            {isPending ? (
              <ReportContentSkeleton variant="discovery" />
            ) : (
              <RecentDiscoveryPanel messages={recentDiscovery} />
            )}
          </ReportSection>

          <div className="grid w-full grid-cols-2 gap-2">
            <ReportLinkButton to={ROUTE_PATHS.spendingHistory}>
              소비내역
              <br />
              보러가기
            </ReportLinkButton>
            <ReportLinkButton to={ROUTE_PATHS.frequentShopList}>
              단골리스트
              <br />
              보러가기
            </ReportLinkButton>
          </div>
        </div>
      </div>
    </main>
  );
}
