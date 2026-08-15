import * as Location from 'expo-location';

import type { BridgeResult } from '@chapchap/shared/bridge';

let pendingPositionRequest: Promise<BridgeResult<'getCurrentPosition'>> | null = null;

/**
 * 네이티브 위치 권한을 확인한 뒤 기기의 현재 좌표를 한 번 조회한다.
 *
 * 위치 서비스가 꺼져 있거나 권한이 거부된 상태는 좌표 조회 없이 각각의 상태로 반환한다.
 * 권한을 아직 선택하지 않았다면 네이티브 권한 팝업을 요청한다.
 * 위치를 계속 추적하지 않으므로 호출할 때마다 최신 좌표를 새로 요청한다.
 */
const requestCurrentPosition = async (): Promise<BridgeResult<'getCurrentPosition'>> => {
  const isLocationServicesEnabled = await Location.hasServicesEnabledAsync();

  if (!isLocationServicesEnabled) {
    return { status: 'servicesDisabled' };
  }

  let permission = await Location.getForegroundPermissionsAsync();

  if (permission.status === Location.PermissionStatus.UNDETERMINED) {
    permission = await Location.requestForegroundPermissionsAsync();
  }

  if (!permission.granted) {
    return { status: 'permissionDenied' };
  }

  const result = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    status: 'success',
    position: {
      lat: result.coords.latitude,
      lng: result.coords.longitude,
      // INFO: 일부 위치 제공자는 정확도를 주지 않으므로 반경을 표시하지 않는 0으로 정규화한다.
      accuracy: result.coords.accuracy ?? 0,
    },
  };
};

/**
 * 진행 중인 위치 요청이 있으면 같은 Promise를 반환해 네이티브 위치 조회가 겹치지 않게 한다.
 * 요청이 완료된 뒤 호출하면 최신 좌표를 다시 조회한다.
 */
export const getCurrentPosition = (): Promise<BridgeResult<'getCurrentPosition'>> => {
  if (pendingPositionRequest) {
    return pendingPositionRequest;
  }

  pendingPositionRequest = requestCurrentPosition().finally(() => {
    pendingPositionRequest = null;
  });

  return pendingPositionRequest;
};
