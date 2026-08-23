import { Spinner } from '@/shared/ui/spinner';

import { PlaceSearchResultItem } from './PlaceSearchResultItem';

import type { PlaceSearchItem } from './types';

const getEmptyThumbnailSrc = () => null;

type PlaceSearchResultListProps<T extends PlaceSearchItem> = {
  emptyMessage?: string;
  errorMessage?: string;
  getThumbnailSrc?: (place: T) => string | null;
  hasKeyword: boolean;
  isError?: boolean;
  isLoading?: boolean;
  onSelect: (place: T) => void;
  places: readonly T[];
};

/** 검색 전·로딩·오류·빈 결과·목록 상태를 공통 구조로 표시합니다. */
export function PlaceSearchResultList<T extends PlaceSearchItem>({
  emptyMessage = '검색 결과가 없습니다',
  errorMessage = '검색에 실패했습니다',
  getThumbnailSrc = getEmptyThumbnailSrc,
  hasKeyword,
  isError = false,
  isLoading = false,
  onSelect,
  places,
}: PlaceSearchResultListProps<T>) {
  if (!hasKeyword) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-neutral-400">
        <Spinner className="size-6" />
        <p className="text-body-02-regular text-neutral-500">검색 중...</p>
      </div>
    );
  }

  if (isError) {
    return <p className="py-6 text-center text-body-02-regular text-neutral-500">{errorMessage}</p>;
  }

  if (places.length === 0) {
    return <p className="py-6 text-center text-body-02-regular text-neutral-500">{emptyMessage}</p>;
  }

  return (
    <ul className="mt-4 flex flex-col gap-4">
      {places.map((place) => (
        <PlaceSearchResultItem
          key={place.id}
          place={place}
          getThumbnailSrc={getThumbnailSrc}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
