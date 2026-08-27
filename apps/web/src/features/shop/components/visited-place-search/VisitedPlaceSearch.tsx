import { useMemo, useState } from 'react';

import { useVisitedPlaceSearchInfiniteQuery } from '@/features/shop/apis/hooks/useVisitedPlaceSearchInfiniteQuery';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { Button } from '@/shared/ui/button';
import { PlaceSearchInput, PlaceSearchResultList } from '@/shared/ui/place-search';
import type { PlaceSearchItem } from '@/shared/ui/place-search';
import { Spinner } from '@/shared/ui/spinner';

type VisitedPlaceSearchProps = {
  onSelectPlace: (placeId: string) => void;
};

type VisitedPlaceSearchItem = PlaceSearchItem & {
  thumbnailSrc: string | null;
};

/** 소비 기록이 있는 장소만 매장명과 주소로 검색합니다. */
export default function VisitedPlaceSearch({ onSelectPlace }: VisitedPlaceSearchProps) {
  const [keyword, setKeyword] = useState('');
  const searchQuery = useVisitedPlaceSearchInfiniteQuery(keyword);
  const { fetchNextPage, hasNextPage, isFetchNextPageError, isFetchingNextPage } = searchQuery;
  const matchedPlaces = useMemo<VisitedPlaceSearchItem[]>(
    () =>
      (searchQuery.data?.pages ?? []).flatMap((page) =>
        (page.data?.places ?? []).flatMap((place) =>
          place.placeId === undefined || !place.placeName
            ? []
            : [
                {
                  id: String(place.placeId),
                  name: place.placeName,
                  address: place.roadAddress ?? '',
                  thumbnailSrc: place.thumbnailUrl ?? null,
                },
              ]
        )
      ),
    [searchQuery.data?.pages]
  );

  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    isLoadMoreError: isFetchNextPageError,
    onLoadMore: fetchNextPage,
  });

  return (
    <>
      <PlaceSearchInput placeholder="검색어를 입력해주세요" onSearch={setKeyword} />
      <PlaceSearchResultList
        places={matchedPlaces}
        hasKeyword={keyword.trim().length > 0}
        isLoading={searchQuery.isPending}
        isError={searchQuery.isError && !searchQuery.data}
        emptyMessage="기록한 장소 중에 검색 결과가 없습니다"
        getThumbnailSrc={(place) => place.thumbnailSrc}
        onSelect={(place) => onSelectPlace(place.id)}
      />
      <div ref={loadMoreRef} aria-hidden="true" className="h-1" />
      {isFetchingNextPage && (
        <div
          role="status"
          aria-label="검색 결과 더 불러오는 중"
          className="flex justify-center py-4"
        >
          <Spinner className="size-5 text-primary-500" />
        </div>
      )}
      {!isFetchingNextPage && isFetchNextPageError && (
        <div className="flex justify-center py-4">
          <Button variant="primary" size="small" onClick={() => void fetchNextPage()}>
            다시 불러오기
          </Button>
        </div>
      )}
    </>
  );
}
