import { useNearbyPlaceRecommendationsQuery } from '@/features/map/apis/hooks/useNearbyPlaceRecommendationsQuery';
import { useRecommendationRecordShopQuery } from '@/features/map/apis/hooks/useRecommendationRecordShopQuery';
import { useTogglePlaceLikeMutation } from '@/features/map/apis/hooks/useTogglePlaceLikeMutation';
import { useVisitedPlaceStickersQuery } from '@/features/map/apis/hooks/useVisitedPlaceStickersQuery';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { getLikedPlacePhotoUrls } from '@/features/map/utils/likedPlacePhotos';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import type { RecordLocationState } from '@/shared/types/recordNavigation';
import { Button, LinkButton } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';
import { StateView } from '@/shared/ui/state-view';

import LikedPlaceSummary from './LikedPlaceSummary';

type LikedRecommendationSheetProps = {
  recommendationId: string;
};

/** 좋아요 지도 마커를 선택했을 때 보여주는 가게 요약과 기록 바로가기입니다. */
export default function LikedRecommendationSheet({
  recommendationId,
}: LikedRecommendationSheetProps) {
  const { recommendations, isPending, isError, refetch } = useNearbyPlaceRecommendationsQuery();
  const visitedPlacesQuery = useVisitedPlaceStickersQuery();
  const likeMutation = useTogglePlaceLikeMutation();
  const closeLikedRecommendationIfMatches = useHomeBottomSheetStore(
    (state) => state.closeLikedRecommendationIfMatches
  );
  const nearbyRecommendation = recommendations.find(({ id }) => id === recommendationId);
  const recommendation =
    nearbyRecommendation ??
    visitedPlacesQuery.likedRecommendations.find(({ id }) => id === recommendationId);
  const {
    query: recordShopQuery,
    isLibraryLoading,
    isLibraryError,
  } = useRecommendationRecordShopQuery(recommendation);

  if (!recommendation && (isPending || visitedPlacesQuery.isPending)) {
    return (
      <div
        role="status"
        aria-label="좋아요한 가게 불러오는 중"
        className="flex min-h-36 items-center justify-center"
      >
        <Spinner className="size-6 text-primary-500" />
      </div>
    );
  }

  if (isError && visitedPlacesQuery.isError) {
    return (
      <StateView
        variant="error"
        headingAs="h1"
        title="가게 정보를 불러오지 못했어요"
        description="잠시 후 다시 시도해주세요."
        actionLabel="다시 불러오기"
        onAction={() => {
          void refetch();
          void visitedPlacesQuery.refetch();
        }}
        className="py-6"
      />
    );
  }

  if (!recommendation) {
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

  const { id, place, thumbnailSrc } = recommendation;
  // TODO: placeId 기반 백엔드 상세 API가 googlePlaceId, 가게명, 도로명 주소, 좌표, 사진 URL(최대 3장)을 제공하면 Google Places 조회를 제거하고 기록 작성과 바텀시트에 사용한다.
  const fallbackPhotoUrl = recordShopQuery.data?.photoUrl ?? thumbnailSrc;
  const photoUrls = getLikedPlacePhotoUrls(recordShopQuery.data?.photoUrls, fallbackPhotoUrl);
  const address = recordShopQuery.data?.address || place.address;
  const recordLocationState = recordShopQuery.data
    ? ({
        shop: {
          ...recordShopQuery.data,
          name: place.name,
        },
        category: place.category,
      } satisfies RecordLocationState)
    : undefined;
  const isResolvingRecordShop = !isLibraryError && (isLibraryLoading || recordShopQuery.isPending);

  const handleUnlike = () => {
    likeMutation.mutate(
      { placeId: Number(id) },
      { onSuccess: () => closeLikedRecommendationIfMatches(id) }
    );
  };

  return (
    <div className="pb-2">
      <LikedPlaceSummary
        placeId={id}
        name={place.name}
        category={place.category}
        address={address}
        photoUrls={photoUrls}
        isLoading={isResolvingRecordShop}
        isUnlikePending={likeMutation.isPending}
        onUnlike={handleUnlike}
        headingAs="h1"
      />
      {isResolvingRecordShop ? (
        <Button isLoading size="large" className="mt-4">
          기록하기
        </Button>
      ) : recordLocationState ? (
        <LinkButton
          to={ROUTE_PATHS.record}
          state={recordLocationState}
          size="large"
          className="mt-4"
        >
          기록하기
        </LinkButton>
      ) : (
        <Button disabled size="large" className="mt-4">
          기록하기
        </Button>
      )}
    </div>
  );
}
