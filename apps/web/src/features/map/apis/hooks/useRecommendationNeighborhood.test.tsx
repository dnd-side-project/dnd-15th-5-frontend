import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { getRecentTowns, saveTown } from '@/features/map/apis/clients';
import type { ApiResponseRecentTownsResponse } from '@/features/map/apis/dto';
import { getGetRecentTownsQueryKey } from '@/features/map/apis/queryKeys';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';
import { useShopRecommendationStore } from '@/features/map/stores/shopRecommendationStore';

import { useRecommendationLocationActions } from './useRecommendationLocationActions';
import { useRecommendationNeighborhood } from './useRecommendationNeighborhood';

import type { PropsWithChildren } from 'react';

jest.mock('@/features/map/apis/clients');

const firstTown = { id: 1, administrativeDongName: '역삼동', latitude: 37.5, longitude: 127.03 };
const lastTown = { id: 2, administrativeDongName: '성수동', latitude: 37.54, longitude: 127.05 };
const response = { data: { towns: [firstTown, lastTown] } };

const setup = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
};

beforeEach(() => {
  jest.resetAllMocks();
  useLocationSelectionStore.setState(useLocationSelectionStore.getInitialState());
});

it('비활성 상태에서는 조회하지 않고 진입하면 첫 번째 최신 서버 동네의 주소와 ID를 복원한다', async () => {
  jest.mocked(getRecentTowns).mockResolvedValue(response);
  useShopRecommendationStore.setState({
    selectedCategory: '카페',
    listScrollTop: 300,
    activeRecommendationId: 'existing',
  });
  const { wrapper, client } = setup();
  const { result, rerender } = renderHook(
    ({ enabled }) => useRecommendationNeighborhood({ enabled }),
    { wrapper, initialProps: { enabled: false } }
  );
  expect(getRecentTowns).not.toHaveBeenCalled();
  expect(result.current.isLoading).toBe(false);
  expect(result.current.isEmpty).toBe(false);
  rerender({ enabled: true });
  await waitFor(() => expect(result.current.confirmedNeighborhoodId).toBe(1));
  expect(result.current.confirmedAddress).toBe('역삼동');
  expect(result.current.confirmedPosition).toEqual({ lat: 37.5, lng: 127.03 });
  expect(result.current.hasNeighborhood).toBe(true);
  expect(result.current.isError).toBe(false);
  expect(result.current.refetch).toBe(result.current.retry);
  expect(useShopRecommendationStore.getState()).toMatchObject({
    selectedCategory: '카페',
    listScrollTop: 300,
    activeRecommendationId: 'existing',
  });
  client.clear();
});

it('초기 로딩과 오류를 빈 목록과 구별하고 재시도로 빈 목록을 확인한다', async () => {
  let rejectRequest!: (error: Error) => void;
  jest
    .mocked(getRecentTowns)
    .mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectRequest = reject;
        })
    )
    .mockResolvedValueOnce({ data: { towns: [] } });
  const { wrapper, client } = setup();
  const { result } = renderHook(() => useRecommendationNeighborhood(), { wrapper });
  expect(result.current.isLoading).toBe(true);
  expect(result.current.isEmpty).toBe(false);
  await act(async () => rejectRequest(new Error('조회 실패')));
  await waitFor(() => expect(result.current.hasError).toBe(true));
  expect(result.current.isEmpty).toBe(false);
  await act(async () => {
    await result.current.retry();
  });
  await waitFor(() => expect(result.current.isEmpty).toBe(true));
  expect(result.current.hasError).toBe(false);
  client.clear();
});

it.each(['confirmed', 'draft'])(
  '응답 대기 중 사용자의 %s 선택을 덮어쓰지 않는다',
  async (selection) => {
    let resolveRequest!: (value: ApiResponseRecentTownsResponse) => void;
    jest.mocked(getRecentTowns).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );
    const { wrapper, client } = setup();
    const { result } = renderHook(() => useRecommendationNeighborhood(), { wrapper });
    const position = { lat: 35, lng: 129 };
    act(() => {
      if (selection === 'confirmed') {
        useLocationSelectionStore
          .getState()
          .setConfirmedNeighborhood({ position, address: '부산', id: 3 });
      } else {
        useLocationSelectionStore.getState().startDraftSelection(position);
      }
    });
    await act(async () => resolveRequest(response));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const state = useLocationSelectionStore.getState();
    if (selection === 'confirmed') expect(state.confirmedAddress).toBe('부산');
    else {
      expect(state.confirmedPosition).toBeNull();
      expect(state.draftSelection?.position).toEqual(position);
    }
    client.clear();
  }
);

