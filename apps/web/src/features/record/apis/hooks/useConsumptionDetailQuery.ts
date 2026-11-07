import { useGetConsumption } from '@/features/record/apis/queries';
import { isPositiveSafeInteger } from '@/shared/utils/isPositiveSafeInteger';

/** 수정 진입마다 짧게 유효한 사진 URL을 새로 조회하고 잘못된 ID로는 요청하지 않습니다. */
export const useConsumptionDetailQuery = (consumptionId: number) =>
  useGetConsumption(consumptionId, {
    query: {
      enabled: isPositiveSafeInteger(consumptionId),
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  });
