import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { BridgeResult } from '@chapchap/shared/bridge';

const DEFAULT_NOTIFICATION_CHANNEL_ID = 'default';
let pendingPushTokenRequest: Promise<BridgeResult<'getPushToken'>> | null = null;

class PushTokenConfigurationError extends Error {}

const getProjectId = () => {
  const configuredExtra = Constants.expoConfig?.extra as
    { eas?: { projectId?: unknown } } | undefined;
  // EAS 빌드 값이 없는 로컬 개발 환경에서는 app config의 projectId를 사용합니다.
  const projectId = Constants.easConfig?.projectId ?? configuredExtra?.eas?.projectId;

  if (typeof projectId !== 'string' || projectId.length === 0) {
    throw new PushTokenConfigurationError(
      '푸시 알림에 필요한 Expo 프로젝트 ID가 설정되지 않았습니다'
    );
  }

  return projectId;
};

const prepareAndroidNotificationChannel = async () => {
  if (Platform.OS !== 'android') return;

  // Android에서는 권한 요청 전에 채널을 만들어야 시스템 알림 설정이 정상 연결됩니다.
  await Notifications.setNotificationChannelAsync(DEFAULT_NOTIFICATION_CHANNEL_ID, {
    name: '일반 알림',
    description: '리포트 완료와 소비 기록 알림을 받습니다.',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });
};

const requestPushToken = async (): Promise<BridgeResult<'getPushToken'>> => {
  if (!Device.isDevice) return { status: 'unsupportedDevice' };

  try {
    await prepareAndroidNotificationChannel();

    const currentPermission = await Notifications.getPermissionsAsync();

    if (!currentPermission.granted && !currentPermission.canAskAgain) {
      return { status: 'permissionDenied' };
    }

    const permission = currentPermission.granted
      ? currentPermission
      : await Notifications.requestPermissionsAsync();

    if (!permission.granted) return { status: 'permissionDenied' };

    const pushToken = await Notifications.getExpoPushTokenAsync({ projectId: getProjectId() });

    return { status: 'success', pushToken: pushToken.data };
  } catch (error) {
    const errorCode =
      typeof error === 'object' && error !== null && 'code' in error
        ? String(error.code)
        : undefined;
    const message = error instanceof Error ? error.message : '푸시 토큰을 발급하지 못했습니다';

    if (error instanceof PushTokenConfigurationError) {
      return { status: 'error', reason: 'configuration', message };
    }

    if (errorCode === 'ERR_NOTIFICATIONS_NETWORK_ERROR') {
      return { status: 'error', reason: 'network', message };
    }

    if (errorCode === 'ERR_NOTIFICATIONS_SERVER_ERROR') {
      return { status: 'error', reason: 'server', message };
    }

    if (
      errorCode === 'ERR_NOTIFICATIONS_NO_EXPERIENCE_ID' ||
      errorCode === 'ERR_NOTIFICATIONS_NO_APPLICATION_ID'
    ) {
      return { status: 'error', reason: 'configuration', message };
    }

    return { status: 'error', reason: 'unknown', message };
  }
};

/** 알림 권한을 확인하고 플랫폼 공통 Expo Push Token을 반환합니다. */
export const getPushToken = () => {
  // 브릿지 요청이 겹쳐도 권한 팝업과 Expo 토큰 발급은 한 번만 수행합니다.
  if (!pendingPushTokenRequest) {
    pendingPushTokenRequest = requestPushToken().finally(() => {
      pendingPushTokenRequest = null;
    });
  }

  return pendingPushTokenRequest;
};
