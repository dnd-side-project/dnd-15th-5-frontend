import { useEffect, useRef } from 'react';

import { useNearbyPlaceRecommendationsQuery } from '@/features/map/apis/hooks/useNearbyPlaceRecommendationsQuery';
import { useTogglePlaceLikeMutation } from '@/features/map/apis/hooks/useTogglePlaceLikeMutation';
import { useShopRecommendationStore } from '@/features/map/stores/shopRecommendationStore';
import { getDistrict, getGoogleMapsPlaceUrl } from '@/features/map/utils/recommendation';
import { BlueLocationPinIcon, ChevronRightIcon, LikeIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';
import { PlaceTagCard } from '@/shared/ui/card';
import { Spinner } from '@/shared/ui/spinner';
import { StateView } from '@/shared/ui/state-view';

import type { UIEvent } from 'react';

const CARD_GAP_PX = 12;
const PROGRAMMATIC_SCROLL_FALLBACK_MS = 1_000;

/** 가게 추천 바텀시트 안에 표시하는 추천 캐러셀 콘텐츠입니다. */
export default function ShopRecommendationSheet() {
  const { recommendations, isPending, isError, refetch } = useNearbyPlaceRecommendationsQuery();
  const likeMutation = useTogglePlaceLikeMutation();
  const activeRecommendationId = useShopRecommendationStore(
    (state) => state.activeRecommendationId
  );
  const setActiveRecommendation = useShopRecommendationStore(
    (state) => state.setActiveRecommendation
  );
  const carouselRef = useRef<HTMLUListElement>(null);
  const programmaticScrollTargetRef = useRef<number | null>(null);
  const programmaticScrollTimeoutRef = useRef<number | null>(null);
  const activeIndex = Math.max(
    0,
    recommendations.findIndex(({ id }) => id === activeRecommendationId)
  );

  useEffect(() => {
    const currentActiveRecommendationId =
      useShopRecommendationStore.getState().activeRecommendationId;
    const hasActiveRecommendation = recommendations.some(
      ({ id }) => id === currentActiveRecommendationId
    );
    const firstRecommendation = recommendations[0];
    if (!hasActiveRecommendation && firstRecommendation) {
      setActiveRecommendation(firstRecommendation.id);
    }
  }, [recommendations, setActiveRecommendation]);

  useEffect(() => {
    const carousel = carouselRef.current;
    const firstCard = carousel?.firstElementChild as HTMLElement | null;
    if (!carousel || !firstCard) {
      return;
    }

    const targetLeft = activeIndex * (firstCard.offsetWidth + CARD_GAP_PX);
    if (!carousel.scrollTo || Math.abs(carousel.scrollLeft - targetLeft) <= 1) {
      programmaticScrollTargetRef.current = null;
      return;
    }

    programmaticScrollTargetRef.current = targetLeft;
    programmaticScrollTimeoutRef.current = window.setTimeout(() => {
      programmaticScrollTargetRef.current = null;
      programmaticScrollTimeoutRef.current = null;
    }, PROGRAMMATIC_SCROLL_FALLBACK_MS);
    carousel.scrollTo({
      left: targetLeft,
      behavior: 'smooth',
    });

    return () => {
      if (programmaticScrollTimeoutRef.current !== null) {
        window.clearTimeout(programmaticScrollTimeoutRef.current);
        programmaticScrollTimeoutRef.current = null;
      }
      programmaticScrollTargetRef.current = null;
    };
  }, [activeIndex]);

  const handleCarouselScroll = (event: UIEvent<HTMLUListElement>) => {
    const carousel = event.currentTarget;
    const firstCard = carousel.firstElementChild as HTMLElement | null;
    if (!firstCard) {
      return;
    }

    const programmaticTarget = programmaticScrollTargetRef.current;
    if (programmaticTarget !== null) {
      if (Math.abs(carousel.scrollLeft - programmaticTarget) <= 1) {
        programmaticScrollTargetRef.current = null;
        if (programmaticScrollTimeoutRef.current !== null) {
          window.clearTimeout(programmaticScrollTimeoutRef.current);
          programmaticScrollTimeoutRef.current = null;
        }
      }
      return;
    }

    const cardStep = firstCard.offsetWidth + CARD_GAP_PX;
    if (cardStep === 0) {
      return;
    }

    const nextIndex = Math.min(
      recommendations.length - 1,
      Math.max(0, Math.round(carousel.scrollLeft / cardStep))
    );
    const nextRecommendation = recommendations[nextIndex];
    if (nextRecommendation) {
      setActiveRecommendation(nextRecommendation.id);
    }
  };

  if (isPending) {
    return (
      <div
        role="status"
        aria-label="추천 가게 불러오는 중"
        className="flex min-h-64 items-center justify-center"
      >
        <Spinner className="size-6 text-primary-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <StateView
        variant="error"
        headingAs="h2"
        title="추천 가게를 불러오지 못했어요"
        description="잠시 후 다시 시도해주세요."
        actionLabel="다시 불러오기"
        onAction={() => void refetch()}
        className="py-8"
      />
    );
  }

  if (recommendations.length === 0) {
    return (
      <StateView
        variant="empty"
        headingAs="h2"
        title="주변 추천 가게가 없어요"
        description="지도를 옮긴 뒤 다시 확인해주세요."
        actionLabel="다시 불러오기"
        onAction={() => void refetch()}
        className="py-8"
      />
    );
  }

  return (
    <section aria-labelledby="shop-recommendation-title">
      <h1 id="shop-recommendation-title" className="px-2 text-title-01-semibold text-neutral-700">
        가게 추천
      </h1>

      <ul
        ref={carouselRef}
        aria-label="추천 가게 목록"
        onScroll={handleCarouselScroll}
        className="scrollbar-hidden mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto"
      >
        {recommendations.map(
          ({ googleMapsUri, id, isLiked, reason, place, thumbnailSrc }, index) => {
            return (
              <li
                key={id}
                aria-label={`${index + 1}/${recommendations.length} ${place.name}`}
                className="relative flex w-80 max-w-[calc(100vw-4.5rem)] shrink-0 snap-start flex-col overflow-hidden rounded-15 border border-neutral-200 bg-neutral-00"
              >
                <span className="absolute top-0 left-0 rounded-br-16 bg-primary-500 px-3 py-2 text-caption-01-medium text-neutral-00">
                  {reason}
                </span>
                <button
                  type="button"
                  aria-label={`${place.name} 관심 가게`}
                  aria-pressed={isLiked}
                  onClick={() => likeMutation.mutate({ placeId: Number(id) })}
                  disabled={likeMutation.isPending}
                  className={cn(
                    'absolute top-4 right-4 flex size-7 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
                    isLiked ? 'text-primary-500' : 'text-neutral-200'
                  )}
                >
                  <LikeIcon aria-hidden="true" className="size-5" />
                </button>

                <div className="flex min-h-32 items-end px-4 pt-12 pb-4">
                  <PlaceTagCard
                    thumbnailSrc={thumbnailSrc}
                    title={place.name}
                    tags={[
                      { label: getDistrict(place.address), icon: BlueLocationPinIcon },
                      { label: place.category },
                    ]}
                  />
                </div>

                <a
                  href={getGoogleMapsPlaceUrl(place.name, place.address, googleMapsUri)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${place.name} 지도앱에서 확인하기`}
                  className="flex h-11 items-center gap-1 justify-center border-t border-neutral-200 text-body-02-regular text-neutral-500 outline-none hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-inset"
                >
                  지도앱에서 확인하기
                  <ChevronRightIcon aria-hidden="true" className="size-3" />
                </a>
              </li>
            );
          }
        )}
      </ul>

      <div className="mt-4 flex items-center justify-center gap-1" aria-hidden="true">
        {recommendations.map(({ id }, index) => (
          <span
            key={id}
            className={cn(
              'size-1.5 rounded-full',
              index === activeIndex ? 'w-5 bg-neutral-500' : 'bg-neutral-300'
            )}
          />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {activeIndex + 1}번째 추천 가게
      </p>
    </section>
  );
}
