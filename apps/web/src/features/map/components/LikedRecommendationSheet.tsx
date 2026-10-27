import { useNearbyPlaceRecommendationsQuery } from '@/features/map/apis/hooks/useNearbyPlaceRecommendationsQuery';
import { useRecommendationRecordShopQuery } from '@/features/map/apis/hooks/useRecommendationRecordShopQuery';
import { useTogglePlaceLikeMutation } from '@/features/map/apis/hooks/useTogglePlaceLikeMutation';
import { useVisitedPlaceStickersQuery } from '@/features/map/apis/hooks/useVisitedPlaceStickersQuery';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { LocationPinIcon, LikeIcon, StoreIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import type { RecordLocationState } from '@/shared/types/recordNavigation';
import { Button, LinkButton } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
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
  const visitedPlacesQuery = useVisitedPlaceStickersQuery();
  const likeMutation = useTogglePlaceLikeMutation();
  const showHome = useHomeBottomSheetStore((state) => state.showHome);
  const recommendation =
    recommendations.find(({ id }) => id === recommendationId) ??
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
        onAction={showHome}
        className="py-6"
      />
    );
  }

  const { id, place, thumbnailSrc } = recommendation;
  const galleryPhotoUrls = recordShopQuery.data?.photoUrls ?? [];
  const fallbackPhotoUrl = recordShopQuery.data?.photoUrl ?? thumbnailSrc;
  const photoUrls = [
    ...new Set(
      galleryPhotoUrls.length > 0 ? galleryPhotoUrls : fallbackPhotoUrl ? [fallbackPhotoUrl] : []
    ),
  ].slice(0, 3);
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
    likeMutation.mutate({ placeId: Number(id) }, { onSuccess: showHome });
  };

  return (
    <section aria-labelledby={`liked-recommendation-${id}`} className="pb-2">
      <div className="flex min-w-0 items-center gap-2.5 pr-4">
        <h1
          id={`liked-recommendation-${id}`}
          className="min-w-0 truncate text-body-01-semibold text-neutral-700"
          data-mp-mask=""
        >
          {place.name}
        </h1>
        <Chip>{place.category}</Chip>
        <button
          type="button"
          aria-label={`${place.name} 좋아요 해제`}
          onClick={handleUnlike}
          disabled={likeMutation.isPending}
          className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full text-red outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          <LikeIcon aria-hidden="true" className="size-[19px]" />
        </button>
      </div>

      <p
        className="mt-2.5 flex min-w-0 items-center gap-2 text-body-02-regular text-neutral-500"
        data-mp-mask=""
      >
        <LocationPinIcon aria-hidden="true" className="h-auto w-[9px] shrink-0 text-neutral-400" />
        <span className="line-clamp-2">{address || '주소 정보가 없어요'}</span>
      </p>

      <div
        className="mt-3 grid gap-1 overflow-hidden rounded-16 bg-neutral-100"
        style={{
          gridTemplateColumns: `repeat(${Math.max(photoUrls.length, 1)}, minmax(0, 1fr))`,
        }}
      >
        {photoUrls.length > 0 ? (
          photoUrls.map((photoUrl, index) => (
            <img
              key={photoUrl}
              src={photoUrl}
              alt={`${place.name} 사진 ${index + 1}`}
              data-mp-block=""
              loading="lazy"
              className="aspect-[1.15] h-full w-full object-cover"
            />
          ))
        ) : (
          <div className="flex aspect-[1.15] items-center justify-center text-neutral-400">
            <StoreIcon aria-hidden="true" className="size-12" />
          </div>
        )}
      </div>

      {isResolvingRecordShop ? (
        <Button isLoading size="large" className="mt-4 h-18 text-title-01-semibold">
          기록하기
        </Button>
      ) : recordLocationState ? (
        <LinkButton
          to={ROUTE_PATHS.record}
          state={recordLocationState}
          size="large"
          className="mt-4 h-18 text-title-01-semibold"
        >
          기록하기
        </LinkButton>
      ) : (
        <Button disabled size="large" className="mt-4 h-18 text-title-01-semibold">
          기록하기
        </Button>
      )}
    </section>
  );
}
