import { NATIVE_APP_ACTIVE_EVENT } from '@chapchap/shared/bridge';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';

import { isConsumptionRelatedQuery } from '@/shared/apis/isConsumptionRelatedQuery';
import { isNativeApp } from '@/shared/lib/bridge';
import { IS_DEVELOPMENT } from '@/shared/lib/env';

import type { PropsWithChildren } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type QueryProviderProps = PropsWithChildren;

/**
 * 앱 전역에서 서버 상태(TanStack Query)를 사용할 수 있도록 QueryClient를 제공하는 Provider입니다.
 *
 * - staleTime 1분, retry 1회, refetchOnWindowFocus off를 기본값으로 사용합니다. 개별 쿼리에서 필요 시 옵션을 덮어써 사용하세요.
 * - Query Devtools는 일반 브라우저의 개발 환경에서만 렌더링하고 앱 WebView에서는 숨깁니다.
 */
function QueryProvider({ children }: QueryProviderProps) {
  const shouldShowDevtools = IS_DEVELOPMENT && !isNativeApp();

  useEffect(() => {
    const handleNativeAppActive = () => {
      void queryClient.invalidateQueries({
        predicate: isConsumptionRelatedQuery,
      });
    };

    window.addEventListener(NATIVE_APP_ACTIVE_EVENT, handleNativeAppActive);

    return () => window.removeEventListener(NATIVE_APP_ACTIVE_EVENT, handleNativeAppActive);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {shouldShowDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default QueryProvider;
