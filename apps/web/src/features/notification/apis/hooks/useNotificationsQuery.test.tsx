import { renderHook } from '@testing-library/react';

import { useGetNotifications } from '@/features/notification/apis/queries';

import { useNotificationsQuery } from './useNotificationsQuery';

jest.mock('@/features/notification/apis/queries', () => ({
  useGetNotifications: jest.fn(),
}));

const mockedUseGetNotifications = jest.mocked(useGetNotifications);

describe('useNotificationsQuery', () => {
  it('폴링 없이 알림 20개를 조회하고 읽음 여부로 구분한다', () => {
    mockedUseGetNotifications.mockReturnValue({
      data: {
        data: [
          { id: 1, title: '새 알림', read: false },
          { id: 2, title: '이전 알림', read: true },
        ],
      },
    } as unknown as ReturnType<typeof useGetNotifications>);

    const { result } = renderHook(() => useNotificationsQuery());

    expect(mockedUseGetNotifications).toHaveBeenCalledWith(
      { size: 20 },
      {
        query: {
          refetchInterval: false,
          refetchOnReconnect: false,
          refetchOnWindowFocus: false,
        },
      }
    );
    expect(result.current.recentNotifications).toHaveLength(1);
    expect(result.current.previousNotifications).toHaveLength(1);
  });
});
