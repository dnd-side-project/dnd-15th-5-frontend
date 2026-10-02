import { createPushTokenSynchronizer } from './createPushTokenSynchronizer';

import type { BridgeResult } from '@chapchap/shared/bridge';

const createDependencies = () => {
  const captureException: jest.MockedFunction<(error: unknown) => void> = jest.fn();
  const registerDeviceToken: jest.MockedFunction<(pushToken: string) => Promise<unknown>> = jest.fn(
    async (_pushToken: string): Promise<unknown> => undefined
  );
  const requestPushToken: jest.MockedFunction<() => Promise<BridgeResult<'getPushToken'>>> =
    jest.fn(async () => ({
      status: 'success' as const,
      pushToken: 'ExponentPushToken[test-token]',
    }));
  const waitForRetry: jest.MockedFunction<(delayMs: number, signal: AbortSignal) => Promise<void>> =
    jest.fn(async (_delayMs: number, _signal: AbortSignal) => undefined);

  return {
    captureException,
    registerDeviceToken,
    requestPushToken,
    retryDelaysMs: [500, 1000] as const,
    waitForRetry,
  };
};

describe('createPushTokenSynchronizer', () => {
  it('성공한 같은 토큰은 세션 동안 중복 등록하지 않고 변경된 토큰은 등록한다', async () => {
    const dependencies = createDependencies();
    const synchronizer = createPushTokenSynchronizer(dependencies);

    await synchronizer.sync();
    await synchronizer.sync();
    dependencies.requestPushToken.mockResolvedValue({
      status: 'success',
      pushToken: 'ExponentPushToken[rotated-token]',
    });
    await synchronizer.sync();

    expect(dependencies.registerDeviceToken).toHaveBeenNthCalledWith(
      1,
      'ExponentPushToken[test-token]'
    );
    expect(dependencies.registerDeviceToken).toHaveBeenNthCalledWith(
      2,
      'ExponentPushToken[rotated-token]'
    );
  });

  it('등록이 일시적으로 실패하면 지수 백오프 간격으로 두 번 재시도한다', async () => {
    const dependencies = createDependencies();
    dependencies.registerDeviceToken
      .mockRejectedValueOnce(new Error('temporary-1'))
      .mockRejectedValueOnce(new Error('temporary-2'))
      .mockResolvedValueOnce(undefined);
    const synchronizer = createPushTokenSynchronizer(dependencies);

    await synchronizer.sync();

    expect(dependencies.registerDeviceToken).toHaveBeenCalledTimes(3);
    expect(dependencies.waitForRetry.mock.calls.map(([delayMs]) => delayMs)).toEqual([500, 1000]);
    expect(dependencies.captureException).not.toHaveBeenCalled();
  });

  it('재시도 가능한 토큰 발급 오류는 다시 요청한다', async () => {
    const dependencies = createDependencies();
    dependencies.requestPushToken
      .mockResolvedValueOnce({
        status: 'error',
        reason: 'server',
        message: 'expo server failed',
      })
      .mockResolvedValueOnce({
        status: 'success',
        pushToken: 'ExponentPushToken[test-token]',
      });
    const synchronizer = createPushTokenSynchronizer(dependencies);

    await synchronizer.sync();

    expect(dependencies.requestPushToken).toHaveBeenCalledTimes(2);
    expect(dependencies.registerDeviceToken).toHaveBeenCalledTimes(1);
  });

  it('재시도 불가능한 오류는 즉시 기록한다', async () => {
    const dependencies = createDependencies();
    dependencies.requestPushToken.mockResolvedValue({
      status: 'error',
      reason: 'configuration',
      message: 'missing project id',
    });
    const synchronizer = createPushTokenSynchronizer(dependencies);

    await synchronizer.sync();

    expect(dependencies.requestPushToken).toHaveBeenCalledTimes(1);
    expect(dependencies.registerDeviceToken).not.toHaveBeenCalled();
    expect(dependencies.captureException).toHaveBeenCalledTimes(1);
  });

  it('최종 실패를 기록하고 다음 동기화 요청에서 다시 등록한다', async () => {
    const dependencies = createDependencies();
    dependencies.registerDeviceToken
      .mockRejectedValueOnce(new Error('temporary-1'))
      .mockRejectedValueOnce(new Error('temporary-2'))
      .mockRejectedValueOnce(new Error('temporary-3'))
      .mockResolvedValueOnce(undefined);
    const synchronizer = createPushTokenSynchronizer(dependencies);

    await synchronizer.sync();
    expect(dependencies.captureException).toHaveBeenCalledTimes(1);

    await synchronizer.sync();
    expect(dependencies.registerDeviceToken).toHaveBeenCalledTimes(4);
  });

  it('재시도 대기 중 해제되면 네이티브 토큰을 다시 요청하지 않는다', async () => {
    const dependencies = createDependencies();
    let releaseRetry: (() => void) | undefined;
    dependencies.registerDeviceToken.mockRejectedValueOnce(new Error('temporary'));
    dependencies.waitForRetry.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          releaseRetry = resolve;
        })
    );
    const synchronizer = createPushTokenSynchronizer(dependencies);

    const pendingSync = synchronizer.sync();
    await Promise.resolve();
    await Promise.resolve();
    void synchronizer.stopAndDrain();
    releaseRetry?.();
    await pendingSync;

    expect(dependencies.requestPushToken).toHaveBeenCalledTimes(1);
  });

  it('등록 요청이 진행 중이면 stopAndDrain은 요청 완료까지 기다린다', async () => {
    const dependencies = createDependencies();
    let finishRegistration: (() => void) | undefined;
    dependencies.registerDeviceToken.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishRegistration = resolve;
        })
    );
    const synchronizer = createPushTokenSynchronizer(dependencies);

    const pendingSync = synchronizer.sync();
    await Promise.resolve();
    const drained = synchronizer.stopAndDrain();
    let isDrained = false;
    void drained.then(() => {
      isDrained = true;
    });

    expect(isDrained).toBe(false);
    finishRegistration?.();
    await Promise.all([pendingSync, drained]);

    expect(isDrained).toBe(true);
    expect(dependencies.requestPushToken).toHaveBeenCalledTimes(1);
  });
});
