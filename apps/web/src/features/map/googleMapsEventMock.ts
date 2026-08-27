type IdleCallback = () => void;

/**
 * `focusMapOnPosition`이 참조하는 `google.maps.event` 전역을 테스트 환경에 채운다.
 * `addListenerOnce`는 기본적으로 콜백을 등록 즉시 실행하며, 특정 테스트에서 idle 시점을 직접
 * 제어해야 하면 반환된 `addListenerOnce`에 `mockImplementationOnce`로 동작을 덮어쓴다.
 */
export const mockGoogleMapsIdleEvent = () => {
  const listenerHandle = { remove: jest.fn() };
  const addListenerOnce = jest.fn(
    (_target: unknown, _eventName: string, callback: IdleCallback) => {
      callback();
      return listenerHandle;
    }
  );
  const removeListener = jest.fn();

  (globalThis as { google?: unknown }).google = {
    maps: { event: { addListenerOnce, removeListener } },
  };

  return { addListenerOnce, removeListener, listenerHandle };
};
