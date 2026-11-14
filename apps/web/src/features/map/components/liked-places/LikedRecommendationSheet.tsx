import { useLikedPlaceDetailQuery } from '@/features/map/apis/hooks/useLikedPlaceDetailQuery';
import { useTogglePlaceLikeMutation } from '@/features/map/apis/hooks/useTogglePlaceLikeMutation';
import GoogleMapsLinkButton from '@/features/map/components/GoogleMapsLinkButton';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { getLikedPlacePhotoUrls } from '@/features/map/utils/likedPlacePhotos';
import { normalizeHomeCategory, toLikedPlaceRecordShop } from '@/features/map/utils/placeAdapters';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import type { RecordLocationState } from '@/shared/types/recordNavigation';
import { Button, LinkButton } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { StateView } from '@/shared/ui/state-view';

import LikedPlaceCardSkeleton from './LikedPlaceCardSkeleton';
import LikedPlaceSummary from './LikedPlaceSummary';

type LikedRecommendationSheetProps = {
  recommendationId: string;
};

/** 좋아요 지도 마커를 선택했을 때 보여주는 가게 요약과 기록 바로가기입니다. */
export default function LikedRecommendationSheet({
  recommendationId,
}: LikedRecommendationSheetProps) {
  const placeDetailQuery = useLikedPlaceDetailQuery(recommendationId);
  const likeMutation = useTogglePlaceLikeMutation();
  const closeLikedRecommendationIfMatches = useHomeBottomSheetStore(
    (state) => state.closeLikedRecommendationIfMatches
  );
  const placeDetail = placeDetailQuery.detail;
  if (placeDetailQuery.isLoading) {
    return (
      <div role="status" aria-label="좋아요한 가게 불러오는 중" className="pb-2">
        <LikedPlaceCardSkeleton />
        <div aria-hidden="true" className="mt-4 flex gap-2">
          <Skeleton className="h-13.5 w-16 shrink-0 rounded-full" />
          <Skeleton className="h-13.5 min-w-0 flex-1 rounded-full" />
        </div>
      </div>
    );
  }

  if (placeDetailQuery.isError) {
    return (
      <StateView
        variant="error"
        headingAs="h1"
        title="가게 정보를 불러오지 못했어요"
        description="잠시 후 다시 시도해주세요."
        actionLabel="다시 불러오기"
        onAction={() => void placeDetailQuery.refetch()}
        className="py-6"
      />
    );
  }

  if (!placeDetail?.name?.trim()) {
    return (
      <StateView
        variant="empty"
        headingAs="h1"
        title="선택한 가게를 찾을 수 없어요"
        description="지도에서 다른 가게를 선택해주세요."
        actionLabel="지도 홈으로"
        onAction={() => closeLikedRecommendationIfMatches(recommendationId)}
        className="py-6"
      />
    );
  }

  const name = placeDetail.name.trim();
  const category = normalizeHomeCategory(placeDetail.category);
  const address = placeDetail.roadAddress?.trim() || placeDetail.dongName?.trim();
  const photoUrls = getLikedPlacePhotoUrls(placeDetail.thumbnailUrls);
  const recordShop = toLikedPlaceRecordShop(placeDetail);
  const recordLocationState = recordShop
    ? ({ shop: recordShop, category } satisfies RecordLocationState)
    : undefined;

  const handleUnlike = () => {
    likeMutation.mutate(
      { placeId: Number(recommendationId), currentLiked: true },
      { onSuccess: () => closeLikedRecommendationIfMatches(recommendationId) }
    );
  };

  return (
    <div className="pb-2">
      <LikedPlaceSummary
        placeId={recommendationId}
        name={name}
        category={category}
        address={address}
        photoUrls={photoUrls}
        isUnlikePending={likeMutation.isPending}
        onUnlike={handleUnlike}
        headingAs="h1"
      />
      <div className="mt-4 flex gap-2">
        <GoogleMapsLinkButton
          address={address}
          googlePlaceId={placeDetail?.googlePlaceId?.trim()}
          placeName={name}
        />
        {recordLocationState ? (
          <LinkButton
            to={ROUTE_PATHS.record}
            state={recordLocationState}
            size="large"
            className="w-auto min-w-0 flex-1"
          >
            기록하기
          </LinkButton>
        ) : (
          <Button disabled size="large" className="w-auto min-w-0 flex-1">
            기록하기
          </Button>
        )}
      </div>
    </div>
  );
}
