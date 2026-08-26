import { Link } from 'react-router-dom';

import { GetFrequentPlacesPeriod } from '@/features/report/apis/dto';
import { useFrequentPlacesInfiniteQuery } from '@/features/report/apis/hooks/useFrequentPlacesInfiniteQuery';
import { toFrequentShops } from '@/features/report/utils/frequentPlaces';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { Spinner } from '@/shared/ui/spinner';
import { StateView } from '@/shared/ui/state-view';

import FrequentShopItem from './FrequentShopItem';

import type { ReactNode } from 'react';

type FrequentShopSummaryProps = {
  headerContent?: ReactNode;
};

const SUMMARY_SHOP_COUNT = 7;

/** 홈 바텀시트에 이번 달 방문 횟수 기준 상위 단골 가게를 요약해 보여줍니다. */
export default function FrequentShopSummary({ headerContent }: FrequentShopSummaryProps) {
  const query = useFrequentPlacesInfiniteQuery({
    period: GetFrequentPlacesPeriod.THIS_MONTH,
    size: SUMMARY_SHOP_COUNT,
  });
  const frequentShops = toFrequentShops(
    query.data?.pages.flatMap((page) => page.data?.places ?? []) ?? []
  ).slice(0, SUMMARY_SHOP_COUNT);

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-sticky-header bg-neutral-00 pt-1">{headerContent}</header>

      <h1 className="sr-only">자주 소비한 곳</h1>
      <p className="mt-4 text-center text-body-02-medium text-neutral-500">
        이번달 가장 많이 방문했어요!
      </p>
      {query.isPending ? (
        <div
          role="status"
          aria-label="자주 소비한 곳 불러오는 중"
          className="flex justify-center py-12"
        >
          <Spinner className="size-6 text-primary-500" />
        </div>
      ) : query.isError ? (
        <StateView
          variant="error"
          headingAs="h2"
          title="자주 소비한 곳을 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요."
          actionLabel="다시 불러오기"
          onAction={() => void query.refetch()}
          className="py-8"
        />
      ) : frequentShops.length > 0 ? (
        <ol className="-mx-4 flex flex-col gap-6 pt-4">
          {frequentShops.map((shop) => (
            <FrequentShopItem key={shop.id} shop={shop} />
          ))}
        </ol>
      ) : (
        <StateView
          variant="empty"
          headingAs="h2"
          title="아직 기록이 없어요"
          description="소비 기록을 작성하면 자주 찾는 곳을 보여드릴게요."
          actionLabel="소비 기록 작성하기"
          to={ROUTE_PATHS.record}
          className="py-8"
        />
      )}

      <Link
        to={ROUTE_PATHS.frequentShopList}
        className="mt-4 mb-28 inline-flex h-8 self-center items-center justify-center rounded-full bg-neutral-100 px-4 text-body-02-medium text-neutral-600 outline-none hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1 active:bg-neutral-300"
      >
        누적기록 보기
      </Link>
    </div>
  );
}
