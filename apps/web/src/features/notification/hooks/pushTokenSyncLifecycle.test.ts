import { registerPushTokenSynchronizer, stopPushTokenSyncAndDrain } from './pushTokenSyncLifecycle';

describe('pushTokenSyncLifecycle', () => {
  it('한 동기화 작업이 실패해도 나머지 작업이 drain될 때까지 기다린다', async () => {
    const drainError = new Error('first drain failed');
    let finishSecondDrain: (() => void) | undefined;
    const unregisterFirst = registerPushTokenSynchronizer({
      stopAndDrain: jest.fn(async () => Promise.reject(drainError)),
    });
    const unregisterSecond = registerPushTokenSynchronizer({
      stopAndDrain: jest.fn(
        () =>
          new Promise<void>((resolve) => {
            finishSecondDrain = resolve;
          })
      ),
    });

    try {
      const drain = stopPushTokenSyncAndDrain();
      let isSettled = false;
      void drain.then(
        () => {
          isSettled = true;
        },
        () => {
          isSettled = true;
        }
      );

      await Promise.resolve();
      expect(isSettled).toBe(false);

      finishSecondDrain?.();
      await expect(drain).rejects.toBe(drainError);
      expect(isSettled).toBe(true);
    } finally {
      unregisterFirst();
      unregisterSecond();
    }
  });
});
