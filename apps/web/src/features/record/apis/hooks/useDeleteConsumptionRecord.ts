import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { useDeleteConsumption } from '@/features/record/apis/mutations';
import { getGetConsumptionQueryKey } from '@/features/record/apis/queryKeys';
import { isConsumptionRelatedQuery } from '@/shared/apis/isConsumptionRelatedQuery';
import { useToast } from '@/shared/ui/toast';
import { isPositiveSafeInteger } from '@/shared/utils/isPositiveSafeInteger';

/** 삭제를 한 번만 요청하고 연결된 상세 캐시를 제거한 뒤 관련 목록과 집계를 갱신합니다. */
export const useDeleteConsumptionRecord = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const isPendingRef = useRef(false);
  const deletion = useDeleteConsumption({
    mutation: {
      onSuccess: async (_response, { consumptionId }) => {
        queryClient.removeQueries({
          queryKey: getGetConsumptionQueryKey(consumptionId),
          exact: true,
        });
        await queryClient.invalidateQueries({ predicate: isConsumptionRelatedQuery });
        showToast({ type: 'success', message: '기록 삭제가 완료되었어요!' });
      },
    },
  });

  const deleteRecord = async (consumptionId: number) => {
    if (isPendingRef.current || !isPositiveSafeInteger(consumptionId)) return false;
    isPendingRef.current = true;
    try {
      await deletion.mutateAsync({ consumptionId });
      return true;
    } catch {
      return false;
    } finally {
      isPendingRef.current = false;
    }
  };

  return {
    deleteRecord,
    isDeleting: deletion.isPending,
    deleteError: deletion.isError ? '기록을 삭제하지 못했어요. 다시 시도해주세요.' : '',
    clearDeleteError: deletion.reset,
  };
};
