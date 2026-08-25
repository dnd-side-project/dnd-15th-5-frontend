import { useNavigate, useSearchParams } from 'react-router-dom';

import { ReceiptMethodLink, RecordMethodLink } from '@/features/record';
import { createYearMonthPath, ROUTE_PATHS } from '@/shared/constants/routePaths';
import { YEAR_MONTH_SEARCH_PARAM } from '@/shared/constants/searchParams';
import { BackButton } from '@/shared/ui/back-button';

export default function RecordMethodPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const manualRecordSearchPath = createYearMonthPath(
    ROUTE_PATHS.recordShopSearch,
    searchParams.get(YEAR_MONTH_SEARCH_PARAM)
  );

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
          variant="secondary"
        />
      </div>
    </main>
  );
}
