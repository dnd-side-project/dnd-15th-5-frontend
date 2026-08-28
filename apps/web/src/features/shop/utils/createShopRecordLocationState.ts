import { RECORD_CATEGORIES } from '@chapchap/shared/record';

import type { RecordLocationState } from '@/shared/types/recordNavigation';

import type { ShopSearchResult } from '@chapchap/shared/shop';

type CreateShopRecordLocationStateParams = {
  address?: string;
  category?: string;
  placeName: string;
  recordShop?: ShopSearchResult;
};

/** 지도 마커의 식별·좌표 정보에 최신 매장 상세 정보를 합쳐 기록 화면 상태를 만듭니다. */
export const createShopRecordLocationState = ({
  address,
  category,
  placeName,
  recordShop,
}: CreateShopRecordLocationStateParams): RecordLocationState | undefined => {
  const name = placeName.trim();
  const recordCategory = RECORD_CATEGORIES.find((item) => item === category);
  if (!recordShop || !name) return undefined;

  return {
    category: recordCategory,
    shop: {
      ...recordShop,
      name,
      address: address?.trim() || recordShop.address,
    },
  };
};
