import type { DefaultSticker } from '@/shared/assets/images/ios-stickers/catalog';

import type { RecordCategory, VisitDateTimeValue } from '@chapchap/shared/record';
import type { ShopSearchResult } from '@chapchap/shared/shop';

/** 사진 생성 화면에서 재선택·재촬영 동작을 구분하는 입력 경로입니다. */
export type StickerPhotoSource = 'gallery' | 'camera';

/** 사진은 업로드하고 기본 이모지는 서버 목록의 카테고리·이름으로 식별합니다. */
export type StickerRecordMedia =
  | { source: 'photo'; image: Blob }
  | { source: 'default'; category: RecordCategory; name: string }
  | { source: 'saved'; imageId: number; stickerItemId?: never; category: RecordCategory }
  | { source: 'saved'; stickerItemId: number; imageId?: never; category: RecordCategory };

/** 수정 화면에서 기존 서버 이미지와 입력값을 복원하는 초기값입니다. */
export type StickerRecordInitialValue = {
  sticker: string;
  defaultSticker?: DefaultSticker;
  media: StickerRecordMedia;
  draft: StickerRecordDraft;
};

/** 사진·기본 스티커에 공통으로 사용하는 최종 기록 입력값입니다. */
export type StickerRecordDraft = {
  shop: ShopSearchResult;
  visitDateTime: VisitDateTimeValue;
  amount: string;
  memo: string;
  category: RecordCategory;
  receiptImageId?: number;
  purchaseTime?: string;
};

export type ShopSearchLocationState = {
  /** 스티커 기록 폼에서 가게를 선택하러 진입했는지 나타냅니다. */
  isStickerRecordShopSearch?: boolean;
};

/** 검색 화면에서 선택한 가게를 마운트된 스티커 기록 폼에 전달하는 라우트 컨텍스트입니다. */
export type StickerRecordShopSearchContext = {
  onSelectStickerShop: (shop: ShopSearchResult) => void;
};
