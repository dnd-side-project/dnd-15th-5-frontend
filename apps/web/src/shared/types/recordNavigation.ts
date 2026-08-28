import type { RecordCategory } from '@chapchap/shared/record';
import type { ShopSearchResult } from '@chapchap/shared/shop';

/** 소비 기록 화면 사이에서 선택한 가게를 전달하는 라우트 상태입니다. */
export type RecordLocationState = {
  category?: RecordCategory;
  shop?: ShopSearchResult;
};
