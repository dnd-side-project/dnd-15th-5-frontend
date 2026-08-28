import type { ShopSearchResult } from '@chapchap/shared/shop';

const GOOGLE_PLACES_LANGUAGE = 'ko';
const GOOGLE_PLACES_REGION = 'kr';
/** 목록 썸네일(64px)의 2배수. 필요 이상으로 큰 이미지를 받지 않기 위한 상한입니다. */
const GOOGLE_PLACES_PHOTO_MAX_WIDTH = 128;

type SearchGooglePlacesParams = {
  fallbackPhotoUrl?: string | null;
  locationBias?: google.maps.places.SearchByTextRequest['locationBias'];
  maxResultCount: number;
  textQuery: string;
};

/** Google Places 텍스트 검색 결과를 소비 기록에서 사용하는 가게 모델로 변환합니다. */
export const searchGooglePlaces = async (
  placesLibrary: google.maps.PlacesLibrary,
  { fallbackPhotoUrl = null, locationBias, maxResultCount, textQuery }: SearchGooglePlacesParams
): Promise<ShopSearchResult[]> => {
  const { places } = await placesLibrary.Place.searchByText({
    textQuery,
    fields: ['id', 'displayName', 'formattedAddress', 'photos', 'location'],
    language: GOOGLE_PLACES_LANGUAGE,
    region: GOOGLE_PLACES_REGION,
    maxResultCount,
    ...(locationBias === undefined ? {} : { locationBias }),
  });

  return places.flatMap((place) => {
    const id = place.id?.trim();
    const name = place.displayName?.trim();
    const address = place.formattedAddress?.trim();
    const latitude = place.location?.lat();
    const longitude = place.location?.lng();

    if (
      !id ||
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
        id,
        name,
        address,
        photoUrl:
          place.photos?.[0]?.getURI({ maxWidth: GOOGLE_PLACES_PHOTO_MAX_WIDTH }) ??
          fallbackPhotoUrl,
        latitude,
        longitude,
      },
    ];
  });
};
