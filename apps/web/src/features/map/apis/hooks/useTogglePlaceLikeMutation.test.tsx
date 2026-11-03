import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { toggleLike } from '@/features/map/apis/clients';
import type {
  ApiResponseLikedPlaceScrollResponse,
  ApiResponseNearbyPlacesResponse,
} from '@/features/map/apis/dto';
import { LIKED_PLACES_INFINITE_QUERY_KEY } from '@/features/map/apis/hooks/useLikedPlacesInfiniteQuery';
import {
  getGetNearbyPlacesQueryKey,
  getGetVisitedPlaceMarkersQueryKey,
} from '@/features/map/apis/queryKeys';
import { useToast } from '@/shared/ui/toast';

import { useTogglePlaceLikeMutation } from './useTogglePlaceLikeMutation';

import type { InfiniteData } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

jest.mock('@/features/map/apis/clients', () => ({ toggleLike: jest.fn() }));
jest.mock('@/shared/ui/toast', () => ({ useToast: jest.fn() }));

const mockedToggleLike = jest.mocked(toggleLike);
const mockedUseToast = jest.mocked(useToast);
const showToast = jest.fn();

const createWrapper = (queryClient: QueryClient) =>
  function QueryWrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

describe('useTogglePlaceLikeMutation', () => {
  beforeEach(() => {
    mockedToggleLike.mockReset();
    showToast.mockReset();
    mockedUseToast.mockReturnValue({
      showToast,
      closeToast: jest.fn(),
    });
  });

  it('추천과 방문 장소 캐시를 즉시 변경한다', async () => {
    mockedToggleLike.mockResolvedValue({ data: { liked: true } });
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const recommendationKey = getGetNearbyPlacesQueryKey({ lat: 37.5, lng: 127 });
    const visitedPlacesKey = getGetVisitedPlaceMarkersQueryKey();
    queryClient.setQueryData<ApiResponseNearbyPlacesResponse>(recommendationKey, {
      data: {
        sameCategoryPlaces: [{ placeId: 101, name: '투썸플레이스', liked: false }],
        myTownPlaces: [],
      },
    });
    queryClient.setQueryData(visitedPlacesKey, {
      data: { places: [{ placeId: 101, placeName: '투썸플레이스', liked: false }] },
    });
    const { result } = renderHook(() => useTogglePlaceLikeMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ placeId: 101 });
    });

    expect(
      queryClient.getQueryData<ApiResponseNearbyPlacesResponse>(recommendationKey)?.data
        ?.sameCategoryPlaces?.[0]?.liked
    ).toBe(true);
    expect(
      queryClient.getQueryData<{ data: { places: Array<{ liked: boolean }> } }>(visitedPlacesKey)
        ?.data.places[0]?.liked
    ).toBe(true);
  });

  it('요청이 실패하면 이전 캐시를 복구하고 오류 토스트를 표시한다', async () => {
    mockedToggleLike.mockRejectedValue(new Error('network error'));
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const recommendationKey = getGetNearbyPlacesQueryKey({ lat: 37.5, lng: 127 });
    queryClient.setQueryData<ApiResponseNearbyPlacesResponse>(recommendationKey, {
      data: { sameCategoryPlaces: [{ placeId: 101, liked: false }] },
    });
    const { result } = renderHook(() => useTogglePlaceLikeMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(result.current.mutateAsync({ placeId: 101 })).rejects.toThrow('network error');
    });

    await waitFor(() =>
      expect(
        queryClient.getQueryData<ApiResponseNearbyPlacesResponse>(recommendationKey)?.data
          ?.sameCategoryPlaces?.[0]?.liked
      ).toBe(false)
    );
    expect(showToast).toHaveBeenCalledWith({
      type: 'error',
      message: '좋아요 상태를 변경하지 못했어요. 잠시 후 다시 시도해주세요.',
    });
  });

  it('서로 다른 장소의 요청이 겹칠 때 실패한 장소만 이전 상태로 되돌린다', async () => {
    let rejectFirstRequest: ((reason: Error) => void) | undefined;
    let resolveSecondRequest:
      ((response: Awaited<ReturnType<typeof toggleLike>>) => void) | undefined;
    mockedToggleLike.mockImplementation((placeId) => {
      if (placeId === 101) {
        return new Promise((_, reject) => {
          rejectFirstRequest = reject;
        });
      }

      return new Promise((resolve) => {
        resolveSecondRequest = resolve;
      });
    });
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const recommendationKey = getGetNearbyPlacesQueryKey({ lat: 37.5, lng: 127 });
    queryClient.setQueryData<ApiResponseNearbyPlacesResponse>(recommendationKey, {
      data: {
        sameCategoryPlaces: [
          { placeId: 101, liked: false },
          { placeId: 202, liked: false },
        ],
      },
    });
    const { result } = renderHook(() => useTogglePlaceLikeMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let firstRequest: Promise<Awaited<ReturnType<typeof toggleLike>>> | undefined;
    let secondRequest: Promise<Awaited<ReturnType<typeof toggleLike>>> | undefined;
    await act(async () => {
      firstRequest = result.current.mutateAsync({ placeId: 101 });
      secondRequest = result.current.mutateAsync({ placeId: 202 });
      await Promise.resolve();
    });

    resolveSecondRequest?.({ data: { liked: true } });
    await act(async () => {
      await secondRequest;
    });
    rejectFirstRequest?.(new Error('first request failed'));
    await act(async () => {
      await expect(firstRequest).rejects.toThrow('first request failed');
    });

    const places =
      queryClient.getQueryData<ApiResponseNearbyPlacesResponse>(recommendationKey)?.data
        ?.sameCategoryPlaces;
    expect(places?.find(({ placeId }) => placeId === 101)?.liked).toBe(false);
    expect(places?.find(({ placeId }) => placeId === 202)?.liked).toBe(true);
  });

  it('페이지 구성이 바뀌어도 기존 이웃 장소가 있는 페이지에 복구한다', async () => {
    let rejectRequest: ((reason: Error) => void) | undefined;
    mockedToggleLike.mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectRequest = reject;
        })
    );
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const likedPlacesKey = [
      ...LIKED_PLACES_INFINITE_QUERY_KEY,
      { category: undefined, size: 5 },
    ] as const;
    type LikedPlacesInfiniteData = InfiniteData<
      ApiResponseLikedPlaceScrollResponse,
      { cursorId?: number }
    >;
    queryClient.setQueryData<LikedPlacesInfiniteData>(likedPlacesKey, {
      pages: [
        {
          data: {
            places: [
              { placeId: 101, name: '장소 A' },
              { placeId: 202, name: '장소 B' },
            ],
          },
        },
        { data: { places: [{ placeId: 303, name: '장소 C' }] } },
      ],
      pageParams: [{}, { cursorId: 202 }],
    });
    const { result } = renderHook(() => useTogglePlaceLikeMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let request: Promise<Awaited<ReturnType<typeof toggleLike>>> | undefined;
    await act(async () => {
      request = result.current.mutateAsync({ placeId: 101 });
      await Promise.resolve();
    });

    // 다른 조회가 페이지 구성을 바꿔 기존 이웃 장소가 두 번째 페이지로 이동한 상황을 만든다.
    queryClient.setQueryData<LikedPlacesInfiniteData>(likedPlacesKey, {
      pages: [
        {
          data: {
            places: [
              { placeId: 303, name: '장소 C' },
              { placeId: 404, name: '장소 D' },
            ],
          },
        },
        { data: { places: [{ placeId: 202, name: '장소 B' }] } },
      ],
      pageParams: [{}, { cursorId: 404 }],
    });

    rejectRequest?.(new Error('unlike failed'));
    await act(async () => {
      await expect(request).rejects.toThrow('unlike failed');
    });

    const pages = queryClient.getQueryData<LikedPlacesInfiniteData>(likedPlacesKey)?.pages ?? [];
    const placeIds = pages.flatMap(
      (page) => page.data?.places?.map((place) => place.placeId) ?? []
    );

    expect(pages[0]?.data?.places?.map(({ placeId }) => placeId)).toEqual([303, 404]);
    expect(pages[1]?.data?.places?.map(({ placeId }) => placeId)).toEqual([101, 202]);
    expect(placeIds.filter((placeId) => placeId === 101)).toHaveLength(1);
  });
});
