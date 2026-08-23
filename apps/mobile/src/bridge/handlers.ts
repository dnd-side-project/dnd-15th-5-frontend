import { Platform } from 'react-native';

import { clearRefreshToken, getRefreshToken, setRefreshToken } from '@/native/authTokenStorage';
import { getCurrentPosition } from '@/native/location';
import { openReceiptCamera } from '@/native/openReceiptCamera';
import { saveImageToLibrary } from '@/native/save-image';

import type { BridgeMessageMap, BridgeMessageType } from '@chapchap/shared/bridge';

type BridgeHandler<TType extends BridgeMessageType> = (
  payload: BridgeMessageMap[TType]['payload']
) => Promise<BridgeMessageMap[TType]['result']> | BridgeMessageMap[TType]['result'];

type BridgeHandlerMap = {
  [TType in BridgeMessageType]: BridgeHandler<TType>;
};

/**
 * 웹에서 온 요청을 처리하는 핸들러 모음.
 *
 * 새 요청 타입을 추가하면 `BridgeMessageMap`과 함께 여기에도 구현을 채워야 하며,
 * 빠뜨리면 타입 검사에서 걸린다.
 * 핸들러에서 던진 오류는 `createBridgeResponse`가 실패 응답으로 바꿔 웹에 전달한다.
 *
 */
export const BRIDGE_HANDLERS: BridgeHandlerMap = {
  getCurrentPosition: () => getCurrentPosition(),
  ping: () => ({ platform: Platform.OS, receivedAt: Date.now() }),
  saveImage: async ({ base64, fileName }) => {
    await saveImageToLibrary(base64, fileName);

    return { saved: true };
  },
  captureReceipt: () => openReceiptCamera(),
  getRefreshToken: async () => ({ refreshToken: await getRefreshToken() }),
  setRefreshToken: async ({ refreshToken }) => {
    await setRefreshToken(refreshToken);

    return { saved: true };
  },
  clearRefreshToken: async () => {
    await clearRefreshToken();

    return { cleared: true };
  },
};
