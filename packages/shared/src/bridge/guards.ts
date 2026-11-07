import { BRIDGE_MESSAGE_KIND, MAX_STICKER_IMAGE_BASE64_LENGTH } from './types';

import type {
  BridgeEvent,
  BridgeMessageType,
  BridgeRequest,
  BridgeResponse,
  ReceiptScanData,
} from './types';
import type { ShopSearchResult } from '../shop/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const BRIDGE_MESSAGE_TYPES: BridgeMessageType[] = [
  'prepareStickerBackground',
  'removeStickerBackground',
  'cancelStickerBackground',
  'startSocialLogin',
  'getCurrentPosition',
  'ping',
  'saveImage',
  'captureReceipt',
  'scanReceipt',
  'captureStickerPhoto',
  'getRefreshToken',
  'saveRefreshToken',
  'clearRefreshToken',
  'getPushToken',
];

const isBridgeMessageType = (value: unknown): value is BridgeMessageType =>
  typeof value === 'string' && BRIDGE_MESSAGE_TYPES.some((type) => type === value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isStickerRequestId = (value: unknown) =>
  typeof value === 'string' && value.length > 0 && value.length <= 100;
const isStickerBase64 = (value: unknown) =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= MAX_STICKER_IMAGE_BASE64_LENGTH &&
  value.length % 4 === 0 &&
  /^[A-Za-z0-9+/]+={0,2}$/.test(value);
const isStickerBackend = (value: unknown) => value === 'coreml' || value === 'cpu';

const isReceiptShop = (shop: unknown): shop is ShopSearchResult =>
  isRecord(shop) &&
  typeof shop.id === 'string' &&
  typeof shop.name === 'string' &&
  typeof shop.address === 'string' &&
  isFiniteNumber(shop.latitude) &&
  Math.abs(shop.latitude) <= 90 &&
  isFiniteNumber(shop.longitude) &&
  Math.abs(shop.longitude) <= 180 &&
  (shop.photoUrl === null || typeof shop.photoUrl === 'string');

const isReceiptScanData = (receipt: unknown): receipt is ReceiptScanData =>
  isRecord(receipt) &&
  typeof receipt.receiptImageId === 'number' &&
  Number.isInteger(receipt.receiptImageId) &&
  receipt.receiptImageId > 0 &&
  (receipt.purchaseDate === null || typeof receipt.purchaseDate === 'string') &&
  (receipt.purchaseTime === null || typeof receipt.purchaseTime === 'string') &&
  (receipt.amount === null || (isFiniteNumber(receipt.amount) && receipt.amount >= 0)) &&
  (receipt.shop === null || isReceiptShop(receipt.shop));

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

  if (value.type === 'removeStickerBackground') {
    return (
      isStickerRequestId(value.payload.requestId) &&
      value.payload.mimeType === 'image/png' &&
      isStickerBase64(value.payload.base64)
    );
  }
  if (value.type === 'cancelStickerBackground') return isStickerRequestId(value.payload.requestId);

  if (value.type === 'saveImage') {
    return typeof value.payload.base64 === 'string' && typeof value.payload.fileName === 'string';
  }

  if (value.type === 'startSocialLogin') {
    return (
      (value.payload.provider === 'kakao' || value.payload.provider === 'google') &&
      typeof value.payload.codeChallenge === 'string' &&
      /^[A-Za-z0-9_-]{43}$/u.test(value.payload.codeChallenge)
    );
  }

  if (value.type === 'saveRefreshToken') {
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
    return (
      typeof value.result.platform === 'string' &&
      isFiniteNumber(value.result.receivedAt) &&
      (value.result.nativeStickerBackground === undefined ||
        typeof value.result.nativeStickerBackground === 'boolean')
    );
  }

  if (value.type === 'prepareStickerBackground') {
    return value.result.ready === true && isStickerBackend(value.result.backend);
  }
  if (value.type === 'cancelStickerBackground') return value.result.cancelled === true;
  if (value.type === 'removeStickerBackground') {
    return (
      value.result.mimeType === 'image/png' &&
      isStickerBase64(value.result.base64) &&
      isStickerBackend(value.result.backend) &&
      isFiniteNumber(value.result.elapsedMs) &&
      value.result.elapsedMs >= 0
    );
  }

  if (value.type === 'saveImage') {
    return value.result.saved === true;
  }

  if (value.type === 'captureStickerPhoto') {
    if (value.result.status === 'cancelled' || value.result.status === 'permissionDenied')
      return true;
    return (
      value.result.status === 'success' &&
      value.result.mimeType === 'image/jpeg' &&
      typeof value.result.base64 === 'string' &&
      value.result.base64.length > 0 &&
      value.result.base64.length <= 4 * 1024 * 1024 &&
      /^[A-Za-z0-9+/]+={0,2}$/.test(value.result.base64)
    );
  }

  if (value.type === 'captureReceipt') {
    return value.result.opened === true;
  }

  if (value.type === 'scanReceipt') {
    if (value.result.status === 'cancelled' || value.result.status === 'permissionDenied')
      return true;
    return value.result.status === 'success' && isReceiptScanData(value.result.receipt);
  }

  if (value.type === 'startSocialLogin') {
    if (value.result.status === 'cancelled') {
      return true;
    }

    if (value.result.status === 'success') {
      return typeof value.result.loginCode === 'string' && value.result.loginCode.length > 0;
    }

    return value.result.status === 'error' && typeof value.result.error === 'string';
  }

  if (value.type === 'getRefreshToken') {
    return typeof value.result.refreshToken === 'string' || value.result.refreshToken === null;
  }

  if (value.type === 'saveRefreshToken') {
    return value.result.saved === true;
  }

  if (value.type === 'clearRefreshToken') {
    return value.result.cleared === true;
  }

  if (value.type === 'getPushToken') {
    if (value.result.status === 'permissionDenied' || value.result.status === 'unsupportedDevice') {
      return true;
    }

    if (value.result.status === 'error') {
      return (
        typeof value.result.reason === 'string' &&
        ['network', 'server', 'configuration', 'unknown'].includes(value.result.reason) &&
        typeof value.result.message === 'string' &&
        value.result.message.length > 0
      );
    }

    return (
      value.result.status === 'success' &&
      typeof value.result.pushToken === 'string' &&
      value.result.pushToken.length > 0
    );
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

  if (
    value.type === 'analyticsReady' ||
    value.type === 'receiptShopSearchCancelled' ||
    value.type === 'receiptRecordCloseRequested'
  ) {
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
