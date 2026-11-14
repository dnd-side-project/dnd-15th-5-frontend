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
  const shouldConfirmClose = isReceiptNativeSearch || isStickerRecordSearch;
  const recordPath = createYearMonthPath(
    ROUTE_PATHS.record,
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

    stickerRecord?.onSelectStickerShop(shop);
    navigate(recordPath, { replace: true, state: { shop } });
  };

  const handleBack = () => {
    if (isReceiptNativeSearch && notifyNative('receiptShopSearchCancelled', {})) {
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
