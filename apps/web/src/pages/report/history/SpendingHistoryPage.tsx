import { useLocation, useNavigate } from 'react-router-dom';

import ConsumptionRecordActions from '@/features/record/components/ConsumptionRecordActions';
import { SpendingHistory } from '@/features/report';
import { BackButton } from '@/shared/ui/back-button';
import { getConsumptionScrollDate } from '@/shared/utils/consumptionNavigation';

/** 뒤로 가기 버튼과 소비내역 화면을 조립하고 라우터 이동을 연결하는 페이지입니다. */
export default function SpendingHistoryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollToDate = getConsumptionScrollDate(location.state);

  return (
    <ConsumptionRecordActions>
      {(actions) => (
        <main className="mobile-frame pb-safe-bottom fixed inset-0 flex flex-col overflow-hidden bg-neutral-00 px-4">
          <SpendingHistory
            {...actions}
            containedScroll
            headerContent={<BackButton onClick={() => navigate(-1)} className="mt-3" />}
            scrollToDate={scrollToDate}
          />
        </main>
      )}
    </ConsumptionRecordActions>
  );
}
