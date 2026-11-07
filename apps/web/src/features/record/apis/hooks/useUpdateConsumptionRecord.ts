import { useQueryClient } from '@tanstack/react-query';

import { useStickerRecordSubmission } from '@/features/record/apis/hooks/useStickerRecordSubmission';
import { useUpdateConsumption } from '@/features/record/apis/mutations';
import { getGetConsumptionQueryKey } from '@/features/record/apis/queryKeys';
import { isConsumptionRelatedQuery } from '@/shared/apis/isConsumptionRelatedQuery';
import { useToast } from '@/shared/ui/toast';

/** 기존 이미지 ID는 유지하고 새 사진만 업로드한 뒤 소비 기록과 관련 캐시를 갱신합니다. */
export const useUpdateConsumptionRecord = (consumptionId: number, onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const mutation = useUpdateConsumption();

  return useStickerRecordSubmission({
    save: async (data) => {
      await mutation.mutateAsync({ consumptionId, data });
      const detailKey = getGetConsumptionQueryKey(consumptionId);
      // NOTE: 편집 중인 폼을 재조회로 초기화하지 않고 다음 진입 때 상세 정보를 갱신합니다.
      await queryClient.invalidateQueries({
        queryKey: detailKey,
        exact: true,
        refetchType: 'none',
      });
      await queryClient.invalidateQueries({
        predicate: (query) =>
          isConsumptionRelatedQuery(query) && query.queryKey[0] !== detailKey[0],
      });
    },
    errorMessage: '기록을 수정하지 못했어요. 다시 시도해주세요.',
    onSuccess: () => {
      showToast({ type: 'success', message: '기록 수정이 완료되었어요!' });
      onSuccess();
    },
  });
};
