import { useCallback, useEffect, useState } from 'react';

import { isNativeApp, requestToNative } from '@/shared/lib/bridge';

type OpenReceiptCameraState =
  { status: 'opening' } | { status: 'opened' } | { status: 'error'; message: string };

/**
 * 네이티브 카메라 화면을 여는 요청을 보낸다.
 *
 * 촬영·검토는 전부 앱 안에서 이어지므로, 이 훅은 카메라 화면이 열렸는지까지만 확인한다.
 * 마운트 시 자동으로 요청을 보내며, `retry`로 다시 시도할 수 있다.
 */
export const useOpenReceiptCamera = () => {
  const [state, setState] = useState<OpenReceiptCameraState>({ status: 'opening' });

  const retry = useCallback(() => {
    // NOTE: effect 안에서 setState를 곧바로 호출하지 않도록 마이크로태스크로 한 번 미룬다.
    Promise.resolve()
      .then(() => {
        setState({ status: 'opening' });

        if (!isNativeApp()) {
          throw new Error('앱에서만 영수증을 촬영할 수 있습니다');
        }

        return requestToNative('captureReceipt', {});
      })
      .then(() => setState({ status: 'opened' }))
      .catch((error) => {
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : '카메라를 열지 못했습니다',
        });
      });
  }, []);

  useEffect(() => {
    retry();
  }, [retry]);

  return { state, retry };
};
