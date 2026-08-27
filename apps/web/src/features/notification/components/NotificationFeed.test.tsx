import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useNotificationsQuery } from '@/features/notification/apis/hooks/useNotificationsQuery';

import NotificationFeed from './NotificationFeed';

jest.mock('@/features/notification/apis/hooks/useNotificationsQuery', () => ({
  useNotificationsQuery: jest.fn(),
}));

const mockedUseNotificationsQuery = jest.mocked(useNotificationsQuery);
const refetch = jest.fn();

const createQueryResult = (overrides: Record<string, unknown> = {}) => ({
  isPending: false,
  isError: false,
  notifications: [],
  recentNotifications: [],
  previousNotifications: [],
  refetch,
  ...overrides,
});

describe('<NotificationFeed />', () => {
  beforeEach(() => {
    refetch.mockReset();
  });

  it('최근 알림과 이전 알림을 구분해 표시한다', () => {
    const recentNotification = {
      id: '1',
      title: '새 알림',
      description: '새 알림 내용',
      elapsedTime: '방금',
      isRead: false,
    };
    const previousNotification = {
      id: '2',
      title: '이전 알림',
      description: '이전 알림 내용',
      elapsedTime: '3일전',
      isRead: true,
    };
    mockedUseNotificationsQuery.mockReturnValue(
      createQueryResult({
        notifications: [recentNotification, previousNotification],
        recentNotifications: [recentNotification],
        previousNotifications: [previousNotification],
      }) as unknown as ReturnType<typeof useNotificationsQuery>
    );

    render(<NotificationFeed />);

    expect(screen.getByRole('list', { name: '최근 알림' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: '이전 알림 목록' })).toBeInTheDocument();
    expect(screen.getByText('30일 전 알림까지 확인할 수 있어요')).toBeInTheDocument();
  });

  it('조회 중에는 목록 스켈레톤을 표시한다', () => {
    mockedUseNotificationsQuery.mockReturnValue(
      createQueryResult({ isPending: true }) as unknown as ReturnType<typeof useNotificationsQuery>
    );

    render(<NotificationFeed />);

    expect(screen.getByRole('status', { name: '알림 불러오는 중' })).toBeInTheDocument();
  });

  it('조회 실패 후 다시 시도할 수 있다', async () => {
    const user = userEvent.setup();
    mockedUseNotificationsQuery.mockReturnValue(
      createQueryResult({ isError: true }) as unknown as ReturnType<typeof useNotificationsQuery>
    );

    render(<NotificationFeed />);
    await user.click(screen.getByRole('button', { name: '다시 시도하기' }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('알림이 없으면 빈 상태를 표시한다', () => {
    mockedUseNotificationsQuery.mockReturnValue(
      createQueryResult() as unknown as ReturnType<typeof useNotificationsQuery>
    );

    render(<NotificationFeed />);

    expect(screen.getByRole('heading', { name: '아직 도착한 알림이 없어요' })).toBeInTheDocument();
  });
});
