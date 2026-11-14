import { useCallback } from 'react';

import { usePlaceVisitsInfiniteQuery } from '@/features/shop/apis/hooks/usePlaceVisitsInfiniteQuery';
import { useGetPlaceDetail } from '@/features/shop/apis/queries';
import type { ShopSearchResult } from '@/features/shop/types';
import { createShopRecordLocationState } from '@/features/shop/utils/createShopRecordLocationState';
import { getStickerImages } from '@/shared/assets/images/stickers';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import type { ConsumptionActions } from '@/shared/types/consumptionActions';
import { StateView } from '@/shared/ui/state-view';
import { isPositiveSafeInteger } from '@/shared/utils/isPositiveSafeInteger';

import ShopDetailSkeleton from './ShopDetailSkeleton';
import ShopDetailView from './ShopDetailView';

import type { ReactNode } from 'react';

type ShopDetailProps = ConsumptionActions & {
  headerContent: ReactNode;
  onViewOnMap: () => void;
  placeId: number;
  recordShop?: ShopSearchResult;
  renderVisitSticker?: (consumptionId: number) => ReactNode;
  scrollToDate?: string;
  scrollToConsumptionId?: number;
  isRestoreTargetPending?: boolean;
};

export default function ShopDetail({
  onEditRecord,
  onDeleteRecord,
  headerContent,
  onViewOnMap,
  placeId,
  recordShop,
  renderVisitSticker,
  scrollToDate,
  scrollToConsumptionId,
  isRestoreTargetPending,
}: ShopDetailProps) {
  const isValidPlaceId = isPositiveSafeInteger(placeId);
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
    return <ShopDetailSkeleton headerContent={headerContent} />;
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
  const summaryStickerImages = getStickerImages(place.stickerSummary ?? []);
  const stickerImages =
    summaryStickerImages.length > 0
      ? summaryStickerImages
      : getStickerImages(place.recentStickers ?? []);
  const recordLocationState = createShopRecordLocationState({
    address: place.address,
    category: place.category,
    placeName: place.placeName ?? '',
    recordShop,
  });

  return (
    <ShopDetailView
      key={placeId}
      headerContent={headerContent}
      onViewOnMap={onViewOnMap}
      placeId={placeId}
      place={place}
      recordLocationState={recordLocationState}
      stickerImages={stickerImages}
      loadedVisitPageCount={placeVisitsQuery.data?.pages.length ?? 0}
      scrollToDate={scrollToDate}
      scrollToConsumptionId={scrollToConsumptionId}
      isRestoreTargetPending={isRestoreTargetPending || placeVisitsQuery.isRefetching}
      visitHistory={{
        onEditRecord,
        onDeleteRecord,
        placeName: place.placeName,
        renderVisitSticker,
        visits,
        isLoading: placeVisitsQuery.isPending,
        isError: placeVisitsQuery.isError && !placeVisitsQuery.isFetchNextPageError,
        isFetchNextPageError: placeVisitsQuery.isFetchNextPageError,
        hasNextPage: Boolean(placeVisitsQuery.hasNextPage),
        isFetchingNextPage: placeVisitsQuery.isFetchingNextPage,
        onLoadMore: handleVisitHistoryLoadMore,
        onRetry: handleVisitHistoryRetry,
      }}
    />
  );
}
