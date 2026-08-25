import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { getCurrentStatus } from '@/features/report/apis/clients';

import { useCurrentReportQuery } from './useCurrentReportQuery';

import type { PropsWithChildren } from 'react';

jest.mock('@/features/report/apis/clients', () => ({
  getCurrentStatus: jest.fn(),
}));

const mockedGetCurrentStatus = jest.mocked(getCurrentStatus);

describe('useCurrentReportQuery', () => {
  beforeEach(() => {
    mockedGetCurrentStatus.mockReset();
  });

  it('최초 리포트 조회에 실패하면 화면 에러 상태를 반환한다', async () => {
    mockedGetCurrentStatus.mockRejectedValue(new Error('리포트 조회 실패'));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCurrentReportQuery(), { wrapper });

    await waitFor(() => expect(result.current.hasReportError).toBe(true));
    expect(result.current.data.monthlyRecordCount).toBe(0);
  });
});
