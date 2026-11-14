import { useGetConsumption } from '@/features/record/apis/queries';
import { isPositiveSafeInteger } from '@/shared/utils/isPositiveSafeInteger';

type ConsumptionReturnTargetOptions = {
  consumptionId?: number;
  fallbackDate?: string;
  placeId: number;
};

/** 수정한 기록의 최신 가게·날짜를 확인하고, 옮겨지거나 삭제된 기록은 원래 날짜로 복귀합니다. */
export const useConsumptionReturnTarget = ({
  consumptionId,
  fallbackDate,
  placeId,
}: ConsumptionReturnTargetOptions) => {
  const hasTarget = isPositiveSafeInteger(consumptionId);
  const query = useGetConsumption(consumptionId ?? 0, {
    query: {
      enabled: hasTarget,
      staleTime: 0,
      refetchOnWindowFocus: false,
      retry: false,
    },
  });
  const record = query.data?.data;
  const isSamePlace = hasTarget && !query.isError && record?.placeId === placeId;

  return {
    isRestoreTargetPending: hasTarget && (query.isPending || query.isFetching),
    scrollToConsumptionId: isSamePlace ? consumptionId : undefined,
    scrollToDate: isSamePlace ? (record.purchaseDate ?? fallbackDate) : fallbackDate,
  };
};
