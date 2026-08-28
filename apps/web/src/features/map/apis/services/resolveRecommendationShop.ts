import type { ShopRecommendation } from '@/features/map/types';
import { searchGooglePlaces } from '@/shared/lib/google-places/searchGooglePlaces';

import type { ShopSearchResult } from '@chapchap/shared/shop';

const RECOMMENDATION_SEARCH_MAX_RESULT_COUNT = 5;
const RECOMMENDATION_SEARCH_RADIUS_METERS = 300;
const RECOMMENDATION_MATCH_MAX_DISTANCE_METERS = 500;

const normalizePlaceName = (name: string) =>
  name
    .normalize('NFKC')
    .toLocaleLowerCase('ko-KR')
    .replace(/[^\p{L}\p{N}]/gu, '');

const isMatchingPlaceName = (candidateName: string, recommendationName: string) => {
  const candidate = normalizePlaceName(candidateName);
  const recommendation = normalizePlaceName(recommendationName);

  return candidate.length > 0 && recommendation.length > 0
    ? candidate.includes(recommendation) || recommendation.includes(candidate)
    : false;
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const getDistanceMeters = (first: ShopSearchResult, second: ShopRecommendation['position']) => {
  const earthRadiusMeters = 6_371_000;
  const latitudeDelta = toRadians(second.lat - first.latitude);
  const longitudeDelta = toRadians(second.lng - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.lat);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(haversine));
};

/** 추천 매장을 Google Places 결과와 대조해 소비 기록에 필요한 장소 정보로 변환합니다. */
export const resolveRecommendationShop = async (
  placesLibrary: google.maps.PlacesLibrary,
  recommendation: ShopRecommendation
): Promise<ShopSearchResult> => {
  const { place, position, thumbnailSrc } = recommendation;
  const candidates = await searchGooglePlaces(placesLibrary, {
    textQuery: `${place.name} ${place.address}`.trim(),
    maxResultCount: RECOMMENDATION_SEARCH_MAX_RESULT_COUNT,
    locationBias: {
      center: position,
      radius: RECOMMENDATION_SEARCH_RADIUS_METERS,
    },
    fallbackPhotoUrl: thumbnailSrc,
  });

  const matchedShop = candidates
    .filter((candidate) => isMatchingPlaceName(candidate.name, place.name))
    .map((candidate) => ({ candidate, distance: getDistanceMeters(candidate, position) }))
    .filter(({ distance }) => distance <= RECOMMENDATION_MATCH_MAX_DISTANCE_METERS)
    .sort((first, second) => first.distance - second.distance)[0]?.candidate;

  if (!matchedShop) {
    throw new Error('추천 매장과 일치하는 Google Places 결과를 찾지 못했습니다');
  }

  return matchedShop;
};
