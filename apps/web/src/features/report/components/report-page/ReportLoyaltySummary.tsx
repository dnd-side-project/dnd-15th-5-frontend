import { ReportLoyaltyRankingImage } from '@/shared/assets/images/report-page';

/** 단골력 순위와 재방문 가게 요약을 보여줍니다. */
export default function ReportLoyaltySummary() {
  return (
    <section aria-label="단골력 요약" className="rounded-16 bg-neutral-00 px-3 py-4">
      <div className="flex items-center gap-4">
        <img
          alt=""
          aria-hidden
          className="h-10 shrink-0 object-contain"
          src={ReportLoyaltyRankingImage}
        />
        <p className="text-body-01-semibold text-neutral-700">
          단골력 <span className="text-primary-500">상위 5%</span>에 들고 있어요.
        </p>
      </div>
      <p className="mt-3 flex h-9 items-center justify-center rounded-08 bg-neutral-100 text-center text-caption-01-medium text-neutral-600">
        이번달 15개 기록중 12개가 재방문한 가게예요
      </p>
    </section>
  );
}
