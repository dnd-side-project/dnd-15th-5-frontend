import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toggleLike } from '@/features/map/apis/clients';
import type {
  ApiResponseNearbyPlacesResponse,
  ApiResponseVisitedPlaceMarkerResponse,
  RecommendedPlaceItem,
} from '@/features/map/apis/dto';
import {
  getGetNearbyPlacesQueryKey,
  getGetVisitedPlaceMarkersQueryKey,
} from '@/features/map/apis/queryKeys';
import { useToast } from '@/shared/ui/toast';

import type { QueryClient, QueryKey } from '@tanstack/react-query';

const LIKE_ERROR_MESSAGE = '좋아요 상태를 변경하지 못했어요. 잠시 후 다시 시도해주세요.';
const NEARBY_PLACES_QUERY_KEY = getGetNearbyPlacesQueryKey();
const VISITED_PLACES_QUERY_KEY = getGetVisitedPlaceMarkersQueryKey();

type LikeSnapshot = {
  nearbyPlaces: Array<[QueryKey, ApiResponseNearbyPlacesResponse | undefined]>;
  visitedPlaces: Array<[QueryKey, ApiResponseVisitedPlaceMarkerResponse | undefined]>;
};

const updateRecommendedPlaces = (
  places: RecommendedPlaceItem[] | undefined,
  placeId: number,
  liked: boolean
) => places?.map((place) => (place.placeId === placeId ? { ...place, liked } : place));

const updateNearbyPlacesResponse = (
  response: ApiResponseNearbyPlacesResponse | undefined,
  placeId: number,
  liked: boolean
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
                liked
              ),
              myTownPlaces: updateRecommendedPlaces(response.data.myTownPlaces, placeId, liked),
            }
          : response.data,
      }
    : response;

const updateVisitedPlacesResponse = (
  response: ApiResponseVisitedPlaceMarkerResponse | undefined,
  placeId: number,
  liked: boolean
) =>
  response
    ? {
        ...response,
        data: response.data
          ? {
              ...response.data,
              places: response.data.places?.map((place) =>
                place.placeId === placeId ? { ...place, liked } : place
              ),
            }
          : response.data,
      }
    : response;

const setCachedLikeState = (queryClient: QueryClient, placeId: number, liked: boolean) => {
  queryClient.setQueriesData<ApiResponseNearbyPlacesResponse>(
    { queryKey: NEARBY_PLACES_QUERY_KEY },
    (response) => updateNearbyPlacesResponse(response, placeId, liked)
  );
  queryClient.setQueriesData<ApiResponseVisitedPlaceMarkerResponse>(
    { queryKey: VISITED_PLACES_QUERY_KEY },
    (response) => updateVisitedPlacesResponse(response, placeId, liked)
  );
};

/** 추천·지도 캐시의 좋아요 상태를 낙관적으로 맞추고 실패 시 이전 값으로 되돌립니다. */
export const useTogglePlaceLikeMutation = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<
    Awaited<ReturnType<typeof toggleLike>>,
    Error,
    { placeId: number },
    LikeSnapshot
  >({
    mutationFn: ({ placeId }) => toggleLike(placeId),
    onMutate: async ({ placeId }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: NEARBY_PLACES_QUERY_KEY }),
        queryClient.cancelQueries({ queryKey: VISITED_PLACES_QUERY_KEY }),
      ]);

      const nearbyPlaces = queryClient.getQueriesData<ApiResponseNearbyPlacesResponse>({
        queryKey: NEARBY_PLACES_QUERY_KEY,
      });
      const visitedPlaces = queryClient.getQueriesData<ApiResponseVisitedPlaceMarkerResponse>({
        queryKey: VISITED_PLACES_QUERY_KEY,
      });
      const currentRecommendation = nearbyPlaces
        .flatMap(([, response]) => [
          ...(response?.data?.sameCategoryPlaces ?? []),
          ...(response?.data?.myTownPlaces ?? []),
        ])
        .find((place) => place.placeId === placeId);
      const currentVisitedPlace = visitedPlaces
        .flatMap(([, response]) => response?.data?.places ?? [])
        .find((place) => place.placeId === placeId);
      const nextLiked = !(currentRecommendation?.liked ?? currentVisitedPlace?.liked ?? false);

      setCachedLikeState(queryClient, placeId, nextLiked);

      return { nearbyPlaces, visitedPlaces };
    },
    onError: (_error, _variables, snapshot) => {
      snapshot?.nearbyPlaces.forEach(([queryKey, data]) =>
        queryClient.setQueryData(queryKey, data)
      );
      snapshot?.visitedPlaces.forEach(([queryKey, data]) =>
        queryClient.setQueryData(queryKey, data)
      );
      showToast({ type: 'error', message: LIKE_ERROR_MESSAGE });
    },
    onSuccess: (response, { placeId }) => {
      const liked = response.data?.liked;
      if (liked === undefined) return;

      setCachedLikeState(queryClient, placeId, liked);
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: NEARBY_PLACES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: VISITED_PLACES_QUERY_KEY }),
      ]);
    },
  });
};
