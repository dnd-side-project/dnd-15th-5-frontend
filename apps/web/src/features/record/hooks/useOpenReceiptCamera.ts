import { useCallback, useEffect, useRef, useState } from 'react';

import { isNativeApp, requestToNative } from '@/shared/lib/bridge';

type OpenReceiptCameraState =
  | { status: 'idle' }
  | { status: 'opening' }
  | { status: 'opened' }
  | { status: 'error'; message: string };

/**
 * 네이티브 카메라 화면을 여는 요청을 보낸다.
 *
 * 촬영·검토는 전부 앱 안에서 이어지므로, 이 훅은 카메라 화면이 열렸는지까지만 확인한다.
 * 기본적으로 마운트 시 요청하며, `autoOpen: false`이면 `retry`를 호출할 때만 연다.
 * 기록 폼에서는 화면 이동 없이 호출해 촬영을 취소하고 돌아와도 입력 내용을 유지한다.
 */
export const useOpenReceiptCamera = ({ autoOpen = true } = {}) => {
  const [state, setState] = useState<OpenReceiptCameraState>({
    status: autoOpen ? 'opening' : 'idle',
  });
  const mounted = useRef(false);
  const isOpening = useRef(false);

  const retry = useCallback(() => {
    if (isOpening.current) return;
    isOpening.current = true;
    // NOTE: effect 안에서 setState를 곧바로 호출하지 않도록 마이크로태스크로 한 번 미룬다.
    Promise.resolve()
      .then(() => {
        if (!mounted.current) return;
        setState({ status: 'opening' });

        if (!isNativeApp()) {
          throw new Error('앱에서만 영수증을 촬영할 수 있습니다');
        }

        return requestToNative('captureReceipt', {});
      })
      .then((result) => {
        if (mounted.current && result) setState({ status: 'opened' });
      })
      .catch((error) => {
        if (mounted.current) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : '카메라를 열지 못했습니다',
          });
        }
      })
      .finally(() => {
        isOpening.current = false;
      });
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (autoOpen) retry();
    return () => {
      mounted.current = false;
    };
  }, [autoOpen, retry]);

  return { state, retry };
};
