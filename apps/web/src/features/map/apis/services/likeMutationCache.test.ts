import { QueryClient } from '@tanstack/react-query';

import type { ApiResponseNearbyPlacesResponse } from '@/features/map/apis/dto';
import { getGetNearbyPlacesQueryKey } from '@/features/map/apis/queryKeys';

import { getCachedLikedState } from './likeMutationCache';

describe('getCachedLikedState', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it.each([true, false])(
    '카테고리 추천에 liked가 없으면 중복 전체 추천의 %p 값을 사용한다',
    (liked) => {
      queryClient.setQueryData<ApiResponseNearbyPlacesResponse>(getGetNearbyPlacesQueryKey(), {
        data: {
          categoryPlaces: [{ category: '카페', places: [{ placeId: 101 }] }],
          allPlaces: [{ placeId: 101, liked }],
        },
      });
      expect(getCachedLikedState(queryClient, 101, ['liked-places'])).toBe(liked);
    }
  );
});
