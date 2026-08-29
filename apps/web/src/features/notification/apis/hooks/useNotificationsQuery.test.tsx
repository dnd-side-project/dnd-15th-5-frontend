import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';

import { useGetNotifications } from '@/features/notification/apis/queries';
import { getHasUnreadQueryKey } from '@/features/notification/apis/queryKeys';

import { useNotificationsQuery } from './useNotificationsQuery';

import type { PropsWithChildren } from 'react';

jest.mock('@/features/notification/apis/queries', () => ({
  useGetNotifications: jest.fn(),
}));

const mockedUseGetNotifications = jest.mocked(useGetNotifications);

describe('useNotificationsQuery', () => {
  it('폴링 없이 알림 20개를 조회하고 읽음 여부로 구분한다', () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    mockedUseGetNotifications.mockReturnValue({
      data: {
        data: [
          { id: 1, title: '새 알림', read: false },
          { id: 2, title: '이전 알림', read: true },
        ],
      },
    } as unknown as ReturnType<typeof useGetNotifications>);

    const { result } = renderHook(() => useNotificationsQuery(), { wrapper });

    expect(mockedUseGetNotifications).toHaveBeenCalledWith(
      { size: 20 },
      {
        query: {
          staleTime: 0,
          refetchInterval: false,
          refetchOnMount: 'always',
          refetchOnReconnect: false,
          refetchOnWindowFocus: false,
        },
      }
    );
    expect(result.current.recentNotifications).toHaveLength(1);
    expect(result.current.previousNotifications).toHaveLength(1);
    expect(queryClient.getQueryData(getHasUnreadQueryKey())).toEqual({ data: false });
  });
});
