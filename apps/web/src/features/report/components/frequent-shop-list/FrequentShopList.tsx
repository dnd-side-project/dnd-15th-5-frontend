import { RECORD_CATEGORIES } from '@chapchap/shared/record';
import { useMemo, useState } from 'react';

import { GetFrequentPlacesPeriod } from '@/features/report/apis/dto';
import { useFrequentPlacesInfiniteQuery } from '@/features/report/apis/hooks/useFrequentPlacesInfiniteQuery';
import type { FrequentShopPeriod } from '@/features/report/types';
import { FilterIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { Button } from '@/shared/ui/button';
import { CategoryChip } from '@/shared/ui/category-chip';
import { Spinner } from '@/shared/ui/spinner';
import { StateView } from '@/shared/ui/state-view';

import FrequentShopItem from './FrequentShopItem';
import FrequentShopListSkeleton from './FrequentShopListSkeleton';
import PeriodFilterSheet from './PeriodFilterSheet';

import type { ReactNode } from 'react';

type FrequentShopListProps = {
  headerContent?: ReactNode;
};

const CATEGORY_FILTERS = ['모두', ...RECORD_CATEGORIES] as const;
type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

const PERIOD_PARAM_BY_FILTER = {
  currentMonth: GetFrequentPlacesPeriod.THIS_MONTH,
  all: GetFrequentPlacesPeriod.ALL_TIME,
} as const satisfies Record<FrequentShopPeriod, GetFrequentPlacesPeriod>;

/** 카테고리와 기간을 기준으로 단골 가게의 방문 순위를 보여줍니다. */
export default function FrequentShopList({ headerContent }: FrequentShopListProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('모두');
  const [selectedPeriod, setSelectedPeriod] = useState<FrequentShopPeriod>('currentMonth');
  const [isPeriodFilterOpen, setIsPeriodFilterOpen] = useState(false);
  const category = useMemo(
    () => (selectedCategory === '모두' ? undefined : [selectedCategory]),
    [selectedCategory]
  );
  const frequentPlacesQuery = useFrequentPlacesInfiniteQuery({
    category,
    period: PERIOD_PARAM_BY_FILTER[selectedPeriod],
  });
  const frequentPlaces = useMemo(
    () => frequentPlacesQuery.data?.pages.flatMap((page) => page.data?.places ?? []) ?? [],
    [frequentPlacesQuery.data]
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } =
    frequentPlacesQuery;
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    isLoadMoreError: isFetchNextPageError,
    onLoadMore: fetchNextPage,
  });

  const handlePeriodSelect = (period: FrequentShopPeriod) => {
    setSelectedPeriod(period);
    setIsPeriodFilterOpen(false);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="z-sticky-header shrink-0 bg-neutral-00 pt-4">
        {headerContent}
        <div className="relative -mx-4 mt-4 h-15.5 border-b border-neutral-200 bg-neutral-00">
          <div className="scrollbar-hidden flex h-full items-center gap-1.5 overflow-x-auto px-4 pr-20">
            {CATEGORY_FILTERS.map((category) => (
              <CategoryChip
                key={category}
                selected={category === selectedCategory}
                onSelectedChange={(isSelected) => isSelected && setSelectedCategory(category)}
                className="border-neutral-300 px-3 py-1.5 text-body-02-medium"
              >
                {category}
              </CategoryChip>
            ))}
          </div>
          <div className="absolute top-0 right-0 flex h-full w-16 items-center justify-center bg-neutral-00 shadow-category-filter">
            <button
              type="button"
              aria-label="기간 필터"
              aria-expanded={isPeriodFilterOpen}
              onClick={() => setIsPeriodFilterOpen(true)}
              className="flex h-7.25 w-8.5 items-center justify-center rounded-16 border border-neutral-300 outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1"
            >
              <FilterIcon aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex flex-1 flex-col overflow-y-auto">
        <h1 className="sr-only">단골 리스트</h1>
        <div className="flex flex-1 flex-col">
          {frequentPlacesQuery.isPending && <FrequentShopListSkeleton />}

          {!frequentPlacesQuery.isPending &&
            frequentPlacesQuery.isError &&
            frequentPlaces.length === 0 && (
              <StateView
                variant="error"
                title="단골 리스트를 불러오지 못했어요"
                description="잠시 후 다시 시도해주세요."
                actionLabel="다시 불러오기"
                headingAs="h2"
                onAction={() => void frequentPlacesQuery.refetch()}
                className="my-auto"
              />
            )}

          {!frequentPlacesQuery.isPending && frequentPlaces.length > 0 && (
            <>
              <ol className="-mx-4 flex flex-col gap-6 pt-4 pb-page-bottom">
                {frequentPlaces.map((place, index) => (
                  <FrequentShopItem
                    key={place.placeId ?? `${place.placeName ?? 'place'}-${index}`}
                    category={place.category}
                    dongname={place.dongname}
                    placeName={place.placeName}
                    rank={place.rank ?? index + 1}
                    thumbnailSrc={place.thumbnailUrl}
                    visitCount={place.visitCount}
                  />
                ))}
              </ol>

              <div ref={loadMoreRef} aria-hidden="true" className="h-px" />
              {isFetchingNextPage && (
                <div
                  role="status"
                  aria-label="단골 리스트 더 불러오는 중"
                  className="flex justify-center py-5"
                >
                  <Spinner className="text-primary-500" />
                </div>
              )}
              {isFetchNextPageError && (
                <div className="flex justify-center py-5">
                  <Button variant="primary" size="small" onClick={() => void fetchNextPage()}>
                    다시 불러오기
                  </Button>
                </div>
              )}
            </>
          )}

          {!frequentPlacesQuery.isPending &&
            !frequentPlacesQuery.isError &&
            frequentPlaces.length === 0 && (
              <StateView
                variant="empty"
                title="아직 기록이 없어요"
                description={'소비 기록을 작성해보세요.\n빈 공간이 채워질 거예요.'}
                actionLabel="소비 기록 작성하기"
                headingAs="h2"
                to={ROUTE_PATHS.record}
                className="my-auto"
              />
            )}
        </div>
      </div>

      {isPeriodFilterOpen && (
        <PeriodFilterSheet
          selectedPeriod={selectedPeriod}
          onClose={() => setIsPeriodFilterOpen(false)}
          onSelect={handlePeriodSelect}
        />
      )}
    </div>
  );
}
