import { useEffect, useRef, useState } from 'react';

import { useRecommendationRecordShopQuery } from '@/features/map/apis/hooks/useRecommendationRecordShopQuery';
import { useTogglePlaceLikeMutation } from '@/features/map/apis/hooks/useTogglePlaceLikeMutation';
import { useVisitedPlaceStickersQuery } from '@/features/map/apis/hooks/useVisitedPlaceStickersQuery';
import { HOME_CATEGORIES } from '@/features/map/constants';
import type { ShopRecommendation } from '@/features/map/types';
import { getLikedPlacePhotoUrls } from '@/features/map/utils/likedPlacePhotos';
import PageHeader from '@/shared/layout/PageHeader';
import { CategoryChip } from '@/shared/ui/category-chip';
import { StateView } from '@/shared/ui/state-view';

import LikedPlaceSummary from './LikedPlaceSummary';

const ALL_CATEGORY = '전체';
// TODO: 운영 API에 GET /v1/places/likes가 배포되면 서버 페이지네이션과 응답 사진으로 전환한다.

function LikedPlaceCard({ likedPlace }: { likedPlace: ShopRecommendation }) {
  const { id: placeId, place } = likedPlace;
  const cardRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(
    () => typeof IntersectionObserver === 'undefined'
  );
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    if (typeof IntersectionObserver === 'undefined') return;

    // 카드가 화면 가까이에 왔을 때 매장별 Places 조회를 한 번 실행하고 관찰을 끝낸다.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '160px 0px' }
    );
    observer.observe(card);

    return () => observer.disconnect();
  }, []);
  const {
    query: placeDetailsQuery,
    isLibraryLoading,
    isLibraryError,
  } = useRecommendationRecordShopQuery(likedPlace, { enabled: isNearViewport });
  // TODO: 방문 장소 API가 사진 URL을 제공하면 Google Places 사진 조회를 API 응답 사용으로 교체한다.
  const likeMutation = useTogglePlaceLikeMutation();
  const placeDetails = placeDetailsQuery.data;
  const photoUrls = getLikedPlacePhotoUrls(placeDetails?.photoUrls, placeDetails?.photoUrl);
  const address = placeDetails?.address || place.address;
  const isPlaceDetailsLoading =
    !isLibraryError && (isLibraryLoading || placeDetailsQuery.isPending);

  return (
    <div ref={cardRef}>
      <LikedPlaceSummary
        placeId={placeId}
        name={place.name}
        category={place.category}
        address={address}
        photoUrls={photoUrls}
        isLoading={isPlaceDetailsLoading}
        isUnlikePending={likeMutation.isPending}
        onUnlike={() => likeMutation.mutate({ placeId: Number(placeId) })}
        headingAs="h2"
      />
    </div>
  );
}

/** 좋아요한 장소를 카테고리별로 모아 보여주는 목록입니다. */
export default function LikedPlacesList({ onBack }: { onBack: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);
  const {
    likedRecommendations: likedPlaces,
    isPending,
    isError,
    refetch,
  } = useVisitedPlaceStickersQuery();
  // 좋아요한 매장에 실제로 존재하는 카테고리만 필터에 노출한다.
  const availableCategories = [
    ALL_CATEGORY,
    ...HOME_CATEGORIES.filter((category) =>
      likedPlaces.some(({ place }) => place.category === category)
    ),
  ];
  const activeCategory = availableCategories.includes(selectedCategory)
    ? selectedCategory
    : ALL_CATEGORY;
  const filteredLikedPlaces = likedPlaces.filter(
    ({ place }) => activeCategory === ALL_CATEGORY || place.category === activeCategory
  );

  return (
    <main className="min-h-screen-safe-bottom flex flex-col bg-neutral-00">
      <PageHeader title="좋아요" onBack={onBack} />

      <nav
        aria-label="좋아요 카테고리 필터"
        className="scrollbar-hidden flex shrink-0 gap-2 overflow-x-auto pt-6 pb-3"
      >
        {availableCategories.map((category) => (
          <CategoryChip
            key={category}
            selected={activeCategory === category}
            onSelectedChange={(selected) => {
              if (!selected) return;
              setSelectedCategory(category);
            }}
            className="px-3 py-1.5"
          >
            {category}
          </CategoryChip>
        ))}
      </nav>

      <section
        aria-label="좋아요한 가게 목록"
        className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto"
      >
        {isPending ? (
          <div role="status" aria-label="좋아요한 가게 불러오는 중" className="space-y-6 py-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-45 animate-pulse rounded-12 bg-neutral-100" />
            ))}
          </div>
        ) : isError ? (
          <StateView
            variant="error"
            headingAs="h2"
            title="좋아요 목록을 불러오지 못했어요"
            description="잠시 후 다시 시도해주세요."
            actionLabel="다시 불러오기"
            onAction={() => void refetch()}
            className="pt-12"
          />
        ) : filteredLikedPlaces.length ? (
          <div className="space-y-6 py-2">
            {filteredLikedPlaces.map((likedPlace) => (
              <LikedPlaceCard key={likedPlace.id} likedPlace={likedPlace} />
            ))}
          </div>
        ) : (
          <StateView
            variant="empty"
            headingAs="h2"
            title={
              activeCategory === ALL_CATEGORY
                ? '좋아요한 가게가 없어요'
                : '해당 카테고리의 가게가 없어요'
            }
            description="마음에 드는 가게를 좋아요 해보세요."
            className="pt-12"
          />
        )}
      </section>
    </main>
  );
}
