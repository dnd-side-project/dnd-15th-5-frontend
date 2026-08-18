import * as Location from 'expo-location';

import type { BridgeResult } from '@chapchap/shared/bridge';

const POSITION_REQUEST_SHARE_TIMEOUT_MS = 30_000;

type PendingPositionRequest = {
  id: number;
  promise: Promise<BridgeResult<'getCurrentPosition'>>;
  timeoutId: ReturnType<typeof setTimeout>;
};

let pendingPositionRequest: PendingPositionRequest | null = null;
let positionRequestId = 0;

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
 * 진행 중인 위치 요청은 최대 30초간 같은 Promise를 반환해 네이티브 조회가 겹치지 않게 한다.
 * 요청이 완료되거나 공유 시간이 만료된 뒤 호출하면 최신 좌표를 새로 조회한다.
 */
export const getCurrentPosition = (): Promise<BridgeResult<'getCurrentPosition'>> => {
  if (pendingPositionRequest) {
    return pendingPositionRequest.promise;
  }

  const requestId = ++positionRequestId;
  const promise = requestCurrentPosition().finally(() => {
    // NOTE: 만료된 이전 요청이 늦게 끝나도 새 요청의 pending 상태를 해제하지 않는다.
    if (pendingPositionRequest?.id === requestId) {
      clearTimeout(pendingPositionRequest.timeoutId);
      pendingPositionRequest = null;
    }
  });
  const timeoutId = setTimeout(() => {
    // 웹 브리지의 위치 요청 만료 시간과 맞춰, 재시도에서는 새 네이티브 조회를 시작한다.
    if (pendingPositionRequest?.id === requestId) {
      pendingPositionRequest = null;
    }
  }, POSITION_REQUEST_SHARE_TIMEOUT_MS);

  pendingPositionRequest = { id: requestId, promise, timeoutId };

  return promise;
};
