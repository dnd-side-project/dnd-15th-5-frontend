import { NATIVE_APP_ACTIVE_EVENT } from '@chapchap/shared/bridge';
import { act, renderHook } from '@testing-library/react';

import { createPushTokenSynchronizer } from './createPushTokenSynchronizer';
import { usePushTokenSync } from './usePushTokenSync';

jest.mock('./createPushTokenSynchronizer', () => ({ createPushTokenSynchronizer: jest.fn() }));

const mockCreatePushTokenSynchronizer = jest.mocked(createPushTokenSynchronizer);

describe('usePushTokenSync', () => {
  const sync = jest.fn(async () => undefined);
  const stopAndDrain = jest.fn(async () => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreatePushTokenSynchronizer.mockReturnValue({ stopAndDrain, sync });
  });

  it('활성화되면 즉시 동기화하고 app-active 때 다시 동기화한다', () => {
    const { unmount } = renderHook(() => usePushTokenSync(true));

    expect(sync).toHaveBeenCalledTimes(1);

    act(() => window.dispatchEvent(new Event(NATIVE_APP_ACTIVE_EVENT)));
    expect(sync).toHaveBeenCalledTimes(2);

    unmount();
    expect(stopAndDrain).toHaveBeenCalledTimes(1);
  });

  it('비활성화 상태에서는 synchronizer를 만들지 않는다', () => {
    renderHook(() => usePushTokenSync(false));

    expect(mockCreatePushTokenSynchronizer).not.toHaveBeenCalled();
  });
});
