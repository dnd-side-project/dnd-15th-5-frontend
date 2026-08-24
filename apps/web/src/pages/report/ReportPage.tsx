import { useNavigate } from 'react-router-dom';

import {
  MOCK_EMPTY_REPORT_PAGE,
  MonthlyStickerSummary,
  RecentDiscoveryPanel,
  ReportHeroSection,
  ReportLinkButton,
  ReportSection,
  WeeklyRecordCalendar,
} from '@/features/report';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

export default function ReportPage() {
  const navigate = useNavigate();
  const {
    monthLabel,
    monthlyAdditionalStickerCount,
    monthlyRecordCount,
    monthlyStickerImages,
    recentDiscovery,
    weeklyPeriodLabel,
    weeklyRecords,
  } = MOCK_EMPTY_REPORT_PAGE;

  return (
    <main className="overflow-hidden">
      <ReportHeroSection
        monthlyReportPath={ROUTE_PATHS.monthlyReport}
        monthLabel={monthLabel}
        onBack={() => navigate(-1)}
      />

      <div className="relative rounded-t-30 bg-neutral-00 pt-10 pr-4 pb-page-bottom pl-4.25">
        <div className="flex flex-col gap-6">
          <ReportSection title="이 주의 소비 기록">
            <WeeklyRecordCalendar
              historyPath={ROUTE_PATHS.spendingHistory}
              periodLabel={weeklyPeriodLabel}
              records={weeklyRecords}
            />
          </ReportSection>

          <ReportSection
            title={
              <>
                이번달 <span className="text-primary-500">{monthlyRecordCount}개</span>의 기록이
                쌓이고 있어요 !
              </>
            }
          >
            <MonthlyStickerSummary
              additionalCount={monthlyAdditionalStickerCount}
              emptyActionPath={ROUTE_PATHS.record}
              recordCount={monthlyRecordCount}
              stickers={monthlyStickerImages}
            />
          </ReportSection>

          <ReportSection title="최근발견">
            <RecentDiscoveryPanel messages={recentDiscovery} />
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
