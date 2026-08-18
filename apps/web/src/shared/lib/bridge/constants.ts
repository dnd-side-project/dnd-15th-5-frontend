import type { BridgeMessageType } from '@chapchap/shared/bridge';

/**
 * 네이티브 요청 종류별 응답 제한 시간(ms).
 *
 * 사용자 입력이 필요한 요청은 즉시 처리되는 요청보다 충분한 대기 시간을 둔다.
 * `BridgeMessageType`이 추가되면 대응하는 제한 시간도 반드시 정의해야 한다.
 */
export const BRIDGE_REQUEST_TIMEOUT_MS = {
  // NOTE: 현재 위치 조회는 실내나 GPS 신호가 약한 환경에서 지연될 수 있어 네이티브 응답을 최대 30초간 기다린다.
  getCurrentPosition: 30_000,
  ping: 10_000,
  // NOTE: 사진 보관함 권한을 처음 선택하는 시간을 포함한다.
  saveImage: 120_000,
  // NOTE: 카메라 화면을 여는 데까지만 기다리며, 촬영 자체는 기다리지 않는다.
  // 첫 실행에는 OS 카메라 권한 팝업에 사용자가 응답할 시간이 포함된다.
  captureReceipt: 30_000,
} as const satisfies Record<BridgeMessageType, number>;
