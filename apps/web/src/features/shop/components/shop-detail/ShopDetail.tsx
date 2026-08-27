import { useCallback, useRef } from 'react';

import { usePlaceVisitsInfiniteQuery } from '@/features/shop/apis/hooks/usePlaceVisitsInfiniteQuery';
import { useGetPlaceDetail } from '@/features/shop/apis/queries';
import { LocationPinIcon } from '@/shared/assets/icons';
import { getStickerImages } from '@/shared/assets/images/stickers';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { Chip } from '@/shared/ui/chip';
import { RegularShopBadge } from '@/shared/ui/regular-shop-badge';
import { Spinner } from '@/shared/ui/spinner';
import { StateView } from '@/shared/ui/state-view';

import ShopStickerHero from './ShopStickerHero';
import VisitHistoryList from './VisitHistoryList';
import VisitSummaryCard from './VisitSummaryCard';

import type { ReactNode } from 'react';

type ShopDetailProps = {
  headerContent: ReactNode;
  onViewOnMap: () => void;
  placeId: number;
};

export default function ShopDetail({ headerContent, onViewOnMap, placeId }: ShopDetailProps) {
  const isValidPlaceId = Number.isSafeInteger(placeId) && placeId > 0;
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const placeDetailQuery = useGetPlaceDetail(placeId, {
    query: { enabled: isValidPlaceId },
  });
  const placeVisitsQuery = usePlaceVisitsInfiniteQuery(placeId);
  const { fetchNextPage, refetch: refetchPlaceVisits } = placeVisitsQuery;
  const handleVisitHistoryLoadMore = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);
  const handleVisitHistoryRetry = useCallback(() => {
    void refetchPlaceVisits();
  }, [refetchPlaceVisits]);

  if (!isValidPlaceId) {
    return (
      <StateView
        variant="error"
        headingAs="h1"
        title="가게 정보를 찾을 수 없어요"
        description="지도에서 가게를 다시 선택해주세요."
        actionLabel="지도로 돌아가기"
        to={ROUTE_PATHS.home}
        className="pt-30"
      />
    );
  }

  if (placeDetailQuery.isPending) {
    return (
      <div
        role="status"
        aria-label="가게 상세 불러오는 중"
        className="flex h-dvh items-center justify-center"
      >
        <Spinner className="size-7 text-primary-500" />
      </div>
    );
  }

  const place = placeDetailQuery.data?.data;
  if (placeDetailQuery.isError || !place) {
    return (
      <StateView
        variant="error"
        headingAs="h1"
        title="가게 정보를 불러오지 못했어요"
        description="잠시 후 다시 시도해주세요."
        actionLabel="다시 불러오기"
        onAction={() => void placeDetailQuery.refetch()}
        className="pt-30"
      />
    );
  }

  const visits = placeVisitsQuery.data?.pages.flatMap((page) => page.data?.visits ?? []) ?? [];
  const totalVisitCount = place.stats?.totalVisitCount ?? visits.length;
  const stickerImages = getStickerImages(place.recentStickers ?? []);

  return (
    <article className="-mx-4 flex h-dvh flex-col overflow-hidden bg-neutral-00">
      <ShopStickerHero
        key={placeId}
        headerContent={headerContent}
        placeId={placeId}
        stickerImages={stickerImages}
      />

      <div className="relative z-10 -mt-8.25 flex min-h-0 flex-1 flex-col rounded-t-30 bg-neutral-00 px-4 pt-8">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="min-w-0 truncate text-title-01-semibold text-neutral-700">
            {place.placeName}
          </h1>
          {place.isRegular && <RegularShopBadge />}
        </div>

        <div className="mt-2 flex min-w-0 items-center gap-2">
          <Chip>{place.category ?? '기타'}</Chip>
          <span aria-hidden="true" className="text-caption-01-regular text-neutral-300">
            |
          </span>
          <p className="flex min-w-0 items-center gap-1 text-caption-01-regular text-neutral-500">
            <LocationPinIcon aria-hidden="true" className="shrink-0" />
            <span className="truncate">{place.address}</span>
          </p>
        </div>

        <div
          ref={scrollRootRef}
          role="region"
          aria-label="방문 요약과 방문 기록"
          className="scrollbar-hidden pb-safe-bottom -mx-4 mt-6 min-h-0 flex-1 overflow-y-auto px-4"
        >
          <VisitSummaryCard
            firstVisitedDate={place.stats?.firstVisitedDate}
            monthlyVisitCount={place.stats?.monthlyVisitCount ?? 0}
            onViewOnMap={onViewOnMap}
            placeId={placeId}
            totalVisitCount={totalVisitCount}
          />
          <VisitHistoryList
            visits={visits}
            isLoading={placeVisitsQuery.isPending}
            isError={placeVisitsQuery.isError && !placeVisitsQuery.isFetchNextPageError}
            isFetchNextPageError={placeVisitsQuery.isFetchNextPageError}
            hasNextPage={Boolean(placeVisitsQuery.hasNextPage)}
            isFetchingNextPage={placeVisitsQuery.isFetchingNextPage}
            onLoadMore={handleVisitHistoryLoadMore}
            onRetry={handleVisitHistoryRetry}
            scrollRootRef={scrollRootRef}
          />
        </div>
      </div>
    </article>
  );
}
