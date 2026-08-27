import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { getGetMonthlyReportQueryKey } from '@/features/report/apis/queryKeys';
import { aggregateMonthlyReport } from '@/features/report/apis/services/aggregateMonthlyReport';
import type { YearMonth } from '@/shared/types/yearMonth';
import { useToast } from '@/shared/ui/toast';
import { formatYearMonth } from '@/shared/utils/yearMonth';

const BATCH_ERROR_MESSAGE = '리포트를 생성하지 못했어요. 다시 시도해 주세요.';
const BATCH_LOCKED_MESSAGE = '다른 리포트 생성 작업이 진행 중이에요.';

/** 개발 환경에서 선택한 월의 리포트 배치를 실행하고 조회 캐시를 갱신합니다. */
export const useAggregateMonthlyReportMutation = (month: YearMonth) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const yearMonth = formatYearMonth(month);
  const mutation = useMutation({
    mutationFn: () => aggregateMonthlyReport(yearMonth),
    onSuccess: async ({ data }) => {
      if (!data?.lockAcquired) {
        showToast({ message: BATCH_LOCKED_MESSAGE, type: 'error' });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: getGetMonthlyReportQueryKey({ yearMonth }),
      });
      showToast({
        message: `${month.month}월 리포트 생성이 완료됐어요.`,
        type: 'success',
      });
    },
    onError: (error) => {
      showToast({
        message: (isAxiosError(error) && error.response?.data?.message) || BATCH_ERROR_MESSAGE,
        type: 'error',
      });
    },
  });

  return {
    aggregateMonthlyReport: mutation.mutate,
    isAggregatingMonthlyReport: mutation.isPending,
  };
};
