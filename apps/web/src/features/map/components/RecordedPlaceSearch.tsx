import { useMemo, useState } from 'react';

import { PlaceSearchInput, PlaceSearchResultList } from '@/shared/ui/place-search';
import type { PlaceSearchItem } from '@/shared/ui/place-search';

import { MOCK_MAP_STICKERS } from '../mockData';
import { useMapFocusStore } from '../stores/mapFocusStore';

import type { MapSticker } from '../types';

type RecordedPlaceSearchProps = {
  onSelectPlace: (sticker: MapSticker) => void;
};

type RecordedPlaceSearchItem = PlaceSearchItem & {
  sticker: MapSticker;
};

const getRecordedPlaceSearchItems = (keyword: string): RecordedPlaceSearchItem[] => {
  const normalizedKeyword = keyword.trim().toLocaleLowerCase('ko-KR');
  if (!normalizedKeyword) {
    return [];
  }

  return MOCK_MAP_STICKERS.filter(({ place }) =>
    `${place.name} ${place.address}`.toLocaleLowerCase('ko-KR').includes(normalizedKeyword)
  ).map((sticker) => ({
    id: sticker.id,
    name: sticker.place.name,
    address: sticker.place.address,
    sticker,
  }));
};

/** 소비 기록이 있는 장소만 매장명과 주소로 검색합니다. */
export default function RecordedPlaceSearch({ onSelectPlace }: RecordedPlaceSearchProps) {
  const [keyword, setKeyword] = useState('');
  const setFocusPosition = useMapFocusStore((state) => state.setFocusPosition);
  const matchedPlaces = useMemo(() => getRecordedPlaceSearchItems(keyword), [keyword]);

  const handleSelectPlace = ({ sticker }: RecordedPlaceSearchItem) => {
    setFocusPosition(sticker.position);
    onSelectPlace(sticker);
  };

  return (
    <>
      <PlaceSearchInput placeholder="검색어를 입력해주세요" onSearch={setKeyword} />
      <PlaceSearchResultList
        places={matchedPlaces}
        hasKeyword={keyword.trim().length > 0}
        emptyMessage="기록한 장소 중에 검색 결과가 없습니다"
        onSelect={handleSelectPlace}
      />
    </>
  );
}
