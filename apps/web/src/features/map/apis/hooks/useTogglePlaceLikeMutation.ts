import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toggleLike } from '@/features/map/apis/clients';
import {
  getGetNearbyPlacesQueryKey,
  getGetVisitedPlaceMarkersQueryKey,
} from '@/features/map/apis/queryKeys';
import {
  getCachedLikedState,
  restoreLikedPlace,
  updateCachedLikeState,
} from '@/features/map/apis/services/likeMutationCache';
import type {
  LikedPlacesCacheSnapshot,
  LikedPlacesInfiniteData,
} from '@/features/map/apis/services/likeMutationCache';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useToast } from '@/shared/ui/toast';

import { LIKED_PLACES_INFINITE_QUERY_KEY } from './useLikedPlacesInfiniteQuery';

import type { QueryClient } from '@tanstack/react-query';

const LIKE_ERROR_MESSAGE = '좋아요 상태를 변경하지 못했어요. 잠시 후 다시 시도해주세요.';
export const TOGGLE_PLACE_LIKE_MUTATION_KEY = ['toggle-place-like'] as const;
const NEARBY_PLACES_QUERY_KEY = getGetNearbyPlacesQueryKey();
const VISITED_PLACES_QUERY_KEY = getGetVisitedPlaceMarkersQueryKey();

type LikeMutationBaseline = {
  confirmedLiked: boolean | undefined;
  optimisticLiked: boolean;
  previousLikedPlaces: LikedPlacesCacheSnapshot;
};

type PlaceLikeMutationState = {
  latestSequence: number;
  requestQueue?: Promise<void>;
  baseline?: LikeMutationBaseline;
  pendingToastSequence?: number;
  settledSequence?: number;
};

type LikeMutationContext = {
  optimisticLiked: boolean;
  requestSequence: number;
  baseline: LikeMutationBaseline;
};

const placeLikeMutationStatesByClient = new WeakMap<
  QueryClient,
  Map<number, PlaceLikeMutationState>
>();

const getPlaceLikeMutationStates = (queryClient: QueryClient) => {
  let states = placeLikeMutationStatesByClient.get(queryClient);
  if (!states) {
    states = new Map();
    placeLikeMutationStatesByClient.set(queryClient, states);
  }

  return states;
};

const getPlaceLikeMutationState = (queryClient: QueryClient, placeId: number) => {
  const states = getPlaceLikeMutationStates(queryClient);
  let state = states.get(placeId);
  if (!state) {
    state = { latestSequence: 0 };
    states.set(placeId, state);
  }

  return state;
};

const isLatestLikeRequest = (queryClient: QueryClient, placeId: number, sequence: number) =>
  placeLikeMutationStatesByClient.get(queryClient)?.get(placeId)?.latestSequence === sequence;

const toggleLikeInSequence = async (queryClient: QueryClient, placeId: number) => {
  const state = getPlaceLikeMutationState(queryClient, placeId);
  const previousRequest = state.requestQueue ?? Promise.resolve();
  let releaseRequest!: () => void;
  const currentRequest = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });

  state.requestQueue = currentRequest;
  await previousRequest;

  try {
    return await toggleLike(placeId);
  } finally {
    releaseRequest();
    if (state.requestQueue === currentRequest) {
      state.requestQueue = undefined;
    }
  }
};

