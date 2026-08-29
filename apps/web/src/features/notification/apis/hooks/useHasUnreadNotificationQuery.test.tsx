import { NATIVE_APP_ACTIVE_EVENT } from '@chapchap/shared/bridge';
import { act, renderHook } from '@testing-library/react';

import { useHasUnread } from '@/features/notification/apis/queries';

import { useHasUnreadNotificationQuery } from './useHasUnreadNotificationQuery';

jest.mock('@/features/notification/apis/queries', () => ({
  useHasUnread: jest.fn(),
}));

const mockedUseHasUnread = jest.mocked(useHasUnread);

describe('useHasUnreadNotificationQuery', () => {
  it('폴링 없이 안 읽은 알림 여부를 조회한다', () => {
    const refetch = jest.fn();
    mockedUseHasUnread.mockReturnValue({
      data: true,
      refetch,
    } as unknown as ReturnType<typeof useHasUnread>);

    const { result } = renderHook(() => useHasUnreadNotificationQuery());

    expect(mockedUseHasUnread).toHaveBeenCalledWith({
      query: {
        select: expect.any(Function),
        staleTime: 0,
        refetchInterval: false,
        refetchOnMount: 'always',
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
      },
    });
    expect(result.current.hasUnreadNotification).toBe(true);
  });

  it('네이티브 앱이 활성화되면 안 읽은 알림 여부를 다시 조회한다', () => {
    const refetch = jest.fn();
    mockedUseHasUnread.mockReturnValue({
      data: false,
      refetch,
    } as unknown as ReturnType<typeof useHasUnread>);

    renderHook(() => useHasUnreadNotificationQuery());

    act(() => window.dispatchEvent(new Event(NATIVE_APP_ACTIVE_EVENT)));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
