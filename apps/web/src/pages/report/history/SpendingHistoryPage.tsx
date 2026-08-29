import { useLocation, useNavigate } from 'react-router-dom';

import { SpendingHistory } from '@/features/report';
import { BackButton } from '@/shared/ui/back-button';

/** 뒤로 가기 버튼과 소비내역 화면을 조립하고 라우터 이동을 연결하는 페이지입니다. */
export default function SpendingHistoryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollToDate =
    location.state &&
    typeof location.state === 'object' &&
    'scrollToDate' in location.state &&
    typeof location.state.scrollToDate === 'string'
      ? location.state.scrollToDate
      : undefined;

  return (
    <main className="min-h-screen-safe-bottom flex flex-col">
      <SpendingHistory
        headerContent={<BackButton onClick={() => navigate(-1)} className="mt-3" />}
        scrollToDate={scrollToDate}
      />
    </main>
  );
}
