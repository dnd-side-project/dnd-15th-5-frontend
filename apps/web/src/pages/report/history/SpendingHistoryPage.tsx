import { useNavigate } from 'react-router-dom';

import { SpendingHistory } from '@/features/report';

/** 소비내역 화면을 렌더링하고 라우터의 뒤로 가기 동작을 연결하는 페이지입니다. */
export default function SpendingHistoryPage() {
  const navigate = useNavigate();

  return <SpendingHistory onBack={() => navigate(-1)} />;
}
