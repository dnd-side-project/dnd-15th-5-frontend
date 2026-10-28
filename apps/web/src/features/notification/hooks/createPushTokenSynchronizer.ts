import type { BridgeResult } from '@chapchap/shared/bridge';

const DEFAULT_RETRY_DELAYS_MS = [500, 1000] as const;

type PushTokenSyncDependencies = {
  captureException: (error: unknown) => void;
  registerDeviceToken: (pushToken: string) => Promise<unknown>;
  requestPushToken: () => Promise<BridgeResult<'getPushToken'>>;
  retryDelaysMs?: readonly number[];
  waitForRetry?: (delayMs: number, signal: AbortSignal) => Promise<void>;
};

const waitForRetry = (delayMs: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }

    const timeoutId = window.setTimeout(resolve, delayMs);
    // 로그아웃이나 unmount 시 남은 대기 시간을 즉시 끝내 후속 요청을 막습니다.
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeoutId);
        resolve();
      },
      { once: true }
    );
  });

/** Expo Push Token 조회와 서버 등록의 중복 방지·재시도 상태를 관리합니다. */
export const createPushTokenSynchronizer = ({
  captureException,
  registerDeviceToken,
  requestPushToken,
  retryDelaysMs = DEFAULT_RETRY_DELAYS_MS,
  waitForRetry: wait = waitForRetry,
}: PushTokenSyncDependencies) => {
  let isActive = true;
  // 동시에 들어온 초기화·app-active 요청은 하나의 작업을 공유합니다.
  let pendingSync: Promise<void> | null = null;
  // 서버 등록까지 성공한 토큰만 기억해 실패 후 재시도를 차단하지 않습니다.
  let lastRegisteredPushToken: string | null = null;
  let retryController: AbortController | null = null;

  const syncOnce = async () => {
    if (!isActive) return;

    const result = await requestPushToken();

    if (
      !isActive ||
      result.status === 'permissionDenied' ||
      result.status === 'unsupportedDevice'
    ) {
      return;
    }

    if (result.status === 'error') {
      const error = new Error(`푸시 토큰 발급 실패(${result.reason}): ${result.message}`);

      // 일시적인 네트워크·서버 오류만 바깥 반복문으로 전달합니다.
      if (result.reason === 'network' || result.reason === 'server') throw error;

      captureException(error);
      return;
    }

    if (lastRegisteredPushToken === result.pushToken) return;

    await registerDeviceToken(result.pushToken);

    if (isActive) lastRegisteredPushToken = result.pushToken;
  };

  const sync = () => {
    if (!isActive) return Promise.resolve();
    if (pendingSync) return pendingSync;

    pendingSync = (async () => {
      let lastError: unknown;

      for (let attempt = 0; attempt <= retryDelaysMs.length; attempt += 1) {
        try {
          await syncOnce();
          return;
        } catch (error) {
          lastError = error;

          if (!isActive || attempt === retryDelaysMs.length) break;

          retryController = new AbortController();
          await wait(retryDelaysMs[attempt], retryController.signal);
          retryController = null;
        }
      }

      if (isActive && lastError) captureException(lastError);
    })().finally(() => {
      pendingSync = null;
    });

    return pendingSync;
  };

  const stopAndDrain = () => {
    // 이미 시작된 요청은 취소하지 않고, 끝날 때까지 기다려 로그아웃 요청과 순서를 보장합니다.
    isActive = false;
    retryController?.abort();
    retryController = null;

    return pendingSync ?? Promise.resolve();
  };

  return { stopAndDrain, sync };
};
