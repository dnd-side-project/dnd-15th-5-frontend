import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { createInitialVisitDateTimeForMonth, ManualRecordForm } from '@/features/record';
import type { ManualRecordDraft } from '@/features/record';
import { createYearMonthPath, ROUTE_PATHS } from '@/shared/constants/routePaths';
import { YEAR_MONTH_SEARCH_PARAM } from '@/shared/constants/searchParams';
import type { RecordLocationState } from '@/shared/types/recordNavigation';
import {
  getRecordCategoryFromLocationState,
  getRecordShopFromLocationState,
} from '@/shared/utils/recordNavigation';
import { isValidYearMonth } from '@/shared/utils/yearMonth';

import type { VisitDateTimeValue } from '@chapchap/shared/record';

type ManualRecordLocationState = RecordLocationState & {
  isShopChange?: boolean;
  visitDateTime?: VisitDateTimeValue;
  amount?: string;
};

export default function ManualRecordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const manualRecordState = (location.state as ManualRecordLocationState | null) ?? {};
  const { isShopChange, visitDateTime, amount } = manualRecordState;
  const shop = getRecordShopFromLocationState(manualRecordState);
  const category = getRecordCategoryFromLocationState(manualRecordState);
  const yearMonth = searchParams.get(YEAR_MONTH_SEARCH_PARAM);
  const hasRequestedYearMonth = isValidYearMonth(yearMonth);
  const shopSearchPath = createYearMonthPath(ROUTE_PATHS.recordShopSearch, yearMonth);

  const handleBack = () => navigate(-1);
  const handleChangeShop = (draft: ManualRecordDraft) => {
    // 검색에서 뒤로 가거나 브라우저 back을 사용해도 초안이 남도록 현재 히스토리 엔트리를 먼저
    // 최신 값으로 교체한 뒤 검색 화면을 새 엔트리로 추가한다.
    navigate(createYearMonthPath(ROUTE_PATHS.manualRecord, yearMonth), {
      replace: true,
      state: {
        isShopChange: true,
        shop,
        visitDateTime: draft.visitDateTime,
        amount: draft.amount,
        category: draft.category,
      } satisfies ManualRecordLocationState,
    });
    navigate(shopSearchPath, {
      state: {
        isChangingManualRecordShop: true,
        manualRecordVisitDateTime: draft.visitDateTime,
        manualRecordAmount: draft.amount,
        manualRecordCategory: draft.category,
      },
    });
  };

  return (
    <main>
      <ManualRecordForm
        initialDraftDirty={Boolean(isShopChange)}
        initialVisitDateTimeSheetOpen={Boolean(shop) && hasRequestedYearMonth && !isShopChange}
        initialVisitDateTime={visitDateTime ?? createInitialVisitDateTimeForMonth(yearMonth)}
        initialAmount={amount}
        initialCategory={category}
        selectedShop={shop ?? null}
        onBack={handleBack}
        onClose={() => navigate(ROUTE_PATHS.home, { replace: true })}
        onChangeShop={handleChangeShop}
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
