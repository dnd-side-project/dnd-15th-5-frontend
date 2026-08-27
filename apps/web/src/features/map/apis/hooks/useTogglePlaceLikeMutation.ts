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

import type { QueryClient } from '@tanstack/react-query';

const LIKE_ERROR_MESSAGE = '좋아요 상태를 변경하지 못했어요. 잠시 후 다시 시도해주세요.';
const NEARBY_PLACES_QUERY_KEY = getGetNearbyPlacesQueryKey();
const VISITED_PLACES_QUERY_KEY = getGetVisitedPlaceMarkersQueryKey();

type LikeMutationContext = {
  optimisticLiked: boolean;
  previousLiked: boolean | undefined;
};

type LikeStateUpdater = (liked: boolean | undefined) => boolean | undefined;

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

/** 추천·지도 캐시의 좋아요 상태를 낙관적으로 맞추고 실패 시 이전 값으로 되돌립니다. */
export const useTogglePlaceLikeMutation = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<
    Awaited<ReturnType<typeof toggleLike>>,
    Error,
    { placeId: number },
    LikeMutationContext
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
      const previousLiked = currentRecommendation?.liked ?? currentVisitedPlace?.liked;
      const optimisticLiked = !(previousLiked ?? false);

      updateCachedLikeState(queryClient, placeId, () => optimisticLiked);

      return { optimisticLiked, previousLiked };
    },
    onError: (_error, { placeId }, context) => {
      if (context) {
        updateCachedLikeState(queryClient, placeId, (liked) =>
          liked === context.optimisticLiked ? context.previousLiked : liked
        );
      }
      showToast({ type: 'error', message: LIKE_ERROR_MESSAGE });
    },
    onSuccess: (response, { placeId }) => {
      const liked = response.data?.liked;
      if (liked === undefined) return;

      updateCachedLikeState(queryClient, placeId, () => liked);
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: NEARBY_PLACES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: VISITED_PLACES_QUERY_KEY }),
      ]);
    },
  });
};
