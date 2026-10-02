import * as Notifications from 'expo-notifications';

import {
  clearNotificationBadge,
  clearPushNotifications,
  subscribeNotificationResponses,
} from './notificationLifecycle';

jest.mock('expo-notifications', () => ({
  addNotificationResponseReceivedListener: jest.fn(),
  clearLastNotificationResponseAsync: jest.fn(),
  dismissAllNotificationsAsync: jest.fn(),
  getLastNotificationResponseAsync: jest.fn(),
  setBadgeCountAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
}));

const mockAddResponseListener = jest.mocked(Notifications.addNotificationResponseReceivedListener);
const mockGetLastResponse = jest.mocked(Notifications.getLastNotificationResponseAsync);

const createResponse = (identifier: string, url?: unknown) =>
  ({
    notification: { request: { identifier, content: { data: url === undefined ? {} : { url } } } },
  }) as Notifications.NotificationResponse;

describe('notificationLifecycle', () => {
  const removeListener = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockAddResponseListener.mockReturnValue({ remove: removeListener });
    mockGetLastResponse.mockResolvedValue(null);
    jest.mocked(Notifications.setBadgeCountAsync).mockResolvedValue(true);
    jest.mocked(Notifications.clearLastNotificationResponseAsync).mockResolvedValue(undefined);
    jest.mocked(Notifications.dismissAllNotificationsAsync).mockResolvedValue(undefined);
  });

  it('알림 payload의 안전한 상세 경로를 한 번 전달하고 구독을 해제한다', async () => {
    const onNotificationOpen = jest.fn();
    const response = createResponse(
      'notification-detail',
      '/report/monthly-report?yearMonth=2026-09'
    );
    mockGetLastResponse.mockResolvedValue(response);

    const unsubscribe = subscribeNotificationResponses(onNotificationOpen);
    await Promise.resolve();
    mockAddResponseListener.mock.calls[0]?.[0](response);

    expect(onNotificationOpen).toHaveBeenCalledWith('/report/monthly-report?yearMonth=2026-09');
    expect(onNotificationOpen).toHaveBeenCalledTimes(1);
    expect(Notifications.clearLastNotificationResponseAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(0);

    unsubscribe();
    expect(removeListener).toHaveBeenCalledTimes(1);
  });

  it('네이티브 정리 API가 실패해도 배지와 알림 센터 정리를 완료한다', async () => {
    jest.mocked(Notifications.setBadgeCountAsync).mockRejectedValue(new Error('badge failed'));
    jest
      .mocked(Notifications.dismissAllNotificationsAsync)
      .mockRejectedValue(new Error('dismiss failed'));

    await expect(clearNotificationBadge()).resolves.toBeUndefined();
    await expect(clearPushNotifications()).resolves.toBeUndefined();

    expect(Notifications.dismissAllNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(0);
  });
});
