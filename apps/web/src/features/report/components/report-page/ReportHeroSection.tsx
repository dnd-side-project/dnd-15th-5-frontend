import { Link } from 'react-router-dom';

import { ReportCardStackImage } from '@/shared/assets/images/report-page';

type ReportHeroSectionProps =
  | {
      variant: 'previous';
      to: string;
    }
  | {
      variant?: 'current';
      to: string;
      monthLabel: string;
    };

const REPORT_HERO_SECTION_CLASS_NAME =
  '[background:var(--background-report-page-banner)] relative overflow-hidden rounded-16';

/** 리포트 페이지 상단에서 월간 기록을 돌아보는 진입 배너를 보여줍니다. */
export default function ReportHeroSection(props: ReportHeroSectionProps) {
  if (props.variant === 'previous') {
    return (
      <section className={REPORT_HERO_SECTION_CLASS_NAME}>
        <Link
          className="relative flex h-30 items-center px-5.5 text-neutral-00 outline-none focus-visible:ring-2 focus-visible:ring-neutral-00 focus-visible:ring-inset"
          to={props.to}
        >
          <span className="relative z-report-hero-content flex flex-col items-start gap-1">
            <span className="text-heading-03-semibold">지난달 기록을 돌아보세요</span>
            <span className="text-body-01-semibold">
              지난달 리포트 보기 <span aria-hidden>→</span>
            </span>
          </span>
          <img
            alt=""
            aria-hidden
            className="absolute top-0 right-0 h-38.5 w-auto max-w-none object-contain"
            src={ReportCardStackImage}
          />
        </Link>
      </section>
    );
  }

  return (
    <section className={REPORT_HERO_SECTION_CLASS_NAME}>
      <div className="relative z-report-hero-content h-45">
        <div className="absolute top-10 left-5.5 z-report-hero-content">
          <h2 className="text-heading-02-semibold text-neutral-00">
            {props.monthLabel}의 기록을
            <br />
            돌아보세요
          </h2>
        </div>
        <div className="absolute bottom-5 left-5.5 z-report-hero-content">
          <Link
            className="inline-flex items-center gap-1 text-body-01-semibold text-neutral-00 outline-none focus-visible:ring-2 focus-visible:ring-neutral-00 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-400"
            to={props.to}
          >
            지난달 결산 보기 <span aria-hidden>→</span>
          </Link>
        </div>
        <img
          alt=""
          aria-hidden
          className="absolute top-0 right-0 h-full w-auto max-w-none object-contain"
          src={ReportCardStackImage}
        />
      </div>
    </section>
  );
}
