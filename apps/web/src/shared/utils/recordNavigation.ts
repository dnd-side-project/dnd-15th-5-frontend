import { RECORD_CATEGORIES } from '@chapchap/shared/record';

import type { RecordLocationState } from '@/shared/types/recordNavigation';

import type { RecordCategory } from '@chapchap/shared/record';
import type { ShopSearchResult } from '@chapchap/shared/shop';

const isShopSearchResult = (value: unknown): value is ShopSearchResult => {
  if (typeof value !== 'object' || value === null) return false;

  const shop = value as Partial<ShopSearchResult>;
  return (
    typeof shop.id === 'string' &&
    shop.id.trim().length > 0 &&
    typeof shop.name === 'string' &&
    shop.name.trim().length > 0 &&
    typeof shop.address === 'string' &&
    (shop.photoUrl === null || typeof shop.photoUrl === 'string') &&
    typeof shop.latitude === 'number' &&
    typeof shop.longitude === 'number'
  );
};

/** 알 수 없는 라우트 상태에서 소비 기록에 사용할 수 있는 가게만 안전하게 꺼냅니다. */
export const getRecordShopFromLocationState = (state: unknown): ShopSearchResult | undefined => {
  if (typeof state !== 'object' || state === null) return undefined;

  const shop = (state as RecordLocationState).shop;
  return isShopSearchResult(shop) ? shop : undefined;
};

/** 알 수 없는 라우트 상태에서 지원하는 소비 카테고리만 안전하게 꺼냅니다. */
export const getRecordCategoryFromLocationState = (state: unknown): RecordCategory | undefined => {
  if (typeof state !== 'object' || state === null) return undefined;

  const category = (state as RecordLocationState).category;
  return RECORD_CATEGORIES.find((item) => item === category);
};
