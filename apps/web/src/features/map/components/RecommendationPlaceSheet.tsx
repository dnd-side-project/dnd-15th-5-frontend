import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useSyncExternalStore } from 'react';

import { useLikedPlaceDetailQuery } from '@/features/map/apis/hooks/useLikedPlaceDetailQuery';
import { LIKED_PLACES_INFINITE_QUERY_KEY } from '@/features/map/apis/hooks/useLikedPlacesInfiniteQuery';
import { useTogglePlaceLikeMutation } from '@/features/map/apis/hooks/useTogglePlaceLikeMutation';
import { getCachedLikedState } from '@/features/map/apis/services/likeMutationCache';
import { getLikedPlacePhotoUrls } from '@/features/map/utils/likedPlacePhotos';
import { normalizeHomeCategory, toLikedPlaceRecordShop } from '@/features/map/utils/placeAdapters';
import { LikeIcon, LocationPinIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import type { RecordLocationState } from '@/shared/types/recordNavigation';
import { Button, LinkButton } from '@/shared/ui/button';
import { StoreImageFallback } from '@/shared/ui/card';
import { Chip } from '@/shared/ui/chip';
import { StateView } from '@/shared/ui/state-view';

import GoogleMapsLinkButton from './GoogleMapsLinkButton';
import LikedPlaceCardSkeleton from './liked-places/LikedPlaceCardSkeleton';

type RecommendationPlaceSheetProps = {
  placeId: string;
};

type PlacePhotoProps = { name: string; url: string; index: number };

function PlacePhoto({ name, url, index }: PlacePhotoProps) {
  const [hasError, setHasError] = useState(false);
  return hasError ? (
    <StoreImageFallback
      ariaLabel={`${name} 사진을 불러올 수 없음`}
      className="h-25 w-[calc((100%-0.5rem)/3)] shrink-0"
      iconClassName="size-12"
    />
  ) : (
    <img
      src={url}
      alt={`${name} 사진 ${index + 1}`}
      loading="lazy"
      data-mp-block=""
      className="h-25 w-[calc((100%-0.5rem)/3)] shrink-0 object-cover"
      onError={() => setHasError(true)}
    />
  );
}

/** 일반·좋아요 장소 상세 콘텐츠입니다. 뒤로가기와 시트 수명은 부모 오버레이가 관리합니다. */
export default function RecommendationPlaceSheet({ placeId }: RecommendationPlaceSheetProps) {
  const query = useLikedPlaceDetailQuery(placeId);
  const mutation = useTogglePlaceLikeMutation();
  const [confirmedLike, setConfirmedLike] = useState<{ placeId: string; liked: boolean }>();
  const queryClient = useQueryClient();
  const numericPlaceId = Number(placeId);
  const isValidPlaceId = Number.isSafeInteger(numericPlaceId) && numericPlaceId > 0;
  const subscribe = useCallback(
    (onChange: () => void) => queryClient.getQueryCache().subscribe(onChange),
    [queryClient]
  );
  // NOTE: 상세 DTO에는 liked가 없으므로 mutation이 낙관적으로 갱신하는 캐시를 구독한다.
  const getLikedSnapshot = useCallback(
    () => getCachedLikedState(queryClient, numericPlaceId, LIKED_PLACES_INFINITE_QUERY_KEY),
    [queryClient, numericPlaceId]
  );
  const cachedLiked = useSyncExternalStore(subscribe, getLikedSnapshot, getLikedSnapshot);
  const confirmedLiked = confirmedLike?.placeId === placeId ? confirmedLike.liked : undefined;
  const currentLiked = cachedLiked ?? confirmedLiked;
  const detail = query.detail;

  if (isValidPlaceId && query.isLoading) {
    return (
      <div role="status" aria-label="가게 정보 불러오는 중">
        <LikedPlaceCardSkeleton />
      </div>
    );
  }

  if (isValidPlaceId && query.isError && !detail?.name?.trim()) {
    return (
      <StateView
        variant="error"
        headingAs="h1"
        title="가게 정보를 불러오지 못했어요"
        description="잠시 후 다시 시도해주세요."
        actionLabel="다시 불러오기"
        onAction={() => void query.refetch()}
        className="py-6"
      />
    );
  }

  if (!isValidPlaceId || !detail?.name?.trim()) {
    return (
      <StateView
        variant="empty"
        headingAs="h1"
        title="선택한 가게를 찾을 수 없어요"
        description="지도에서 다른 가게를 선택해주세요."
        className="py-6"
      />
    );
  }

  const name = detail.name.trim();
  const category = normalizeHomeCategory(detail.category);
  const address = detail.roadAddress?.trim() || detail.dongName?.trim();
  const photoUrls = getLikedPlacePhotoUrls(detail.thumbnailUrls);
  const shop = toLikedPlaceRecordShop(detail);
  const recordState = shop ? ({ shop, category } satisfies RecordLocationState) : undefined;
  const handleToggleLike = () => {
    mutation.mutate(
      { placeId: numericPlaceId, currentLiked },
      {
        onSuccess: (response) => {
          setConfirmedLike({ placeId, liked: response.data?.liked ?? !currentLiked });
        },
      }
    );
  };

  return (
    <section aria-labelledby={`recommendation-place-${placeId}`}>
      <div className="flex min-w-0 items-center gap-2.5">
        <h1
          id={`recommendation-place-${placeId}`}
          className="min-w-0 truncate text-title-02-semibold text-neutral-700"
          data-mp-mask=""
        >
          {name}
        </h1>
        <Chip>{category}</Chip>
        <button
          type="button"
          aria-label={`${name} 좋아요${currentLiked ? ' 해제' : ''}`}
          aria-pressed={currentLiked ?? false}
          disabled={mutation.isPending}
          onClick={handleToggleLike}
          className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:opacity-50"
        >
          <LikeIcon
            aria-hidden="true"
            className={`size-5 ${currentLiked ? 'text-red' : 'text-neutral-400'}`}
          />
        </button>
      </div>
      <p
        className="mt-2 flex items-center gap-1 text-body-02-regular text-neutral-500"
        data-mp-mask=""
      >
        <LocationPinIcon aria-hidden="true" className="w-3 shrink-0 text-neutral-400" />
        {address || '주소 정보가 없어요'}
      </p>
      <div aria-label={`${name} 사진`} className="mt-3 flex gap-1 overflow-x-auto rounded-08">
        {photoUrls.length ? (
          photoUrls.map((url, index) => (
            <PlacePhoto key={`${placeId}-${url}`} name={name} url={url} index={index} />
          ))
        ) : (
          <StoreImageFallback className="h-25 w-full" iconClassName="size-12" />
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <GoogleMapsLinkButton
          address={address}
          googlePlaceId={detail.googlePlaceId?.trim()}
          placeName={name}
        />
        {recordState ? (
          <LinkButton
            to={ROUTE_PATHS.record}
            state={recordState}
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
    </section>
  );
}
