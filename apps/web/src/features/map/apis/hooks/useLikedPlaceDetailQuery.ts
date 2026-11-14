import { useGetPlaceDetail } from '@/features/map/apis/queries';

/** 좋아요 장소 시트에 표시할 서버 상세 정보와 사진을 조회합니다. */
export const useLikedPlaceDetailQuery = (placeId: string) => {
  const numericPlaceId = Number(placeId);
  const isValidPlaceId = Number.isSafeInteger(numericPlaceId) && numericPlaceId > 0;
  const query = useGetPlaceDetail(numericPlaceId, {
    query: { enabled: isValidPlaceId },
  });

  return {
    ...query,
    detail: query.data?.data,
  };
};
