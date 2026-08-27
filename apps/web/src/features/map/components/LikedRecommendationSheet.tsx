import { useNearbyPlaceRecommendationsQuery } from '@/features/map/apis/hooks/useNearbyPlaceRecommendationsQuery';
import { useTogglePlaceLikeMutation } from '@/features/map/apis/hooks/useTogglePlaceLikeMutation';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { getDistrict, getGoogleMapsPlaceUrl } from '@/features/map/utils/recommendation';
import { BlueLocationPinIcon, LikeIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { LinkButton } from '@/shared/ui/button';
import { PlaceTagCard } from '@/shared/ui/card';
import { Spinner } from '@/shared/ui/spinner';
import { StateView } from '@/shared/ui/state-view';

type LikedRecommendationSheetProps = {
  recommendationId: string;
};

/** 좋아요 지도 마커를 선택했을 때 보여주는 가게 요약과 기록 바로가기입니다. */
export default function LikedRecommendationSheet({
  recommendationId,
}: LikedRecommendationSheetProps) {
  const { recommendations, isPending, isError, refetch } = useNearbyPlaceRecommendationsQuery();
  const likeMutation = useTogglePlaceLikeMutation();
  const showHome = useHomeBottomSheetStore((state) => state.showHome);
  const recommendation = recommendations.find(({ id }) => id === recommendationId);

  if (isPending) {
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

  if (isError) {
    return (
      <StateView
        variant="error"
        headingAs="h1"
        title="가게 정보를 불러오지 못했어요"
        description="잠시 후 다시 시도해주세요."
        actionLabel="다시 불러오기"
        onAction={() => void refetch()}
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
        onAction={showHome}
        className="py-6"
      />
    );
  }

  const { googleMapsUri, id, place, thumbnailSrc } = recommendation;

  const handleUnlike = () => {
    likeMutation.mutate({ placeId: Number(id) }, { onSuccess: showHome });
  };

  return (
    <section aria-labelledby={`liked-recommendation-${id}`}>
      <h1 id={`liked-recommendation-${id}`} className="sr-only">
        {place.name}
      </h1>

      <div className="relative pr-10">
        <PlaceTagCard
          thumbnailSrc={thumbnailSrc}
          thumbnailSize="large"
          title={place.name}
          tags={[
            { label: getDistrict(place.address), icon: BlueLocationPinIcon },
            { label: place.category },
          ]}
          footer={
            <a
              href={getGoogleMapsPlaceUrl(place.name, place.address, googleMapsUri)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex px-4 py-1.5 items-center justify-center rounded-08 border border-neutral-200 text-caption-01-medium text-neutral-500 outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              지도앱에서 확인하기
            </a>
          }
        />
        <button
          type="button"
          aria-label={`${place.name} 좋아요 해제`}
          onClick={handleUnlike}
          disabled={likeMutation.isPending}
          className="absolute top-0 right-1 flex size-8 items-center justify-center rounded-full text-primary-500 outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          <LikeIcon aria-hidden="true" className="size-5" />
        </button>
      </div>

      <LinkButton to={ROUTE_PATHS.record} size="large" className="mt-4">
        기록하기
      </LinkButton>
    </section>
  );
}
