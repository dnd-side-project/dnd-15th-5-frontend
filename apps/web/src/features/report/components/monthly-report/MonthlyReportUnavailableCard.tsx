import { ReportCardTextureImage } from '@/shared/assets/images/preference-card';
import type { YearMonth } from '@/shared/types/yearMonth';

type MonthlyReportUnavailableCardProps = {
  selectedMonth: YearMonth;
};

/** 리포트가 생성되지 않은 월을 물음표 카드로 표시합니다. */
export default function MonthlyReportUnavailableCard({
  selectedMonth,
}: MonthlyReportUnavailableCardProps) {
  return (
    <article
      aria-label={`${selectedMonth.month}월 리포트 미생성 카드`}
      className="relative h-93.75 w-69 overflow-hidden rounded-15 bg-primary-300 shadow-report-preference-card"
    >
      <img
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-25 mix-blend-overlay select-none"
        draggable={false}
        src={ReportCardTextureImage}
      />
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center text-[132px] leading-none font-bold text-primary-500"
      >
        ?
      </span>
      <div className="absolute inset-x-5 bottom-8 text-center">
        <h2 className="break-keep text-title-02-semibold text-neutral-00">
          {selectedMonth.month}월 리포트가 없어요
        </h2>
        <p className="mt-2 break-keep text-body-02-semibold text-primary-100">
          다음 달 리포트를 위해 기록해 주세요
        </p>
      </div>
    </article>
  );
}
