import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { useContext } from 'react';

import { RecommendationAccountContext } from '@/features/map/recommendationAccountContext';
import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';
import { useMapPlaceStampStore } from '@/features/map/stores/mapPlaceStampStore';
import { useShopRecommendationStore } from '@/features/map/stores/shopRecommendationStore';
import { useGetMyAccount } from '@/features/my-page/apis/queries';
import { useAuthStore } from '@/shared/stores/authStore';

import MapSessionBoundary from './MapSessionBoundary';

jest.mock('@/features/my-page/apis/queries');
const account = jest.mocked(useGetMyAccount);
beforeEach(() => {
  useMapPlaceStampStore.setState(useMapPlaceStampStore.getInitialState());
  useMapPlaceStampStore.getState().requestPlaceStamp('101');
  useAuthStore.setState({ isAuthenticated: true });
  account.mockReturnValue({ data: { data: { userId: 1 } }, isFetching: false } as ReturnType<
    typeof useGetMyAccount
  >);
  useLocationSelectionStore
    .getState()
    .setConfirmedNeighborhood({ address: '성수동', id: 1, position: { lat: 37.5, lng: 127 } });
  useShopRecommendationStore.setState({ selectedCategory: '카페', listScrollTop: 120 });
  useHomeBottomSheetStore.getState().showRecommendationPlace('101');
});

it('로그아웃 시 동네·추천 선택·개인 지도 캐시만 지운다', () => {
  const client = new QueryClient();
  client.setQueryData(['/v1/towns/recent'], { old: true });
  client.setQueryData(['/v1/recommendations/nearby-places'], { old: true });
  client.setQueryData(['public-data'], { keep: true });
  render(
    <QueryClientProvider client={client}>
      <MapSessionBoundary />
    </QueryClientProvider>
  );
  act(() => useAuthStore.getState().clearAuth());
  expect(useLocationSelectionStore.getState().confirmedPosition).toBeNull();
  expect(useLocationSelectionStore.getState().confirmedAddress).toBeNull();
  expect(useShopRecommendationStore.getState()).toMatchObject({
    selectedCategory: null,
    listScrollTop: 0,
    activeRecommendationId: null,
  });
  expect(useHomeBottomSheetStore.getState().activeSheet.type).toBe('home');
  expect(useMapPlaceStampStore.getState().stampRequest).toBeNull();
  expect(useMapPlaceStampStore.getState().stampSequence).toBe(1);
  expect(client.getQueryData(['/v1/towns/recent'])).toBeUndefined();
  expect(client.getQueryData(['/v1/recommendations/nearby-places'])).toBeUndefined();
  expect(client.getQueryData(['public-data'])).toEqual({ keep: true });
});

it('동일 계정의 재조회는 선택을 유지하고 계정 변경은 초기화한다', () => {
  const client = new QueryClient();
  const { rerender } = render(
    <QueryClientProvider client={client}>
      <MapSessionBoundary />
    </QueryClientProvider>
  );
  rerender(
    <QueryClientProvider client={client}>
      <MapSessionBoundary />
    </QueryClientProvider>
  );
  expect(useLocationSelectionStore.getState().confirmedAddress).toBe('성수동');
  expect(useMapPlaceStampStore.getState().stampRequest?.placeId).toBe('101');
  account.mockReturnValue({ data: { data: { userId: 2 } }, isFetching: false } as ReturnType<
    typeof useGetMyAccount
  >);
  rerender(
    <QueryClientProvider client={client}>
      <MapSessionBoundary />
    </QueryClientProvider>
  );
  expect(useLocationSelectionStore.getState().confirmedAddress).toBeNull();
  expect(useMapPlaceStampStore.getState().stampRequest).toBeNull();
});

it('계정 조회 결과를 자식에 전달하고 재조회 중에도 유지하며 로그아웃하면 비운다', () => {
  function IdentityProbe() {
    const userId = useContext(RecommendationAccountContext);
    return <span>추천 계정 {userId ?? '없음'}</span>;
  }
  const client = new QueryClient();
  const view = () => (
    <QueryClientProvider client={client}>
      <MapSessionBoundary>
        <IdentityProbe />
      </MapSessionBoundary>
    </QueryClientProvider>
  );
  const { rerender } = render(view());
  expect(screen.getByText('추천 계정 1')).toBeInTheDocument();
  account.mockReturnValue({ data: { data: { userId: 1 } }, isFetching: true } as ReturnType<
    typeof useGetMyAccount
  >);
  rerender(view());
  expect(screen.getByText('추천 계정 1')).toBeInTheDocument();
  act(() => useAuthStore.getState().clearAuth());
  expect(screen.getByText('추천 계정 없음')).toBeInTheDocument();
});
