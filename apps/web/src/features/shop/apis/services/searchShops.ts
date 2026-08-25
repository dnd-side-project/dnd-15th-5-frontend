import {
  SHOP_SEARCH_LANGUAGE,
  SHOP_SEARCH_MAX_RESULT_COUNT,
  SHOP_SEARCH_PHOTO_MAX_WIDTH,
  SHOP_SEARCH_REGION,
} from '@/features/shop/constants';
import type { ShopSearchResult } from '@/features/shop/types';

/**
 * 키워드로 장소를 검색한다.
 *
 * 자체 서버가 아닌 Google Places API를 직접 호출하므로 `shared/apis`의 axios 인스턴스가 아닌
 * Maps JavaScript SDK의 Places 라이브러리를 인자로 받아 사용한다.
 *
 * NOTE: `locationBias`를 넘기지 않아 구글이 요청 IP로 위치를 추측해 결과를 편향시킨다.
 * 기기의 실제 GPS 위치와 다를 수 있다.
 *
 * TODO: 현재 위치 기반 검색이 필요해지면 위치 조회를 공통 계층으로 올리고 `locationBias`로 전달한다.
 * TODO: 정식 Google Maps 키 발급 후 `photos` 응답과 검색 결과 썸네일 노출을 재확인한다.
 */
export const searchShops = async (
  placesLibrary: google.maps.PlacesLibrary,
  keyword: string
): Promise<ShopSearchResult[]> => {
  const { places } = await placesLibrary.Place.searchByText({
    textQuery: keyword,
    fields: ['id', 'displayName', 'formattedAddress', 'photos', 'location'],
    language: SHOP_SEARCH_LANGUAGE,
    region: SHOP_SEARCH_REGION,
    maxResultCount: SHOP_SEARCH_MAX_RESULT_COUNT,
  });

  return places.flatMap((place) => {
    const name = place.displayName?.trim();
    const address = place.formattedAddress?.trim();
    const latitude = place.location?.lat();
    const longitude = place.location?.lng();

    if (
      !place.id ||
      !name ||
      !address ||
      typeof latitude !== 'number' ||
      !Number.isFinite(latitude) ||
      typeof longitude !== 'number' ||
      !Number.isFinite(longitude)
    ) {
      return [];
    }

    return [
      {
        id: place.id,
        name,
        address,
        photoUrl: place.photos?.[0]?.getURI({ maxWidth: SHOP_SEARCH_PHOTO_MAX_WIDTH }) ?? null,
        latitude,
        longitude,
      },
    ];
  });
};
