import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import type { ApiResponse, ConsumptionCreateRequest } from '@/features/record/apis/dto';
import { useCreateConsumption } from '@/features/record/apis/mutations';
import { isConsumptionRelatedQuery } from '@/shared/apis/isConsumptionRelatedQuery';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { useToast } from '@/shared/ui/toast';

import type { AxiosError } from 'axios';

const CREATE_CONSUMPTION_ERROR_MESSAGE =
  '소비 기록을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.';
const CREATE_CONSUMPTION_SUCCESS_MESSAGE = '소비 기록이 저장되었어요.';

/** 소비 기록을 저장하고 관련 서버 상태를 갱신한 뒤 지도 홈으로 이동한다. */
export const useCreateConsumptionMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const mutation = useCreateConsumption({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          predicate: isConsumptionRelatedQuery,
        });
        showToast({ type: 'success', message: CREATE_CONSUMPTION_SUCCESS_MESSAGE });
        navigate(ROUTE_PATHS.home, { replace: true });
      },
      onError: (error: AxiosError<ApiResponse>) => {
        showToast({
          type: 'error',
          message: error.response?.data.message || CREATE_CONSUMPTION_ERROR_MESSAGE,
        });
      },
    },
  });

  return {
    createConsumption: (request: ConsumptionCreateRequest) => mutation.mutate({ data: request }),
    isCreatingConsumption: mutation.isPending,
  };
};
