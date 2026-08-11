import type { BridgeMessageType } from '@chapchap/shared/bridge';

/**
 * 네이티브 요청 종류별 응답 제한 시간(ms).
 *
 * 사용자 입력이 필요한 요청은 즉시 처리되는 요청보다 충분한 대기 시간을 둔다.
 * `BridgeMessageType`이 추가되면 대응하는 제한 시간도 반드시 정의해야 한다.
 */
export const BRIDGE_REQUEST_TIMEOUT_MS = {
  ping: 10_000,
  // NOTE: 사진 보관함 권한을 처음 선택하는 시간을 포함한다.
  saveImage: 120_000,
} as const satisfies Record<BridgeMessageType, number>;
