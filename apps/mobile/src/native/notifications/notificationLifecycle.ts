import { resolveNotificationPath } from '@chapchap/shared/notification';
import * as Notifications from 'expo-notifications';

let lastHandledNotificationId: string | null = null;

// 앱이 foreground인 동안에도 배너와 소리가 표시되도록 전역 처리 정책을 등록합니다.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** 실행 중이거나 알림 탭으로 시작된 앱에서 안전한 앱 내부 경로 이동을 요청합니다. */
export const subscribeNotificationResponses = (onNotificationOpen: (path: string) => void) => {
  const handleResponse = (response: Notifications.NotificationResponse) => {
    const notificationId = response.notification.request.identifier;

    // 시작 알림 조회와 실시간 리스너가 같은 응답을 전달하는 경우 한 번만 이동합니다.
    if (lastHandledNotificationId === notificationId) return;

    lastHandledNotificationId = notificationId;
    onNotificationOpen(resolveNotificationPath(response.notification.request.content.data?.url));
    // 화면 이동은 성공시킨 채 네이티브 정리 실패는 서로 독립적으로 무시합니다.
    void Promise.allSettled([
      Notifications.setBadgeCountAsync(0),
      Notifications.clearLastNotificationResponseAsync(),
    ]);
  };

  const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);

  void Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      if (response) handleResponse(response);
    })
    .catch(() => undefined);

  return () => subscription.remove();
};

/** 읽음 화면 진입 시 앱 아이콘 배지를 best-effort로 제거합니다. */
export const clearNotificationBadge = async () => {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch {
    // 배지 제거 실패가 알림 화면 진입을 막지 않도록 무시합니다.
  }
};

/** 로그아웃한 계정의 알림 센터와 배지를 best-effort로 정리합니다. */
export const clearPushNotifications = async () => {
  await Promise.allSettled([
    Notifications.dismissAllNotificationsAsync(),
    Notifications.setBadgeCountAsync(0),
  ]);
};
