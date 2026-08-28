import { Link } from 'react-router-dom';

import ReportHeroCard from './report-hero-card/ReportHeroCard';

type ReportHeroSectionProps = {
  monthlyReportPath: string;
  monthLabel: string;
};

/** 리포트 페이지 상단의 생성 중 안내와 카드 애니메이션을 보여줍니다. */
export default function ReportHeroSection({
  monthlyReportPath,
  monthLabel,
}: ReportHeroSectionProps) {
  return (
    <section className="relative h-63">
      <div aria-hidden className="absolute inset-x-0 top-42 h-51 bg-report-hero" />
      <div className="absolute inset-x-0 top-18 z-report-hero-content flex items-end justify-between px-7.5">
        <div className="relative z-report-hero-content flex flex-col items-start gap-3.5">
          <h1 className="text-heading-03-bold text-neutral-900">
            {monthLabel} 취향 카드
            <br />
            만들어지는 중 ...
          </h1>
          <Link
            className="block w-full rounded-full border-2 border-primary-500 bg-primary-100 px-3.5 py-2.5 text-center text-body-02-semibold tracking-[-0.2px] whitespace-nowrap text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:outline-none"
            to={monthlyReportPath}
          >
            지난달 리포트 보러가기
          </Link>
        </div>
        <ReportHeroCard />
      </div>
    </section>
  );
}