it('재조회와 재진입은 확정 위치를 유지한다', async () => {
  jest.mocked(getRecentTowns).mockResolvedValue(response);
  const { wrapper, client } = setup();
  const { result, rerender } = renderHook(
    ({ enabled }) => useRecommendationNeighborhood({ enabled }),
    { wrapper, initialProps: { enabled: true } }
  );
  await waitFor(() => expect(result.current.confirmedNeighborhoodId).toBe(1));
  act(() => client.setQueryData(getGetRecentTownsQueryKey(), { data: { towns: [lastTown] } }));
  rerender({ enabled: false });
  rerender({ enabled: true });
  expect(result.current.confirmedNeighborhoodId).toBe(1);
  client.clear();
});

it('캐시된 최신 동네를 effect로 복원하기 전에는 빈 화면 대신 로딩을 반환한다', async () => {
  const { wrapper, client } = setup();
  client.setQueryDefaults(getGetRecentTownsQueryKey(), { staleTime: Infinity });
  client.setQueryData(getGetRecentTownsQueryKey(), response);
  const frames: { isLoading: boolean; hasNeighborhood: boolean; isEmpty: boolean }[] = [];
  const { result } = renderHook(
    () => {
      const neighborhood = useRecommendationNeighborhood();
      frames.push(neighborhood);
      return neighborhood;
    },
    { wrapper }
  );
  expect(frames[0]).toMatchObject({ isLoading: true, hasNeighborhood: false, isEmpty: false });
  await waitFor(() => expect(result.current.confirmedNeighborhoodId).toBe(1));
  expect(frames.every((frame) => frame.hasNeighborhood || frame.isLoading)).toBe(true);
  expect(result.current.isLoading).toBe(false);
  expect(getRecentTowns).not.toHaveBeenCalled();
  client.clear();
});

it('백그라운드 최근 동네 조회가 실패해도 확정된 추천 위치를 오류 화면으로 막지 않는다', async () => {
  const { wrapper, client } = setup();
  client.setQueryDefaults(getGetRecentTownsQueryKey(), { staleTime: Infinity });
  client.setQueryData(getGetRecentTownsQueryKey(), response);
  const { result } = renderHook(() => useRecommendationNeighborhood(), { wrapper });
  await waitFor(() => expect(result.current.confirmedNeighborhoodId).toBe(1));
  const error = new Error('백그라운드 조회 실패');
  jest.mocked(getRecentTowns).mockRejectedValue(error);
  await act(async () => {
    await result.current.refetch();
  });
  await waitFor(() => expect(result.current.error).toBe(error));
  expect(result.current).toMatchObject({
    isLoading: false,
    isError: false,
    hasError: false,
    hasNeighborhood: true,
    isEmpty: false,
    confirmedNeighborhoodId: 1,
    confirmedAddress: '역삼동',
  });
  client.clear();
});

it('동네 저장 성공 시 서버 ID와 주소를 보관하고 추천 필터와 스크롤을 초기화한다', async () => {
  jest.mocked(saveTown).mockResolvedValue({ data: { ...lastTown, id: 7 } });
  useShopRecommendationStore.setState({
    selectedCategory: '카페',
    listScrollTop: 300,
    activeRecommendationId: 'old',
  });
  const { wrapper, client } = setup();
  const { result } = renderHook(useRecommendationLocationActions, { wrapper });
  const onConfirm = jest.fn();
  act(() =>
    result.current.confirmLocation(
      { position: { lat: 37.54, lng: 127.05 }, address: '성수동', id: 2 },
      onConfirm
    )
  );
  await waitFor(() => expect(onConfirm).toHaveBeenCalled());
  expect(useLocationSelectionStore.getState()).toMatchObject({
    confirmedAddress: '성수동',
    confirmedNeighborhoodId: 7,
  });
  expect(useShopRecommendationStore.getState()).toMatchObject({
    selectedCategory: null,
    listScrollTop: 0,
    activeRecommendationId: null,
  });
  client.clear();
});
