import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { ReceiptMethodLink, RecordMethodLink } from '@/features/record';
import { createYearMonthPath, ROUTE_PATHS } from '@/shared/constants/routePaths';
import { YEAR_MONTH_SEARCH_PARAM } from '@/shared/constants/searchParams';
import type { RecordLocationState } from '@/shared/types/recordNavigation';
import { BackButton } from '@/shared/ui/back-button';
import {
  getRecordCategoryFromLocationState,
  getRecordShopFromLocationState,
} from '@/shared/utils/recordNavigation';

export default function RecordMethodPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const selectedShop = getRecordShopFromLocationState(location.state);
  const selectedCategory = getRecordCategoryFromLocationState(location.state);
  const manualRecordSearchPath = createYearMonthPath(
    selectedShop ? ROUTE_PATHS.manualRecord : ROUTE_PATHS.recordShopSearch,
    searchParams.get(YEAR_MONTH_SEARCH_PARAM)
  );
  const manualRecordState = selectedShop
    ? ({ shop: selectedShop, category: selectedCategory } satisfies RecordLocationState)
    : undefined;

  return (
    <main className="flex min-h-full flex-col">
      <BackButton onClick={() => navigate(-1)} />

      <h1 className="mt-8.5 text-heading-01-bold text-neutral-700">
        소비 기록 방법을 <br />
        선택해주세요
      </h1>

      <div className="mt-10 flex flex-col gap-4">
        <ReceiptMethodLink to={ROUTE_PATHS.receiptCamera} />
        <RecordMethodLink
          title="직접 작성"
          description="영수증이 없다면 직접 기록해요"
          to={manualRecordSearchPath}
          state={manualRecordState}
          variant="secondary"
        />
      </div>
    </main>
  );
}
