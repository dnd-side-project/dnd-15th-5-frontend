import { useInfiniteQuery } from '@tanstack/react-query';

import { getLikedPlaces } from '@/features/map/apis/clients';
import type { GetLikedPlacesParams } from '@/features/map/apis/dto';
import { getGetLikedPlacesQueryKey } from '@/features/map/apis/queryKeys';

const LIKED_PLACES_PAGE_SIZE = 5;

type LikedPlacesCursor = Pick<GetLikedPlacesParams, 'cursorId'>;

export const LIKED_PLACES_INFINITE_QUERY_KEY = [
  ...getGetLikedPlacesQueryKey(),
  'infinite',
] as const;

const getNextCursor = (
  lastPage: Awaited<ReturnType<typeof getLikedPlaces>>
): LikedPlacesCursor | undefined => {
  const pageData = lastPage.data;

  if (!pageData?.hasNext || pageData.nextCursorId === undefined) {
    return undefined;
  }

  return { cursorId: pageData.nextCursorId };
};

/** 선택한 카테고리의 좋아요 장소를 서버 커서가 끝날 때까지 조회합니다. */
export const useLikedPlacesInfiniteQuery = (category?: string) => {
  const query = useInfiniteQuery({
    queryKey: [...LIKED_PLACES_INFINITE_QUERY_KEY, { category, size: LIKED_PLACES_PAGE_SIZE }],
    queryFn: ({ pageParam, signal }) =>
      getLikedPlaces({ ...pageParam, category, size: LIKED_PLACES_PAGE_SIZE }, undefined, signal),
    initialPageParam: {} as LikedPlacesCursor,
    getNextPageParam: getNextCursor,
  });
  const likedPlaces = query.data?.pages.flatMap(({ data }) => data?.places ?? []) ?? [];
  const categories = query.data?.pages[0]?.data?.categories ?? [];

  return {
    categories,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isError: query.isError,
    isFetchNextPageError: query.isFetchNextPageError,
    isFetchingNextPage: query.isFetchingNextPage,
    isPending: query.isPending,
    likedPlaces,
    refetch: query.refetch,
  };
};
