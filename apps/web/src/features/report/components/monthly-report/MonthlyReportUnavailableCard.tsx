import { ChevronRightIcon } from '@/shared/assets/icons';
import { ReportCardTextureImage } from '@/shared/assets/images/preference-card';
import type { YearMonth } from '@/shared/types/yearMonth';

type MonthlyReportUnavailableCardProps = {
  isActionAvailable?: boolean;
  onViewCurrentReport: () => void;
  selectedMonth: YearMonth;
};

/** 카드가 생성되지 않은 월을 최신 월간 리포트로 이동할 수 있는 카드로 표시합니다. */
export default function MonthlyReportUnavailableCard({
  isActionAvailable = true,
  onViewCurrentReport,
  selectedMonth,
}: MonthlyReportUnavailableCardProps) {
  return (
    <article
      aria-label={`${selectedMonth.month}월 리포트 미생성 카드`}
      className="relative h-93.75 w-69 overflow-hidden rounded-15 bg-neutral-400 shadow-report-preference-card"
    >
      <img
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-25 select-none"
        draggable={false}
        src={ReportCardTextureImage}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-neutral-500">
        <h2 className="break-keep text-title-02-semibold">생성된 카드가 없어요</h2>
        <button
          className="mt-2 inline-flex items-center gap-1 text-body-02-medium outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
          disabled={!isActionAvailable}
          onClick={onViewCurrentReport}
          type="button"
        >
          이번달 리포트 보러가기
          <ChevronRightIcon aria-hidden className="size-4" />
        </button>
      </div>
    </article>
  );
}
