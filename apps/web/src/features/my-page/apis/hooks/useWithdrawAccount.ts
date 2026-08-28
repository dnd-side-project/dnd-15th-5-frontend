import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  redirectToAccountWithdrawal,
  requestAccountWithdrawal,
} from '@/features/my-page/apis/withdrawAccount';
import { clearAuthenticationTokens } from '@/shared/apis/authTokenLifecycle';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { useToast } from '@/shared/ui/toast';

const WITHDRAWAL_ERROR_MESSAGE = '회원탈퇴를 완료하지 못했습니다. 다시 시도해 주세요.';

/** 회원 탈퇴를 요청하고 제공자별 후속 인증 또는 로컬 인증 정보 정리를 처리합니다. */
export const useWithdrawAccount = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const withdraw = async () => {
    setIsLoading(true);

    try {
      const result = await requestAccountWithdrawal();

      if (result.type === 'reauthentication-required') {
        redirectToAccountWithdrawal(result.location);
        return;
      }

      await clearAuthenticationTokens();
      queryClient.clear();
      navigate(ROUTE_PATHS.login, { replace: true });
    } catch {
      showToast({ type: 'error', message: WITHDRAWAL_ERROR_MESSAGE });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, withdraw };
};
