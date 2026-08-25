import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { createInitialVisitDateTimeForMonth, ManualRecordForm } from '@/features/record';
import type { ShopSearchResult } from '@/features/shop';
import { createYearMonthPath, ROUTE_PATHS } from '@/shared/constants/routePaths';
import { YEAR_MONTH_SEARCH_PARAM } from '@/shared/constants/searchParams';
import { isValidYearMonth } from '@/shared/utils/yearMonth';

import type { VisitDateTimeValue } from '@chapchap/shared/record';

type ManualRecordLocationState = {
  isShopChange?: boolean;
  shop?: ShopSearchResult;
  visitDateTime?: VisitDateTimeValue;
};

export default function ManualRecordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isShopChange, shop, visitDateTime } =
    (location.state as ManualRecordLocationState | null) ?? {};
  const yearMonth = searchParams.get(YEAR_MONTH_SEARCH_PARAM);
  const hasRequestedYearMonth = isValidYearMonth(yearMonth);
  const shopSearchPath = createYearMonthPath(ROUTE_PATHS.recordShopSearch, yearMonth);

  // TODO: 공통 모달·확인창 디자인 확정 후 기록 이탈 안내와 하단 선택 버튼 추가
  const handleBack = () => navigate(-1);

  return (
    <main>
      <ManualRecordForm
        initialVisitDateTimeSheetOpen={Boolean(shop) && hasRequestedYearMonth && !isShopChange}
        initialVisitDateTime={visitDateTime ?? createInitialVisitDateTimeForMonth(yearMonth)}
        selectedShop={shop ?? null}
        onBack={handleBack}
        onClose={() => navigate(ROUTE_PATHS.home, { replace: true })}
        onChangeShop={(currentVisitDateTime) =>
          navigate(shopSearchPath, {
            state: {
              isChangingManualRecordShop: true,
              manualRecordVisitDateTime: currentVisitDateTime,
            },
          })
        }
        onSelectShop={() =>
          navigate(shopSearchPath, {
            replace: true,
            state: { replacedManualRecord: true },
          })
        }
      />
    </main>
  );
}
