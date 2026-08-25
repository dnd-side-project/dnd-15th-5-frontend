import { useNavigate, useSearchParams } from 'react-router-dom';

import { SpendingHistory } from '@/features/report';
import { BackButton } from '@/shared/ui/back-button';

/** 뒤로 가기 버튼과 소비내역 화면을 조립하고 라우터 이동을 연결하는 페이지입니다. */
export default function SpendingHistoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <main className="min-h-screen-safe-bottom flex flex-col pb-8">
      <SpendingHistory
        headerContent={<BackButton onClick={() => navigate(-1)} className="mt-3" />}
        initialDate={searchParams.get('date') ?? undefined}
      />
    </main>
  );
}
