import { useLikedPlaceDetailQuery } from '@/features/map/apis/hooks/useLikedPlaceDetailQuery';
import { useRecommendationRecordShopQuery } from '@/features/map/apis/hooks/useRecommendationRecordShopQuery';
import { useTogglePlaceLikeMutation } from '@/features/map/apis/hooks/useTogglePlaceLikeMutation';
import { useVisitedPlaceStickersQuery } from '@/features/map/apis/hooks/useVisitedPlaceStickersQuery';
import GoogleMapsLinkButton from '@/features/map/components/GoogleMapsLinkButton';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { getLikedPlacePhotoUrls } from '@/features/map/utils/likedPlacePhotos';
import { toLikedPlaceRecommendation } from '@/features/map/utils/placeAdapters';
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
  const visitedPlacesQuery = useVisitedPlaceStickersQuery();
  const placeDetailQuery = useLikedPlaceDetailQuery(recommendationId);
  const likeMutation = useTogglePlaceLikeMutation();
  const closeLikedRecommendationIfMatches = useHomeBottomSheetStore(
    (state) => state.closeLikedRecommendationIfMatches
  );
  const placeDetail = placeDetailQuery.detail;
  const visitedRecommendation = visitedPlacesQuery.likedRecommendations.find(
    ({ id }) => id === recommendationId
  );
  const recommendation = toLikedPlaceRecommendation(
    recommendationId,
    placeDetail,
    visitedRecommendation
  );
  const {
    query: recordShopQuery,
    isLibraryLoading,
    isLibraryError,
  } = useRecommendationRecordShopQuery(
    recommendation && !placeDetailQuery.isLoading ? recommendation : undefined
  );

  if (!recommendation && (visitedPlacesQuery.isPending || placeDetailQuery.isLoading)) {
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

  if (visitedPlacesQuery.isError && placeDetailQuery.isError) {
    return (
      <StateView
        variant="error"
        headingAs="h1"
        title="가게 정보를 불러오지 못했어요"
        description="잠시 후 다시 시도해주세요."
        actionLabel="다시 불러오기"
        onAction={() => {
          void visitedPlacesQuery.refetch();
          void placeDetailQuery.refetch();
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
  // TODO: 소비 등록 API가 내부 placeId를 직접 받으면 기록용 Google Places 조회도 제거한다.
  const photoUrls = getLikedPlacePhotoUrls(placeDetail?.thumbnailUrls, thumbnailSrc);
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
  const isResolvingRecordShop =
    placeDetailQuery.isLoading ||
    (!isLibraryError && (isLibraryLoading || recordShopQuery.isPending));

  const handleUnlike = () => {
    likeMutation.mutate(
      { placeId: Number(id), currentLiked: true },
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
        isLoading={placeDetailQuery.isLoading}
        isUnlikePending={likeMutation.isPending}
        onUnlike={handleUnlike}
        headingAs="h1"
      />
      <div className="mt-4 flex gap-2">
        <GoogleMapsLinkButton address={address} placeName={place.name} />
        {isResolvingRecordShop ? (
          <Button isLoading size="large" className="w-auto min-w-0 flex-1">
            기록하기
          </Button>
        ) : recordLocationState ? (
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
