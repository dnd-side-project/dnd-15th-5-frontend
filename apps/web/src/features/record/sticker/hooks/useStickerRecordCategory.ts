import { useState } from 'react';

import type { RecordCategory } from '@chapchap/shared/record';

type StickerRecordCategoryOptions = {
  sticker: string;
  stickerCategory?: RecordCategory;
  initialCategory: RecordCategory;
};

/** 소비 카테고리는 독립적으로 수정하고, 스티커를 재선택할 때만 기본 카테고리를 적용합니다. */
export const useStickerRecordCategory = ({
  sticker,
  stickerCategory,
  initialCategory,
}: StickerRecordCategoryOptions) => {
  const [selection, setSelection] = useState({
    sticker,
    stickerCategory,
    category: initialCategory,
  });

  // 변경된 미디어와 카테고리를 같은 렌더에서 맞춰 이전 카테고리가 제출되지 않도록 합니다.
  if (selection.sticker !== sticker || selection.stickerCategory !== stickerCategory) {
    setSelection({ sticker, stickerCategory, category: stickerCategory ?? selection.category });
  }

  const setCategory = (category: RecordCategory) => {
    setSelection({ sticker, stickerCategory, category });
  };
  return [selection.category, setCategory] as const;
};
