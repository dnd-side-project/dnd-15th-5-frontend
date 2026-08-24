import { MapIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { Button, LinkButton } from '@/shared/ui/button';

import { formatFirstVisitedDate } from '../../utils/formatVisit';
import { getVisitCelebration, normalizeVisitCount } from '../../utils/getVisitCelebration';

type VisitSummaryCardProps = {
  firstVisitedDate?: string;
  monthlyVisitCount: number;
  onViewOnMap: () => void;
  placeId: number;
  totalVisitCount: number;
};

export default function VisitSummaryCard({
  firstVisitedDate,
  monthlyVisitCount,
  onViewOnMap,
  placeId,
  totalVisitCount,
}: VisitSummaryCardProps) {
  const normalizedVisitCount = normalizeVisitCount(totalVisitCount);
  const stableRandomValue = Math.abs(Math.sin(placeId + normalizedVisitCount)) % 1;
  const celebration = getVisitCelebration(normalizedVisitCount, stableRandomValue);

  return (
    <section aria-labelledby="visit-summary-title" className="rounded-32 bg-primary-50 p-4">
      <h2 id="visit-summary-title" className="text-center text-body-01-medium text-neutral-700">
        {normalizedVisitCount === 1 ? (
          celebration.title
        ) : (
          <>
            총 <span className="text-primary-500">{normalizedVisitCount}번</span> 방문하셨네요!
          </>
        )}
      </h2>
      <p className="mt-1 text-center text-body-01-medium text-neutral-700">{celebration.message}</p>

      <dl className="mt-4 grid grid-cols-3 gap-2">
        <div className="flex min-w-0 flex-col items-center justify-center rounded-16 bg-neutral-00 py-3.5">
          <dt className="text-caption-01-medium text-neutral-700">첫 방문</dt>
          <dd className="mt-2 truncate text-title-02-semibold text-neutral-700">
            {formatFirstVisitedDate(firstVisitedDate)}
          </dd>
        </div>
        <div className="flex min-w-0 flex-col items-center justify-center rounded-16 bg-neutral-00 py-3.5">
          <dt className="text-caption-01-medium text-neutral-500">이번 달</dt>
          <dd className="mt-2 text-title-02-semibold text-neutral-700">{monthlyVisitCount}번</dd>
        </div>
        <div className="flex min-w-0 flex-col items-center justify-center rounded-16 bg-neutral-00 py-3.5">
          <dt className="text-caption-01-medium text-neutral-500">누적 방문</dt>
          <dd className="mt-2 text-title-02-semibold text-neutral-700">{normalizedVisitCount}번</dd>
        </div>
      </dl>

      <div className="mt-4 flex gap-4">
        <LinkButton to={ROUTE_PATHS.record} size="large" className="h-12.5 min-w-0 flex-1">
          소비 기록 추가
        </LinkButton>
        <Button
          variant="icon-primary"
          size="large"
          aria-label="지도에서 가게 보기"
          onClick={onViewOnMap}
          className="size-12.5"
        >
          <MapIcon aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
