import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toggleLike } from '@/features/map/apis/clients';
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
import { useToast } from '@/shared/ui/toast';

import { LIKED_PLACES_INFINITE_QUERY_KEY } from './useLikedPlacesInfiniteQuery';

import type { QueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';

type LikedPlacesCursor = Pick<GetLikedPlacesParams, 'cursorId'>;

const LIKE_ERROR_MESSAGE = '좋아요 상태를 변경하지 못했어요. 잠시 후 다시 시도해주세요.';
const TOGGLE_PLACE_LIKE_MUTATION_KEY = ['toggle-place-like'] as const;
const NEARBY_PLACES_QUERY_KEY = getGetNearbyPlacesQueryKey();
const VISITED_PLACES_QUERY_KEY = getGetVisitedPlaceMarkersQueryKey();

type LikeMutationContext = {
  optimisticLiked: boolean;
  previousLiked: boolean | undefined;
  previousLikedPlaces: Array<
    [
      readonly unknown[],
      InfiniteData<ApiResponseLikedPlaceScrollResponse, LikedPlacesCursor> | undefined,
    ]
  >;
};

type LikedPlacesInfiniteData = InfiniteData<ApiResponseLikedPlaceScrollResponse, LikedPlacesCursor>;

type LikeStateUpdater = (liked: boolean | undefined) => boolean | undefined;

const restoreLikedPlace = (
  currentData: LikedPlacesInfiniteData | undefined,
  previousData: LikedPlacesInfiniteData | undefined,
  placeId: number
): LikedPlacesInfiniteData | undefined => {
  if (!currentData || !previousData) return currentData;

  const pages = [...currentData.pages];

  previousData.pages.forEach((previousPage, pageIndex) => {
    const previousPlaces = previousPage.data?.places;
    const placeIndex = previousPlaces?.findIndex((place) => place.placeId === placeId) ?? -1;
    const previousPlace = placeIndex >= 0 ? previousPlaces?.[placeIndex] : undefined;
    const currentPage = pages[pageIndex];

    if (!previousPlace || !currentPage?.data) return;

    const currentPlaces = currentPage.data.places ?? [];
    const existingPlaceIndex = currentPlaces.findIndex((place) => place.placeId === placeId);
    const restoredPlaces = [...currentPlaces];

    if (existingPlaceIndex >= 0) {
      restoredPlaces[existingPlaceIndex] = previousPlace;
    } else {
      const previousPlacesBeforeTarget = previousPlaces ?? [];
      const nextPlace = previousPlacesBeforeTarget
        .slice(placeIndex + 1)
        .find((place) =>
          currentPlaces.some((currentPlace) => currentPlace.placeId === place.placeId)
        );
      const previousPlaceBeforeTarget = previousPlacesBeforeTarget
        .slice(0, placeIndex)
        .reverse()
        .find((place) =>
          currentPlaces.some((currentPlace) => currentPlace.placeId === place.placeId)
        );
      const nextIndex = nextPlace
        ? currentPlaces.findIndex((place) => place.placeId === nextPlace.placeId)
        : -1;
      const previousIndex = previousPlaceBeforeTarget
        ? currentPlaces.findIndex((place) => place.placeId === previousPlaceBeforeTarget.placeId)
        : -1;
      const insertionIndex =
        nextIndex >= 0 ? nextIndex : previousIndex >= 0 ? previousIndex + 1 : placeIndex;

      restoredPlaces.splice(Math.min(insertionIndex, restoredPlaces.length), 0, previousPlace);
    }

    pages[pageIndex] = {
      ...currentPage,
      data: { ...currentPage.data, places: restoredPlaces },
    };
  });

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
              sameCategoryPlaces: updateRecommendedPlaces(
                response.data.sameCategoryPlaces,
                placeId,
                updateLiked
              ),
              myTownPlaces: updateRecommendedPlaces(
                response.data.myTownPlaces,
                placeId,
                updateLiked
              ),
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

const updateCachedLikeState = (
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

/** 추천·지도·좋아요 목록 캐시를 낙관적으로 갱신하고 실패 시 이전 값으로 복구합니다. */
export const useTogglePlaceLikeMutation = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<
    Awaited<ReturnType<typeof toggleLike>>,
    Error,
    { placeId: number },
    LikeMutationContext
  >({
    mutationKey: TOGGLE_PLACE_LIKE_MUTATION_KEY,
    mutationFn: ({ placeId }) => toggleLike(placeId),
    onMutate: async ({ placeId }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: NEARBY_PLACES_QUERY_KEY }),
        queryClient.cancelQueries({ queryKey: VISITED_PLACES_QUERY_KEY }),
        queryClient.cancelQueries({ queryKey: LIKED_PLACES_INFINITE_QUERY_KEY }),
      ]);

      const nearbyPlaces = queryClient.getQueriesData<ApiResponseNearbyPlacesResponse>({
        queryKey: NEARBY_PLACES_QUERY_KEY,
      });
      const visitedPlaces = queryClient.getQueriesData<ApiResponseVisitedPlaceMarkerResponse>({
        queryKey: VISITED_PLACES_QUERY_KEY,
      });
      const previousLikedPlaces = queryClient.getQueriesData<LikedPlacesInfiniteData>({
        queryKey: LIKED_PLACES_INFINITE_QUERY_KEY,
      });
      const likedPlaceIsInList = previousLikedPlaces.some(([, data]) =>
        data?.pages.some((page) => page.data?.places?.some((place) => place.placeId === placeId))
      );
      const currentRecommendation = nearbyPlaces
        .flatMap(([, response]) => [
          ...(response?.data?.sameCategoryPlaces ?? []),
          ...(response?.data?.myTownPlaces ?? []),
        ])
        .find((place) => place.placeId === placeId);
      const currentVisitedPlace = visitedPlaces
        .flatMap(([, response]) => response?.data?.places ?? [])
        .find((place) => place.placeId === placeId);
      const previousLiked = likedPlaceIsInList
        ? true
        : (currentRecommendation?.liked ?? currentVisitedPlace?.liked);
      const optimisticLiked = !(previousLiked ?? false);

      updateCachedLikeState(queryClient, placeId, () => optimisticLiked);

      if (!optimisticLiked) {
        queryClient.setQueriesData<LikedPlacesInfiniteData>(
          { queryKey: LIKED_PLACES_INFINITE_QUERY_KEY },
          (data) =>
            data
              ? {
                  ...data,
                  pages: data.pages.map((page) => ({
                    ...page,
                    data: page.data
                      ? {
                          ...page.data,
                          places: page.data.places?.filter((place) => place.placeId !== placeId),
                        }
                      : page.data,
                  })),
                }
              : data
        );
      }

      return { optimisticLiked, previousLiked, previousLikedPlaces };
    },
    onError: (_error, { placeId }, context) => {
      if (context) {
        updateCachedLikeState(queryClient, placeId, (liked) =>
          liked === context.optimisticLiked ? context.previousLiked : liked
        );
        context.previousLikedPlaces.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData<LikedPlacesInfiniteData>(queryKey, (currentData) =>
            restoreLikedPlace(currentData, previousData, placeId)
          );
        });
      }
      showToast({ type: 'error', message: LIKE_ERROR_MESSAGE });
    },
    onSuccess: (response, { placeId }) => {
      const liked = response.data?.liked;
      if (liked === undefined) return;

      updateCachedLikeState(queryClient, placeId, () => liked);
    },
    onSettled: async () => {
      // 진행 중인 좋아요 변경이 남아 있으면 재조회가 다른 장소의 낙관적 상태를 덮을 수 있습니다.
      if (queryClient.isMutating({ mutationKey: TOGGLE_PLACE_LIKE_MUTATION_KEY }) > 1) return;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: NEARBY_PLACES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: VISITED_PLACES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: LIKED_PLACES_INFINITE_QUERY_KEY }),
      ]);
    },
  });
};
