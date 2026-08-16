import { BRIDGE_MESSAGE_KIND } from './types';

import type { BridgeEvent, BridgeRequest, BridgeResponse } from './types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * 웹에서 온 값이 브릿지 요청인지 확인한다.
 *
 * 다른 런타임에서 문자열로 전달된 메시지라 신뢰할 수 없으므로 사용 전에 형태를 검사한다.
 * 봉투(kind, id, type)만 확인하며 payload의 내용까지는 검증하지 않는다.
 */
export const isBridgeRequest = (value: unknown): value is BridgeRequest =>
  isRecord(value) &&
  value.kind === BRIDGE_MESSAGE_KIND.REQUEST &&
  typeof value.id === 'string' &&
  typeof value.type === 'string';

/**
 * 네이티브에서 온 값이 브릿지 응답인지 확인한다.
 *
 * 성공·실패 판별은 `ok`로 하며, 이 함수는 두 경우를 모두 통과시킨다.
 */
export const isBridgeResponse = (value: unknown): value is BridgeResponse =>
  isRecord(value) &&
  value.kind === BRIDGE_MESSAGE_KIND.RESPONSE &&
  typeof value.id === 'string' &&
  typeof value.type === 'string' &&
  typeof value.ok === 'boolean';

/** 웹에서 온 값이 네이티브에 상태 변화를 알리는 이벤트인지 확인한다. */
export const isBridgeEvent = (value: unknown): value is BridgeEvent =>
  isRecord(value) &&
  value.kind === BRIDGE_MESSAGE_KIND.EVENT &&
  value.type === 'routeChanged' &&
  isRecord(value.payload) &&
  typeof value.payload.pathname === 'string';

/**
 * JSON 문자열을 파싱한다. 파싱에 실패하면 `null`을 반환한다.
 */
export const parseBridgeMessage = (rawMessage: string): unknown => {
  try {
    return JSON.parse(rawMessage);
  } catch {
    return null;
  }
};
