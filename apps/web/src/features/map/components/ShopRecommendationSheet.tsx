import { useLayoutEffect, useRef } from 'react';

import { useNearbyPlaceRecommendationsQuery } from '@/features/map/apis/hooks/useNearbyPlaceRecommendationsQuery';
import { useRecommendationNeighborhood } from '@/features/map/apis/hooks/useRecommendationNeighborhood';
import { useTogglePlaceLikeMutation } from '@/features/map/apis/hooks/useTogglePlaceLikeMutation';
import { HOME_CATEGORIES } from '@/features/map/constants';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';
import { useShopRecommendationStore } from '@/features/map/stores/shopRecommendationStore';
import { CaretRightIcon } from '@/shared/assets/icons';
import { NeighborhoodEmptyImage } from '@/shared/assets/images/state';
import { Button } from '@/shared/ui/button';
import { CategoryChip } from '@/shared/ui/category-chip';
import { Spinner } from '@/shared/ui/spinner';
import { StateView } from '@/shared/ui/state-view';

import RecommendationAddressHint from './RecommendationAddressHint';
import RecommendationPlaceCard from './RecommendationPlaceCard';

type ShopRecommendationSheetProps = { onOpenRecommendationSearch?: () => void };

type RecommendationContentProps = ShopRecommendationSheetProps & {
  neighborhood: ReturnType<typeof useRecommendationNeighborhood>;
};

/** 동네 복원이 끝난 뒤에만 추천 목록을 마운트해 임의의 지도 중심으로 조회하지 않습니다. */
export default function ShopRecommendationSheet(props: ShopRecommendationSheetProps) {
  const neighborhood = useRecommendationNeighborhood();
  return <RecommendationContent {...props} neighborhood={neighborhood} />;
}

export function RecommendationContent({ neighborhood, ...props }: RecommendationContentProps) {
  if (neighborhood.isLoading) {
    return (
      <div
        role="status"
        aria-label="설정한 동네 불러오는 중"
        className="flex h-full items-center justify-center"
      >
        <Spinner />
      </div>
    );
  }
  if (neighborhood.isError) {
    return (
      <StateView
        variant="error"
        headingAs="h1"
        title="설정한 동네를 불러오지 못했어요"
        description="잠시 후 다시 시도해주세요."
        actionLabel="다시 불러오기"
        onAction={() => void neighborhood.refetch()}
      />
    );
  }
  if (!neighborhood.hasNeighborhood) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center justify-center rounded-16 bg-neutral-50 p-4">
          <p className="text-center text-body-01-medium text-neutral-600">
            동네를 설정하면
            <br />
            가까운 가게를 추천받을 수 있어요
          </p>
          <img
            src={NeighborhoodEmptyImage}
            alt=""
            className="mt-4 h-25 max-w-full object-contain grayscale"
          />
        </div>
        <Button onClick={props.onOpenRecommendationSearch}>동네 설정하기</Button>
      </div>
    );
  }
  return <RecommendationList {...props} />;
}

function RecommendationList({ onOpenRecommendationSearch }: ShopRecommendationSheetProps) {
  const { recommendations, isPending, isError, refetch } = useNearbyPlaceRecommendationsQuery();
  const address = useLocationSelectionStore((state) => state.confirmedAddress);
  const selectedCategory = useShopRecommendationStore((state) => state.selectedCategory);
  const setSelectedCategory = useShopRecommendationStore((state) => state.setSelectedCategory);
  const setListScrollTop = useShopRecommendationStore((state) => state.setListScrollTop);
  const showRecommendationPlace = useHomeBottomSheetStore((state) => state.showRecommendationPlace);
  const setActiveRecommendation = useShopRecommendationStore(
    (state) => state.setActiveRecommendation
  );
  const likeMutation = useTogglePlaceLikeMutation();
  const listRef = useRef<HTMLDivElement>(null);
  const filtered = recommendations.filter(
    ({ place }) => !selectedCategory || place.category === selectedCategory
  );

  useLayoutEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = useShopRecommendationStore.getState().listScrollTop;
  }, [isPending, isError, selectedCategory]);

  return (
    <section aria-label="가게 추천" className="flex h-full min-h-0 flex-col">
      <div className="relative shrink-0 pt-1 pb-3">
        <RecommendationAddressHint />
        <button
          type="button"
          onClick={onOpenRecommendationSearch}
          aria-label="추천 동네 변경"
          className="flex max-w-full items-center gap-1 text-title-01-bold text-neutral-700"
        >
          <span className="truncate">{address || '선택한 동네'}</span>
          <CaretRightIcon
            aria-hidden="true"
            className="size-6 rotate-90 shrink-0 text-neutral-900"
          />
        </button>
        <h1 className="mt-4 text-body-01-semibold text-neutral-700">동네 인기 장소</h1>
      </div>
      <nav aria-label="추천 가게 카테고리" className="flex shrink-0 gap-2 overflow-x-auto pb-4">
        <CategoryChip
          selected={!selectedCategory}
          onSelectedChange={(selected) => {
            if (selected) setSelectedCategory(null);
          }}
        >
          전체
        </CategoryChip>
        {HOME_CATEGORIES.map((category) => (
          <CategoryChip
            key={category}
            selected={selectedCategory === category}
            onSelectedChange={(selected) => {
              if (selected) setSelectedCategory(category);
            }}
          >
            {category}
          </CategoryChip>
        ))}
      </nav>
      <div
        ref={listRef}
        onScroll={(event) => {
          // NOTE: 로딩·오류 화면으로 높이가 줄며 생기는 스크롤은 목록 위치로 저장하지 않는다.
          if (!isPending && !isError) setListScrollTop(event.currentTarget.scrollTop);
        }}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-4"
      >
        {isPending ? (
          <div
            role="status"
            aria-label="추천 가게 불러오는 중"
            className="flex min-h-32 items-center justify-center"
          >
            <Spinner />
          </div>
        ) : isError ? (
          <StateView
            variant="error"
            headingAs="h2"
            title="추천 가게를 불러오지 못했어요"
            description="잠시 후 다시 시도해주세요."
            actionLabel="다시 불러오기"
            onAction={() => void refetch()}
          />
        ) : filtered.length === 0 ? (
          <StateView
            variant="empty"
            headingAs="h2"
            title="아직 추천 가게가 없어요"
            description="다른 카테고리나 동네를 선택해보세요."
          />
        ) : (
          <ul aria-label="추천 가게 목록" className="grid grid-cols-2 gap-4">
            {filtered.map((recommendation) => (
              <li key={recommendation.id}>
                <RecommendationPlaceCard
                  recommendation={recommendation}
                  isLikePending={likeMutation.isPending}
                  onToggleLike={() =>
                    likeMutation.mutate({
                      placeId: Number(recommendation.id),
                      currentLiked: recommendation.isLiked,
                    })
                  }
                  onSelect={() => {
                    setActiveRecommendation(recommendation.id);
                    showRecommendationPlace(recommendation.id);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
