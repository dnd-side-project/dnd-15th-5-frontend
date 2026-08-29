import { Link } from 'react-router-dom';

import { ChevronRightIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

type HomePreferenceBannerProps = {
  recordedShopCount: number | undefined;
};

/**
 * 지도 홈 상단에 뜨는 이번 달 취향 기록 요약 배너입니다.
 *
 * 누르면 리포트 화면으로 이동합니다.
 */
export default function HomePreferenceBanner({ recordedShopCount }: HomePreferenceBannerProps) {
  const currentMonth = new Date().getMonth() + 1;

  return (
    <Link
      to={ROUTE_PATHS.report}
      className="flex min-w-0 items-center gap-3 rounded-full bg-neutral-00 py-2 pr-2 pl-4 shadow-preference-banner transition-colors hover:bg-neutral-50"
    >
      <span className="truncate text-body-02-semibold text-neutral-700">
        {currentMonth}월 취향 쌓는 중
      </span>
      {recordedShopCount !== undefined && (
        <span className="shrink-0 text-label-01-medium text-neutral-500">
          {recordedShopCount}곳 기록
        </span>
      )}
      <ChevronRightIcon aria-hidden="true" className="size-4 shrink-0 text-neutral-400" />
    </Link>
  );
}
