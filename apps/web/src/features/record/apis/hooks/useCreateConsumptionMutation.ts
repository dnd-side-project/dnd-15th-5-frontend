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

/**
 * 소비 기록을 저장하고 관련 서버 상태를 갱신한 뒤 지도 홈으로 이동한다.
 *
 * 방금 등록한 장소를 지도 홈에서 바로 포커스·안내할 수 있도록 장소명·좌표를
 * 홈 라우트 state로 함께 전달한다. 완료 안내는 지도 홈이 해당 장소의 방문 횟수를
 * 확인한 뒤 표시하므로 여기서는 Toast를 띄우지 않는다.
 */
export const useCreateConsumptionMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const mutation = useCreateConsumption({
    mutation: {
      onSuccess: async (_response, { data: request }) => {
        await queryClient.invalidateQueries({
          predicate: isConsumptionRelatedQuery,
        });
        navigate(ROUTE_PATHS.home, {
          replace: true,
          state: {
            createdPlace: {
              placeName: request.placeName,
              latitude: request.latitude,
              longitude: request.longitude,
            },
          },
        });
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
