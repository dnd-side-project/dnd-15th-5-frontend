import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

import { RecommendationAccountContext } from '@/features/map/recommendationAccountContext';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';
import { useMapCategoryFilterStore } from '@/features/map/stores/mapCategoryFilterStore';
import { useMapFocusStore } from '@/features/map/stores/mapFocusStore';
import { useMapViewportStore } from '@/features/map/stores/mapViewportStore';
import { useShopRecommendationStore } from '@/features/map/stores/shopRecommendationStore';
import { useGetMyAccount } from '@/features/my-page/apis/queries';
import { useAuthStore } from '@/shared/stores/authStore';

import type { PropsWithChildren } from 'react';

const MAP_QUERY_PREFIXES = [
  '/v1/towns/',
  '/v1/recommendations/',
  '/v1/places/likes',
  '/v1/consumptions/visited-places',
];

type MapSessionBoundaryProps = PropsWithChildren;

/** 인증 경계에서 개인 지도 상태와 캐시를 함께 비워 다음 계정으로 이어지지 않게 합니다. */
export default function MapSessionBoundary({ children }: MapSessionBoundaryProps) {
  const client = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const account = useGetMyAccount({ query: { enabled: isAuthenticated } });
  const identityRef = useRef<number | null>(null);
  const reset = useCallback(() => {
    useHomeBottomSheetStore.setState(useHomeBottomSheetStore.getInitialState());
    useLocationSelectionStore.setState(useLocationSelectionStore.getInitialState());
    useShopRecommendationStore.setState(useShopRecommendationStore.getInitialState());
    useMapCategoryFilterStore.setState(useMapCategoryFilterStore.getInitialState());
    useMapFocusStore.setState(useMapFocusStore.getInitialState());
    useMapViewportStore.setState(useMapViewportStore.getInitialState());
    client.removeQueries({
      predicate: ({ queryKey }) => {
        const path = queryKey[0];
        return (
          typeof path === 'string' && MAP_QUERY_PREFIXES.some((prefix) => path.startsWith(prefix))
        );
      },
    });
  }, [client]);

  useEffect(
    () =>
      useAuthStore.subscribe((state, previous) => {
        if (previous.isAuthenticated && !state.isAuthenticated) {
          identityRef.current = null;
          reset();
        }
      }),
    [reset]
  );

  const userId = account.data?.data?.userId;
  useEffect(() => {
    if (!isAuthenticated || account.isFetching || userId === undefined) return;
    if (identityRef.current !== null && identityRef.current !== userId) reset();
    identityRef.current = userId;
  }, [isAuthenticated, account.isFetching, userId, reset]);
  return (
    <RecommendationAccountContext value={isAuthenticated ? (userId ?? null) : null}>
      {children}
    </RecommendationAccountContext>
  );
}
