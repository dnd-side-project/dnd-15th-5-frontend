import { useCallback, useRef, useState } from 'react';

import type { LikedPlaceResponse } from '@/features/map/apis/dto';
import { useLikedPlacesInfiniteQuery } from '@/features/map/apis/hooks/useLikedPlacesInfiniteQuery';
import { useTogglePlaceLikeMutation } from '@/features/map/apis/hooks/useTogglePlaceLikeMutation';
import { getLikedPlacePhotoUrls } from '@/features/map/utils/likedPlacePhotos';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import PageHeader from '@/shared/layout/PageHeader';
import { Button } from '@/shared/ui/button';
import { CategoryChip } from '@/shared/ui/category-chip';
import { StateView } from '@/shared/ui/state-view';

import LikedPlaceCardSkeleton from './LikedPlaceCardSkeleton';
import LikedPlaceSummary from './LikedPlaceSummary';

const ALL_CATEGORY = '전체';

function LikedPlaceCard({ likedPlace }: { likedPlace: LikedPlaceResponse }) {
  const likeMutation = useTogglePlaceLikeMutation();
  const photoUrls = getLikedPlacePhotoUrls(
    likedPlace.photos?.flatMap(({ thumbnailUrl }) => (thumbnailUrl ? [thumbnailUrl] : []))
  );

  if (likedPlace.placeId === undefined) {
    return null;
  }
  const placeId = likedPlace.placeId;

  return (
    <LikedPlaceSummary
      placeId={String(placeId)}
      name={likedPlace.name ?? '이름 정보가 없어요'}
      category={likedPlace.category ?? '기타'}
      address={likedPlace.address}
      photoUrls={photoUrls}
      isLoading={false}
      isUnlikePending={likeMutation.isPending}
      onUnlike={() => likeMutation.mutate({ placeId })}
      headingAs="h2"
    />
  );
}

/** 좋아요한 장소를 서버 페이지네이션으로 조회해 카테고리별로 보여줍니다. */
export default function LikedPlacesList({ onBack }: { onBack: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const listRef = useRef<HTMLElement>(null);
  const isFetchingNextPageRef = useRef(false);
  const categoryParam = selectedCategory === ALL_CATEGORY ? undefined : selectedCategory;
  const likedPlacesQuery = useLikedPlacesInfiniteQuery(categoryParam);
  const {
    categories,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchNextPageError,
    isFetchingNextPage,
    isPending,
    likedPlaces,
    refetch,
  } = likedPlacesQuery;
  const availableCategories = [
    ALL_CATEGORY,
    ...categories.filter((category) => category !== ALL_CATEGORY),
  ];
  const activeCategory = availableCategories.includes(selectedCategory)
    ? selectedCategory
    : ALL_CATEGORY;

  const loadNextPage = useCallback(() => {
    if (!hasNextPage || isFetchingNextPageRef.current) {
      return;
    }

    isFetchingNextPageRef.current = true;
    void fetchNextPage().finally(() => {
      isFetchingNextPageRef.current = false;
    });
  }, [fetchNextPage, hasNextPage]);
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    isLoadMoreError: isFetchNextPageError,
    onLoadMore: loadNextPage,
    rootRef: listRef,
    rootMargin: '160px 0px',
  });

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
              if (selected) {
                setSelectedCategory(category);
              }
            }}
            className="px-3 py-1.5"
          >
            {category}
          </CategoryChip>
        ))}
      </nav>

      <section
        ref={listRef}
        aria-label="좋아요한 가게 목록"
        className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto"
      >
        {isPending ? (
          <div role="status" aria-label="좋아요한 가게 불러오는 중" className="space-y-6 py-2">
            {[0, 1, 2].map((item) => (
              <LikedPlaceCardSkeleton key={item} />
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
        ) : likedPlaces.length > 0 ? (
          <div className="space-y-6 py-2">
            {likedPlaces.map((likedPlace) => (
              <LikedPlaceCard key={likedPlace.placeId} likedPlace={likedPlace} />
            ))}
            {isFetchingNextPage && (
              <div role="status" aria-label="다음 좋아요 장소 불러오는 중" className="space-y-6">
                {[0, 1].map((item) => (
                  <LikedPlaceCardSkeleton key={item} />
                ))}
              </div>
            )}
            {isFetchNextPageError && (
              <div className="flex justify-center py-4">
                <Button variant="primary" size="small" onClick={loadNextPage}>
                  다시 불러오기
                </Button>
              </div>
            )}
            {hasNextPage && !isFetchNextPageError && (
              <div ref={loadMoreRef} aria-hidden="true" className="h-px" />
            )}
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
