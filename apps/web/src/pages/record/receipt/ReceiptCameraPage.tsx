import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useOpenReceiptCamera } from '@/features/record';
import { BackButton } from '@/shared/ui/back-button';
import { Button } from '@/shared/ui/button';

/**
 * 영수증 촬영 진입점.
 *
 * 네이티브 카메라 화면을 여는 요청만 보내고, 촬영·검토는 전부 앱 안에서 이어진다.
 * 이 페이지는 웹에서 촬영 결과를 받지 않는다.
 */
export default function ReceiptCameraPage() {
  const navigate = useNavigate();
  const { state, retry } = useOpenReceiptCamera();

  useEffect(() => {
    if (state.status === 'opened') {
      // 카메라 뒤에는 기록 방법 선택 화면이 남아 있도록 숨겨진 WebView만 이전 경로로 돌린다.
      navigate(-1);
    }
  }, [navigate, state.status]);

  return (
    <main className="flex min-h-full flex-col">
      <BackButton onClick={() => navigate(-1)} />

      {state.status === 'error' && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-body-01-regular text-neutral-600">{state.message}</p>
          <div className="mt-6 w-full max-w-80">
            <Button onClick={retry}>다시 시도</Button>
          </div>
        </div>
      )}
    </main>
  );
}
