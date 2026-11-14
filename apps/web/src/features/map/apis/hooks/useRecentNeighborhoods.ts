import { useQueryClient } from '@tanstack/react-query';

import { useDeleteRecentTown } from '@/features/map/apis/mutations';
import { useGetRecentTowns } from '@/features/map/apis/queries';
import { getGetRecentTownsQueryKey } from '@/features/map/apis/queryKeys';
import type { MapPosition } from '@/features/map/types';

export type RecentNeighborhood = {
  id: number;
  address: string;
  administrativeDongCode?: string;
  position: MapPosition;
};

/** 최근 설정한 동네를 서버 순서대로 보여주고, 삭제 후 목록을 갱신합니다. */
export const useRecentNeighborhoods = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const queryClient = useQueryClient();
  const query = useGetRecentTowns({ query: { enabled } });
  const removeTown = useDeleteRecentTown({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetRecentTownsQueryKey() }),
    },
  });
  const recentNeighborhoods = (query.data?.data?.towns ?? []).flatMap(
    (town): RecentNeighborhood[] => {
      const { id, administrativeDongCode, administrativeDongName, latitude, longitude } = town;
      if (
        id === undefined ||
        !administrativeDongName ||
        latitude === undefined ||
        longitude === undefined ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return [];
      }
      return [
        {
          id,
          address: administrativeDongName,
          ...(administrativeDongCode ? { administrativeDongCode } : {}),
          position: { lat: latitude, lng: longitude },
        },
      ];
    }
  );

  return {
    recentNeighborhoods,
    latestNeighborhood: recentNeighborhoods[0] ?? null,
    isLoading: enabled && query.isPending,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    hasLoadError: query.isError,
    error: query.error,
    retry: query.refetch,
    hasError: query.isError || removeTown.isError,
    removingId: removeTown.isPending ? removeTown.variables?.userTownId : undefined,
    removeRecentNeighborhood: (userTownId: number) => removeTown.mutate({ userTownId }),
  };
};
