import { RECEIPT_SHOP_SEARCH_SOURCE } from '@chapchap/shared/bridge';
import { useLocation, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';

import RecordNavigationHeader from '@/features/record/components/RecordNavigationHeader';
import type {
  ShopSearchLocationState,
  StickerRecordShopSearchContext,
} from '@/features/record/types';
import { ShopSearch } from '@/features/shop';
import type { ShopSearchResult } from '@/features/shop';
import { createYearMonthPath, ROUTE_PATHS } from '@/shared/constants/routePaths';
import { YEAR_MONTH_SEARCH_PARAM } from '@/shared/constants/searchParams';
import { notifyNative } from '@/shared/lib/bridge';

export default function ShopSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const shopSearchState = location.state as ShopSearchLocationState | null;
  const stickerRecord = useOutletContext<StickerRecordShopSearchContext | null>();
  const isStickerRecordSearch = Boolean(
    shopSearchState?.isStickerRecordShopSearch && stickerRecord
  );
  const isReceiptNativeSearch = searchParams.get('source') === RECEIPT_SHOP_SEARCH_SOURCE;
  const shouldConfirmClose =
    isReceiptNativeSearch ||
    isStickerRecordSearch ||
    Boolean(shopSearchState?.isChangingManualRecordShop || shopSearchState?.manualRecordDraftDirty);
  const manualRecordPath = createYearMonthPath(
    ROUTE_PATHS.manualRecord,
    searchParams.get(YEAR_MONTH_SEARCH_PARAM)
  );

  const handleSelectShop = (shop: ShopSearchResult) => {
    if (isReceiptNativeSearch && notifyNative('receiptShopSelected', { shop })) {
      return;
    }

    if (isStickerRecordSearch && stickerRecord) {
      stickerRecord.onSelectStickerShop(shop);
      navigate(-1);
      return;
    }

    navigate(manualRecordPath, {
      state: {
        isDraftDirty: Boolean(shopSearchState?.manualRecordDraftDirty),
        isShopChange: Boolean(shopSearchState?.isChangingManualRecordShop),
        shop,
        visitDateTime: shopSearchState?.manualRecordVisitDateTime,
        amount: shopSearchState?.manualRecordAmount,
        category: shopSearchState?.manualRecordCategory,
      },
    });
  };

  const handleBack = () => {
    if (isReceiptNativeSearch && notifyNative('receiptShopSearchCancelled', {})) {
      return;
    }

    // 가게 미선택 상태의 수기 입력 화면에서 교체 이동(replace)해온 경우에만 돌아갈
    // 히스토리가 없다. 그 외에는 전부 일반 이동이라 navigate(-1)이 항상 맞는 위치로 돌아간다.
    if (shopSearchState?.replacedManualRecord) {
      navigate(ROUTE_PATHS.record, { replace: true });
      return;
    }

    navigate(-1);
  };

  const handleClose = () => {
    if (isReceiptNativeSearch && notifyNative('receiptRecordCloseRequested', {})) {
      return;
    }

    navigate(ROUTE_PATHS.home, { replace: true });
  };

  return (
    <main className="flex min-h-full flex-col px-4">
      <RecordNavigationHeader
        onBack={handleBack}
        onClose={handleClose}
        confirmBeforeClose={shouldConfirmClose}
      />

      <div className="mt-4">
        <ShopSearch onSelectShop={handleSelectShop} />
      </div>
    </main>
  );
}
