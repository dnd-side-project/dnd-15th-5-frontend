import type {
  ApiResponseNearbyPlacesResponse,
  ApiResponseLikedPlaceScrollResponse,
  ApiResponseVisitedPlaceMarkerResponse,
  GetLikedPlacesParams,
  RecommendedPlaceItem,
} from '@/features/map/apis/dto';
import {
  getGetNearbyPlacesQueryKey,
  getGetVisitedPlaceMarkersQueryKey,
} from '@/features/map/apis/queryKeys';

import type { QueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';

type LikedPlacesCursor = Pick<GetLikedPlacesParams, 'cursorId'>;

export type LikedPlacesInfiniteData = InfiniteData<
  ApiResponseLikedPlaceScrollResponse,
  LikedPlacesCursor
>;
export type LikedPlacesCacheSnapshot = Array<
  [readonly unknown[], LikedPlacesInfiniteData | undefined]
>;

type LikeStateUpdater = (liked: boolean | undefined) => boolean | undefined;
type LikedPlacePosition = { pageIndex: number; placeIndex: number };

const NEARBY_PLACES_QUERY_KEY = getGetNearbyPlacesQueryKey();
const VISITED_PLACES_QUERY_KEY = getGetVisitedPlaceMarkersQueryKey();

/** 캐시에서 좋아요 상태를 찾습니다. `requireFresh`이면 재조회 성공 캐시만 사용합니다. */
export const getCachedLikedState = (
  queryClient: QueryClient,
  placeId: number,
  likedPlacesQueryKey: readonly unknown[],
  requireFresh = false
) => {
  const getFreshData = <TData>(queryKey: readonly unknown[], data: TData | undefined) => {
    if (!requireFresh) return data;

    const queryState = queryClient.getQueryState(queryKey);
    return queryState?.status === 'success' && !queryState.isInvalidated ? data : undefined;
  };
  const likedPlaceIsInList = queryClient
    .getQueriesData<LikedPlacesInfiniteData>({ queryKey: likedPlacesQueryKey })
    .some(([queryKey, data]) =>
      getFreshData(queryKey, data)?.pages.some((page) =>
        page.data?.places?.some((place) => place.placeId === placeId)
      )
    );
  if (likedPlaceIsInList) return true;

  const recommendation = queryClient
    .getQueriesData<ApiResponseNearbyPlacesResponse>({ queryKey: NEARBY_PLACES_QUERY_KEY })
    .flatMap(([queryKey, response]) => {
      const freshResponse = getFreshData(queryKey, response);
      return [
        ...(freshResponse?.data?.categoryPlaces?.flatMap((group) => group.places ?? []) ?? []),
        ...(freshResponse?.data?.allPlaces ?? []),
      ];
    })
    .find((place) => place.placeId === placeId);
  const visitedPlace = queryClient
    .getQueriesData<ApiResponseVisitedPlaceMarkerResponse>({ queryKey: VISITED_PLACES_QUERY_KEY })
    .flatMap(([queryKey, response]) => getFreshData(queryKey, response)?.data?.places ?? [])
    .find((place) => place.placeId === placeId);

  return recommendation?.liked ?? visitedPlace?.liked;
};

const findLikedPlacePosition = (
  data: LikedPlacesInfiniteData,
  placeId: number
): LikedPlacePosition | undefined => {
  for (const [pageIndex, page] of data.pages.entries()) {
    const placeIndex = page.data?.places?.findIndex((place) => place.placeId === placeId) ?? -1;

    if (placeIndex >= 0) return { pageIndex, placeIndex };
  }

  return undefined;
};

/** 좋아요 무한 목록의 기존 위치를 유지해 실패한 낙관적 삭제를 복구합니다. */
export const restoreLikedPlace = (
  currentData: LikedPlacesInfiniteData | undefined,
  previousData: LikedPlacesInfiniteData | undefined,
  placeId: number
): LikedPlacesInfiniteData | undefined => {
  if (!currentData || !previousData) return currentData;

  const previousPosition = findLikedPlacePosition(previousData, placeId);
  const previousPlace = previousPosition
    ? previousData.pages[previousPosition.pageIndex]?.data?.places?.[previousPosition.placeIndex]
    : undefined;

  if (!previousPlace || !previousPosition) return currentData;

  const pages = currentData.pages.map((page) => page);
  let existingPlaceFound = false;

  for (const [pageIndex, page] of pages.entries()) {
    const currentPlaces = page.data?.places;
    if (!currentPlaces?.some((place) => place.placeId === placeId)) continue;

    const restoredPlaces = currentPlaces.flatMap((place) => {
      if (place.placeId !== placeId) return [place];
      if (existingPlaceFound) return [];

      existingPlaceFound = true;
      return [previousPlace];
    });

    pages[pageIndex] = {
      ...page,
      data: { ...page.data, places: restoredPlaces },
    };
  }

  if (existingPlaceFound) return { ...currentData, pages };

  const previousPlaces = previousData.pages.flatMap((page) => page.data?.places ?? []);
  const previousPlaceIndex = previousPlaces.findIndex((place) => place.placeId === placeId);
  const findCurrentPosition = (place: { placeId?: number }) =>
    place.placeId === undefined ? undefined : findLikedPlacePosition(currentData, place.placeId);
  const nextPlace = previousPlaces
    .slice(previousPlaceIndex + 1)
    .find((place) => findCurrentPosition(place) !== undefined);
  const previousPlaceBeforeTarget = previousPlaces
    .slice(0, previousPlaceIndex)
    .reverse()
    .find((place) => findCurrentPosition(place) !== undefined);
  const nextPosition = nextPlace ? findCurrentPosition(nextPlace) : undefined;
  const previousPositionInCurrentData = previousPlaceBeforeTarget
    ? findCurrentPosition(previousPlaceBeforeTarget)
    : undefined;
  const insertionPosition = nextPosition ?? previousPositionInCurrentData;

  // 페이지 구성이 바뀌어 주변 장소도 찾지 못하면, 위치를 추측하지 않고 서버 재조회에 맡깁니다.
  if (!insertionPosition) return currentData;

  const currentPage = pages[insertionPosition.pageIndex];
  if (!currentPage?.data) return currentData;

  const restoredPlaces = [...(currentPage.data.places ?? [])];
  const insertionIndex = nextPosition
    ? insertionPosition.placeIndex
    : insertionPosition.placeIndex + 1;
  restoredPlaces.splice(insertionIndex, 0, previousPlace);
  pages[insertionPosition.pageIndex] = {
    ...currentPage,
    data: { ...currentPage.data, places: restoredPlaces },
  };

  return { ...currentData, pages };
};

const updateRecommendedPlaces = (
  places: RecommendedPlaceItem[] | undefined,
  placeId: number,
  updateLiked: LikeStateUpdater
) =>
  places?.map((place) => {
    if (place.placeId !== placeId) return place;

    const liked = updateLiked(place.liked);
    return liked === place.liked ? place : { ...place, liked };
  });

const updateNearbyPlacesResponse = (
  response: ApiResponseNearbyPlacesResponse | undefined,
  placeId: number,
  updateLiked: LikeStateUpdater
) =>
  response
    ? {
        ...response,
        data: response.data
          ? {
              ...response.data,
              categoryPlaces: response.data.categoryPlaces?.map((group) => ({
                ...group,
                places: updateRecommendedPlaces(group.places, placeId, updateLiked),
              })),
              allPlaces: updateRecommendedPlaces(response.data.allPlaces, placeId, updateLiked),
            }
          : response.data,
      }
    : response;

const updateVisitedPlacesResponse = (
  response: ApiResponseVisitedPlaceMarkerResponse | undefined,
  placeId: number,
  updateLiked: LikeStateUpdater
) =>
  response
    ? {
        ...response,
        data: response.data
          ? {
              ...response.data,
              places: response.data.places?.map((place) => {
                if (place.placeId !== placeId) return place;

                const liked = updateLiked(place.liked);
                return liked === place.liked ? place : { ...place, liked };
              }),
            }
          : response.data,
      }
    : response;

/** 추천과 방문 장소 캐시의 좋아요 상태를 갱신합니다. */
export const updateCachedLikeState = (
  queryClient: QueryClient,
  placeId: number,
  updateLiked: LikeStateUpdater
) => {
  queryClient.setQueriesData<ApiResponseNearbyPlacesResponse>(
    { queryKey: NEARBY_PLACES_QUERY_KEY },
    (response) => updateNearbyPlacesResponse(response, placeId, updateLiked)
  );
  queryClient.setQueriesData<ApiResponseVisitedPlaceMarkerResponse>(
    { queryKey: VISITED_PLACES_QUERY_KEY },
    (response) => updateVisitedPlacesResponse(response, placeId, updateLiked)
  );
};
