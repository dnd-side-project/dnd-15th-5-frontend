import { useStickerImage } from '@/shared/hooks/useStickerImage';

import type { ComponentProps, SyntheticEvent } from 'react';

type StickerImageProps = Omit<ComponentProps<'img'>, 'src'> & {
  src: string;
  /** 로딩 실패 상태를 유지하면서 안쪽 img만 다시 마운트해 애니메이션을 재생합니다. */
  animationKey?: string | number;
};

/** 사진과 기본 스티커를 표시하고 로드되지 않는 이미지는 기본 스티커로 대체합니다. */
export function StickerImage({
  src,
  onError,
  alt = '',
  animationKey,
  ...props
}: StickerImageProps) {
  const image = useStickerImage(src);
  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    image.onError();
    onError?.(event);
  };

  return <img key={animationKey} {...props} alt={alt} src={image.src} onError={handleImageError} />;
}
