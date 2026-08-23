import { PlaceCard } from '@/shared/ui/card';

import type { PlaceSearchItem } from './types';

type PlaceSearchResultItemProps<T extends PlaceSearchItem> = {
  getThumbnailSrc: (place: T) => string | null;
  onSelect: (place: T) => void;
  place: T;
};

/** 공통 장소 카드 구조를 사용하는 검색 결과 한 행입니다. */
export function PlaceSearchResultItem<T extends PlaceSearchItem>({
  getThumbnailSrc,
  onSelect,
  place,
}: PlaceSearchResultItemProps<T>) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(place)}
        className="w-full rounded-08 text-left outline-none transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1"
      >
        <PlaceCard
          thumbnailSrc={getThumbnailSrc(place)}
          title={place.name}
          location={place.address}
        />
      </button>
    </li>
  );
}
