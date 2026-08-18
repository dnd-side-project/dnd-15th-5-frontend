import { useNavigate } from 'react-router-dom';

import { useOpenReceiptCamera } from '@/features/record';
import { ChevronLeftIcon } from '@/shared/assets/icons';

/**
 * 영수증 촬영 진입점.
 *
 * 네이티브 카메라 화면을 여는 요청만 보내고, 촬영·인식·기록은 전부 앱 안에서 이어진다.
 * 이 페이지는 웹에서 촬영 결과를 받지 않는다.
 */
export default function ReceiptCameraPage() {
  const navigate = useNavigate();
  const { state, retry } = useOpenReceiptCamera();

  return (
    <main>
      {/* TODO: 공통 헤더 컴포넌트 나오면 교체 */}
      <button type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기" className="py-3">
        <ChevronLeftIcon className="size-6 text-neutral-700" aria-hidden="true" />
      </button>

      {state.status === 'error' && (
        <>
          <p>{state.message}</p>
          <button type="button" onClick={retry}>
            다시 시도
          </button>
        </>
      )}
    </main>
  );
}
