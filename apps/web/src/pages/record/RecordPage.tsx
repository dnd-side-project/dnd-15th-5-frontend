import { RECORD_EXIT_CONFIRM_TEXT } from '@chapchap/shared/record';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { useSubmitStickerRecord } from '@/features/record/apis/hooks/useSubmitStickerRecord';
import { useScanReceipt } from '@/features/record/hooks/useScanReceipt';
import StickerRecordFlow from '@/features/record/sticker/components/StickerRecordFlow';
import type {
  ShopSearchLocationState,
  StickerRecordShopSearchContext,
} from '@/features/record/types';
import { createInitialVisitDateTimeForMonth } from '@/features/record/utils/createInitialVisitDateTimeForMonth';
import { createYearMonthPath, ROUTE_PATHS } from '@/shared/constants/routePaths';
import { YEAR_MONTH_SEARCH_PARAM } from '@/shared/constants/searchParams';
import { useUnsavedChangesBlocker } from '@/shared/hooks/useUnsavedChangesBlocker';
import { UnsavedChangesDialog } from '@/shared/ui/dialog';
import {
  getRecordCategoryFromLocationState,
  getRecordShopFromLocationState,
} from '@/shared/utils/recordNavigation';

import type { ShopSearchResult } from '@chapchap/shared/shop';

export default function RecordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isShopSearchOpen = location.pathname === ROUTE_PATHS.recordShopSearch;
  // NOTE: 스티커 폼에서 연 검색만 폼을 마운트해 두어 이미지 URL과 입력 상태를 보존한다.
  const shouldKeepRecordFlow =
    !isShopSearchOpen ||
    Boolean((location.state as ShopSearchLocationState | null)?.isStickerRecordShopSearch);
  const [selectedShop, setSelectedShop] = useState<ShopSearchResult | null>(
    () => getRecordShopFromLocationState(location.state) ?? null
  );
  const [initialVisitDateTime] = useState(() =>
    createInitialVisitDateTimeForMonth(searchParams.get(YEAR_MONTH_SEARCH_PARAM))
  );
  const { scanReceipt, isOpeningReceipt, receiptError } = useScanReceipt();
  const { submit, isSubmitting, submitError } = useSubmitStickerRecord();
  const [hasChanges, setHasChanges] = useState(false);
  const blocker = useUnsavedChangesBlocker(
    shouldKeepRecordFlow && hasChanges,
    ({ historyAction, nextLocation }) =>
      historyAction === 'POP' &&
      !(isShopSearchOpen && nextLocation.pathname === ROUTE_PATHS.record) &&
      !(
        nextLocation.pathname === ROUTE_PATHS.recordShopSearch &&
        (nextLocation.state as ShopSearchLocationState | null)?.isStickerRecordShopSearch
      )
  );
  const handleSearchShop = () => {
    navigate(
      createYearMonthPath(ROUTE_PATHS.recordShopSearch, searchParams.get(YEAR_MONTH_SEARCH_PARAM)),
      { state: { isStickerRecordShopSearch: true } satisfies ShopSearchLocationState }
    );
  };

  return (
    <>
      {shouldKeepRecordFlow && (
        <div hidden={isShopSearchOpen}>
          <StickerRecordFlow
            onDirtyChange={setHasChanges}
            onClose={() => navigate(ROUTE_PATHS.home, { replace: true })}
            onSearchShop={handleSearchShop}
            onScanReceipt={scanReceipt}
            onReceiptShopSelected={setSelectedShop}
            isOpeningReceipt={isOpeningReceipt}
            receiptError={receiptError}
            onSubmit={(media, draft) => void submit(media, draft)}
            isSubmitting={isSubmitting}
            submitError={submitError}
            selectedShop={selectedShop}
            initialCategory={getRecordCategoryFromLocationState(location.state)}
            initialVisitDateTime={initialVisitDateTime}
          />
        </div>
      )}
      <Outlet
        context={{ onSelectStickerShop: setSelectedShop } satisfies StickerRecordShopSearchContext}
      />
      {blocker.isBlocked && (
        <UnsavedChangesDialog
          title={RECORD_EXIT_CONFIRM_TEXT.title}
          description={RECORD_EXIT_CONFIRM_TEXT.description}
          exitLabel={RECORD_EXIT_CONFIRM_TEXT.exit}
          continueLabel={RECORD_EXIT_CONFIRM_TEXT.continue}
          onExit={blocker.proceed}
          onContinue={blocker.reset}
        />
      )}
    </>
  );
}
