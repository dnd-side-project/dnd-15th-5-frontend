import { useNavigate } from 'react-router-dom';

import { SpendingHistory } from '@/features/report';
import { BackButton } from '@/shared/ui/back-button';

/** 뒤로 가기 버튼과 소비내역 화면을 조립하고 라우터 이동을 연결하는 페이지입니다. */
export default function SpendingHistoryPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-dvh flex-col pb-8">
      <BackButton onClick={() => navigate(-1)} />
      <SpendingHistory />
    </main>
  );
}
