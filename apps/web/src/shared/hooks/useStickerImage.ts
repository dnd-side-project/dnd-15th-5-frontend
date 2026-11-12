import { useState } from 'react';

import { StickerEyesImage } from '@/shared/assets/images/stickers';

/** 이미지 로딩 실패 시 기본 스티커로 대체하며 원본 URL이 바뀌면 새 이미지를 표시합니다. */
export const useStickerImage = (source: string) => {
  const [image, setImage] = useState({ source, hasFailed: false });

  // NOTE: URL이 바뀐 렌더에서만 초기화해 이전 사진의 실패 상태가 새 사진에 적용되지 않게 한다.
  if (image.source !== source) {
    setImage({ source, hasFailed: false });
  }

  const handleImageError = () => {
    setImage({ source, hasFailed: true });
  };

  return {
    src: image.source === source && image.hasFailed ? StickerEyesImage : source,
    onError: handleImageError,
  };
};
