import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { useGetMyAccount } from '@/features/my-page';
import { getGetMyAccountQueryKey } from '@/features/my-page/apis/queryKeys';
import { identifyAnalyticsUser, resetAnalyticsUser } from '@/shared/lib/analytics/mixpanel';
import { useAuthStore } from '@/shared/stores/authStore';

/** 인증된 계정을 Mixpanel 사용자와 연결하고 계정이 바뀔 때 식별 상태를 정리합니다. */
export default function AnalyticsIdentity() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const lastIdentityRef = useRef<string | null>(null);
  const wasAuthenticatedRef = useRef(isAuthenticated);
  const accountQuery = useGetMyAccount({
    query: { enabled: isAuthenticated },
  });
  const userId = accountQuery.data?.data?.userId;

  useEffect(() => {
    const wasAuthenticated = wasAuthenticatedRef.current;
    wasAuthenticatedRef.current = isAuthenticated;

    if (!isAuthenticated) {
      if (wasAuthenticated) {
        resetAnalyticsUser();
      }

      lastIdentityRef.current = null;
      queryClient.removeQueries({ queryKey: getGetMyAccountQueryKey() });
      return;
    }

    if (accountQuery.isFetching || userId === undefined) return;

    const identity = String(userId);
    if (lastIdentityRef.current === identity) return;

    identifyAnalyticsUser(userId);
    lastIdentityRef.current = identity;
  }, [accountQuery.isFetching, isAuthenticated, queryClient, userId]);

  return null;
}
