import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';

import { useShopSearchQuery } from './useShopSearchQuery';

import type { PropsWithChildren } from 'react';

jest.mock('@vis.gl/react-google-maps', () => ({
  APILoadingStatus: {
    FAILED: 'FAILED',
    AUTH_FAILURE: 'AUTH_FAILURE',
  },
  useApiLoadingStatus: () => 'FAILED',
  useMapsLibrary: () => null,
}));

describe('useShopSearchQuery', () => {
  it('Google Maps API 로드에 실패하면 에러 상태를 반환하고 검색하지 않는다', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    function Wrapper({ children }: PropsWithChildren) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    const { result } = renderHook(() => useShopSearchQuery('카페'), { wrapper: Wrapper });

    expect(result.current.query.data).toBeUndefined();
    expect(result.current.query.fetchStatus).toBe('idle');
    expect(result.current.isLibraryLoading).toBe(false);
    expect(result.current.isLibraryError).toBe(true);
  });
});
