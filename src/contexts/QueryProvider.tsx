import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { PropsWithChildren } from "react";

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
 * - Devtools는 개발 환경(`import.meta.env.DEV`)에서만 렌더링됩니다.
 */
function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default QueryProvider;
