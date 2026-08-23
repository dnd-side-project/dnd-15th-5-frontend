import { useState } from 'react';

import { AuthFlowError } from '@/features/auth/errors';
import { startSocialLogin } from '@/features/auth/utils/startSocialLogin';
import { useToast } from '@/shared/ui/toast';

/** 카카오 OAuth 로그인을 시작하고 이동 실패 상태를 관리합니다. */
export const useKakaoLogin = () => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    setIsLoading(true);

    try {
      await startSocialLogin('kakao');
    } catch (error) {
      setIsLoading(false);
      showToast({
        type: 'error',
        message:
          error instanceof AuthFlowError
            ? error.message
            : '카카오 로그인을 시작하지 못했습니다. 다시 시도해 주세요.',
      });
    }
  };

  return { login, isLoading };
};
