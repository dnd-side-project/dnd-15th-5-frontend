import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { toggleLike } from '@/features/map/apis/clients';
import type { ApiResponseNearbyPlacesResponse } from '@/features/map/apis/dto';
import { useToast } from '@/shared/ui/toast';

import { useTogglePlaceLikeMutation } from './useTogglePlaceLikeMutation';

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
    const recommendationKey = ['/recommendations/nearby-places', { lat: 37.5, lng: 127 }] as const;
    queryClient.setQueryData<ApiResponseNearbyPlacesResponse>(recommendationKey, {
      data: {
        sameCategoryPlaces: [{ placeId: 101, name: '투썸플레이스', liked: false }],
        myTownPlaces: [],
      },
    });
    queryClient.setQueryData(['/consumptions/visited-places'], {
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
      queryClient.getQueryData<{ data: { places: Array<{ liked: boolean }> } }>([
        '/consumptions/visited-places',
      ])?.data.places[0]?.liked
    ).toBe(true);
  });

  it('요청이 실패하면 이전 캐시를 복구하고 오류 토스트를 표시한다', async () => {
    mockedToggleLike.mockRejectedValue(new Error('network error'));
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const recommendationKey = ['/recommendations/nearby-places', { lat: 37.5, lng: 127 }] as const;
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
    const recommendationKey = ['/recommendations/nearby-places', { lat: 37.5, lng: 127 }] as const;
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
});
