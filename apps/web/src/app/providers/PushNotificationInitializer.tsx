import { usePushTokenSync } from '@/features/notification/hooks/usePushTokenSync';
import { isNativeApp } from '@/shared/lib/bridge';
import { useAuthStore } from '@/shared/stores/authStore';

/** UI를 렌더링하지 않고 로그인된 네이티브 앱 사용자의 Push Token 동기화를 시작합니다. */
export default function PushNotificationInitializer() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  usePushTokenSync(isAuthenticated && isNativeApp());

  return null;
}
