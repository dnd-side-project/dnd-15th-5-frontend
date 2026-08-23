import { BRIDGE_MESSAGE_KIND } from './types';

import type { BridgeEvent, BridgeMessageType, BridgeRequest, BridgeResponse } from './types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const BRIDGE_MESSAGE_TYPES: BridgeMessageType[] = [
  'getCurrentPosition',
  'ping',
  'saveImage',
  'captureReceipt',
  'getRefreshToken',
  'setRefreshToken',
  'clearRefreshToken',
];

const isBridgeMessageType = (value: unknown): value is BridgeMessageType =>
  typeof value === 'string' && BRIDGE_MESSAGE_TYPES.some((type) => type === value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/**
 * 웹에서 온 값이 브릿지 요청인지 확인한다.
 *
 * 다른 런타임에서 문자열로 전달된 메시지라 신뢰할 수 없으므로 사용 전에 형태를 검사한다.
 * 요청 종류별 payload까지 확인해 네이티브 핸들러에는 검증된 값만 전달한다.
 */
export const isBridgeRequest = (value: unknown): value is BridgeRequest => {
  if (
    !isRecord(value) ||
    value.kind !== BRIDGE_MESSAGE_KIND.REQUEST ||
    typeof value.id !== 'string' ||
    !isBridgeMessageType(value.type) ||
    !isRecord(value.payload)
  ) {
    return false;
  }

  if (value.type === 'ping') {
    return isFiniteNumber(value.payload.sentAt);
  }

  if (value.type === 'saveImage') {
    return typeof value.payload.base64 === 'string' && typeof value.payload.fileName === 'string';
  }

  if (value.type === 'setRefreshToken') {
    return typeof value.payload.refreshToken === 'string' && value.payload.refreshToken.length > 0;
  }

  return true;
};

/**
 * 네이티브에서 온 값이 브릿지 응답인지 확인한다.
 *
 * 성공·실패 판별은 `ok`로 하며, 이 함수는 두 경우를 모두 통과시킨다.
 */
export const isBridgeResponse = (value: unknown): value is BridgeResponse => {
  if (
    !isRecord(value) ||
    value.kind !== BRIDGE_MESSAGE_KIND.RESPONSE ||
    typeof value.id !== 'string' ||
    !isBridgeMessageType(value.type) ||
    typeof value.ok !== 'boolean'
  ) {
    return false;
  }

  if (!value.ok) {
    return isRecord(value.error) && typeof value.error.message === 'string';
  }

  if (!isRecord(value.result)) {
    return false;
  }

  if (value.type === 'ping') {
    return typeof value.result.platform === 'string' && isFiniteNumber(value.result.receivedAt);
  }

  if (value.type === 'saveImage') {
    return value.result.saved === true;
  }

  if (value.type === 'captureReceipt') {
    return value.result.opened === true;
  }

  if (value.type === 'getRefreshToken') {
    return typeof value.result.refreshToken === 'string' || value.result.refreshToken === null;
  }

  if (value.type === 'setRefreshToken') {
    return value.result.saved === true;
  }

  if (value.type === 'clearRefreshToken') {
    return value.result.cleared === true;
  }

  if (value.result.status === 'permissionDenied' || value.result.status === 'servicesDisabled') {
    return true;
  }

  if (value.result.status !== 'success' || !isRecord(value.result.position)) {
    return false;
  }

  return (
    isFiniteNumber(value.result.position.lat) &&
    isFiniteNumber(value.result.position.lng) &&
    isFiniteNumber(value.result.position.accuracy)
  );
};

/** 웹에서 온 값이 네이티브에 상태 변화를 알리는 이벤트인지 확인한다. */
export const isBridgeEvent = (value: unknown): value is BridgeEvent => {
  if (!isRecord(value) || value.kind !== BRIDGE_MESSAGE_KIND.EVENT || !isRecord(value.payload)) {
    return false;
  }

  if (value.type === 'routeChanged') {
    return typeof value.payload.pathname === 'string';
  }

  if (value.type === 'receiptShopSearchCancelled') {
    return true;
  }

  if (value.type !== 'receiptShopSelected' || !isRecord(value.payload.shop)) {
    return false;
  }

  const { shop } = value.payload;

  return (
    typeof shop.id === 'string' &&
    typeof shop.name === 'string' &&
    typeof shop.address === 'string' &&
    (typeof shop.photoUrl === 'string' || shop.photoUrl === null)
  );
};

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