const showLikeToast = (
  placeId: number,
  liked: boolean,
  showToast: ReturnType<typeof useToast>['showToast']
) => {
  showToast({
    type: 'like',
    message: liked ? '좋아요 목록에 추가했어요' : '좋아요 목록에서 삭제했어요',
    placement: 'above-bottom-sheet',
  });

  if (!liked) {
    useHomeBottomSheetStore.getState().closeLikedRecommendationIfMatches(String(placeId));
  }
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
    mutationFn: ({ placeId }) => toggleLikeInSequence(queryClient, placeId),
    onMutate: async ({ placeId }) => {
      const state = getPlaceLikeMutationState(queryClient, placeId);
      const requestSequence = state.latestSequence + 1;
      state.latestSequence = requestSequence;
      let baseline = state.baseline;
      if (!baseline) {
        const confirmedLiked = getCachedLikedState(
          queryClient,
          placeId,
          LIKED_PLACES_INFINITE_QUERY_KEY
        );
        baseline = {
          confirmedLiked,
          optimisticLiked: confirmedLiked ?? false,
          previousLikedPlaces: queryClient.getQueriesData<LikedPlacesInfiniteData>({
            queryKey: LIKED_PLACES_INFINITE_QUERY_KEY,
          }),
        };
        state.baseline = baseline;
      }
      const optimisticLiked = !baseline.optimisticLiked;
      baseline.optimisticLiked = optimisticLiked;

      await Promise.all([
        queryClient.cancelQueries({ queryKey: NEARBY_PLACES_QUERY_KEY }),
        queryClient.cancelQueries({ queryKey: VISITED_PLACES_QUERY_KEY }),
        queryClient.cancelQueries({ queryKey: LIKED_PLACES_INFINITE_QUERY_KEY }),
      ]);

      if (isLatestLikeRequest(queryClient, placeId, requestSequence)) {
        updateCachedLikeState(queryClient, placeId, () => optimisticLiked);
      }

      if (!optimisticLiked && isLatestLikeRequest(queryClient, placeId, requestSequence)) {
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

      return {
        optimisticLiked,
        requestSequence,
        baseline,
      };
    },
    onError: (_error, { placeId }, context) => {
      if (context && !isLatestLikeRequest(queryClient, placeId, context.requestSequence)) return;

      if (context) {
        context.baseline.optimisticLiked = context.baseline.confirmedLiked ?? false;
        updateCachedLikeState(queryClient, placeId, (liked) =>
          liked === context.optimisticLiked ? context.baseline.confirmedLiked : liked
        );
        context.baseline.previousLikedPlaces.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData<LikedPlacesInfiniteData>(queryKey, (currentData) =>
            restoreLikedPlace(currentData, previousData, placeId)
          );
        });
      }
      showToast({ type: 'error', message: LIKE_ERROR_MESSAGE });
    },
    onSuccess: (response, { placeId }, context) => {
      const liked = response.data?.liked;
      if (liked !== undefined && context) {
        context.baseline.confirmedLiked = liked;
        if (isLatestLikeRequest(queryClient, placeId, context.requestSequence)) {
          context.baseline.optimisticLiked = liked;
        }
      }
      if (
        liked === undefined ||
        !context ||
        !isLatestLikeRequest(queryClient, placeId, context.requestSequence)
      ) {
        return;
      }

      updateCachedLikeState(queryClient, placeId, () => liked);
      showLikeToast(placeId, liked, showToast);
    },
    onSettled: async (response, error, { placeId }, context) => {
      if (context && isLatestLikeRequest(queryClient, placeId, context.requestSequence)) {
        const state = getPlaceLikeMutationState(queryClient, placeId);
        state.settledSequence = context.requestSequence;
        if (!error && response?.data?.liked === undefined) {
          state.pendingToastSequence = context.requestSequence;
        }
      }

      // 진행 중인 좋아요 변경이 남아 있으면 재조회가 다른 장소의 낙관적 상태를 덮을 수 있습니다.
      if (queryClient.isMutating({ mutationKey: TOGGLE_PLACE_LIKE_MUTATION_KEY }) > 1) return;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: NEARBY_PLACES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: VISITED_PLACES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: LIKED_PLACES_INFINITE_QUERY_KEY }),
      ]);

      const placeLikeMutationStates = getPlaceLikeMutationStates(queryClient);
      placeLikeMutationStates.forEach((state, pendingPlaceId) => {
        const sequence = state.pendingToastSequence;
        if (sequence === undefined) return;

        if (isLatestLikeRequest(queryClient, pendingPlaceId, sequence)) {
          const liked = getCachedLikedState(
            queryClient,
            pendingPlaceId,
            LIKED_PLACES_INFINITE_QUERY_KEY,
            true
          );
          if (liked !== undefined) {
            const baseline = state.baseline;
            if (baseline) {
              baseline.confirmedLiked = liked;
              baseline.optimisticLiked = liked;
              updateCachedLikeState(queryClient, pendingPlaceId, () => liked);
            }
            showLikeToast(pendingPlaceId, liked, showToast);
          }
        }
        state.pendingToastSequence = undefined;
      });

      placeLikeMutationStates.forEach((state, settledPlaceId) => {
        if (
          state.settledSequence === undefined ||
          !isLatestLikeRequest(queryClient, settledPlaceId, state.settledSequence) ||
          state.requestQueue !== undefined
        ) {
          return;
        }

        placeLikeMutationStates.delete(settledPlaceId);
      });
    },
  });
};
