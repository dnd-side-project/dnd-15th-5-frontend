import { useState } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { useOpenReceiptCamera } from '@/features/record/hooks/useOpenReceiptCamera';
import StickerRecordFlow from '@/features/record/sticker/StickerRecordFlow';
import type {
  ShopSearchLocationState,
  StickerRecordShopSearchContext,
} from '@/features/record/types';
import { createInitialVisitDateTimeForMonth } from '@/features/record/utils/createInitialVisitDateTimeForMonth';
import { createYearMonthPath, ROUTE_PATHS } from '@/shared/constants/routePaths';
import { YEAR_MONTH_SEARCH_PARAM } from '@/shared/constants/searchParams';
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
  const { state: receiptState, retry: openReceiptCamera } = useOpenReceiptCamera({
    autoOpen: false,
  });
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
            onClose={() => navigate(ROUTE_PATHS.home, { replace: true })}
            onSearchShop={handleSearchShop}
            onScanReceipt={openReceiptCamera}
            isOpeningReceipt={receiptState.status === 'opening'}
            receiptError={receiptState.status === 'error' ? receiptState.message : ''}
            selectedShop={selectedShop}
            initialCategory={getRecordCategoryFromLocationState(location.state)}
            initialVisitDateTime={initialVisitDateTime}
          />
        </div>
      )}
      <Outlet
        context={{ onSelectStickerShop: setSelectedShop } satisfies StickerRecordShopSearchContext}
      />
    </>
  );
}
