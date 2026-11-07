import { useQueryClient } from '@tanstack/react-query';

import { useUpdateMyProfile } from '@/features/my-page/apis/mutations';
import { getGetMyAccountQueryKey } from '@/features/my-page/apis/queryKeys';

/** 프로필 수정 성공 결과로 내 계정 캐시를 갱신하는 mutation 훅입니다. */
export const useUpdateMyProfileMutation = () => {
  const queryClient = useQueryClient();
  const queryKey = getGetMyAccountQueryKey();

  return useUpdateMyProfile({
    mutation: {
      onSuccess: async (response) => {
        if (response.data) {
          queryClient.setQueryData(queryKey, response);
          return;
        }

        await queryClient.invalidateQueries({ queryKey });
      },
    },
  });
};
