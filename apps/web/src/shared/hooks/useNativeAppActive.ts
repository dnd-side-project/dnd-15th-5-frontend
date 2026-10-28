import { NATIVE_APP_ACTIVE_EVENT } from '@chapchap/shared/bridge';
import { useEffect, useRef } from 'react';

/** 네이티브 앱이 활성 상태로 돌아올 때 최신 콜백을 실행합니다. */
export const useNativeAppActive = (callback: () => void, isEnabled = true) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isEnabled) return;

    const handleNativeAppActive = () => callbackRef.current();
    window.addEventListener(NATIVE_APP_ACTIVE_EVENT, handleNativeAppActive);

    return () => window.removeEventListener(NATIVE_APP_ACTIVE_EVENT, handleNativeAppActive);
  }, [isEnabled]);
};
