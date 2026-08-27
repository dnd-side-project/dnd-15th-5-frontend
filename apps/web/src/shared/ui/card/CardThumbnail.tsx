import { useState } from 'react';

import { StoreIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';

type CardThumbnailProps = {
  src: string | null;
  radius?: 'small' | 'medium';
  size?: 'default' | 'large';
};

/**
 * 카드 좌측에 쓰는 정사각형 썸네일입니다. 기본은 60px, `large`는 90px입니다.
 *
 * `src`가 없거나 이미지 로드에 실패하면 기본 가게 썸네일 아이콘으로 대체합니다.
 */
export function CardThumbnail({ src, radius = 'small', size = 'default' }: CardThumbnailProps) {
  const [isError, setIsError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setIsError(false);
  }

  const resolvedRadius = size === 'large' ? 'large' : radius;
  const className = cn(
    'shrink-0',
    size === 'default' ? 'size-15' : 'size-22.5',
    resolvedRadius === 'small'
      ? 'rounded-05'
      : resolvedRadius === 'medium'
        ? 'rounded-08'
        : 'rounded-12'
  );

  if (!src || isError) {
    return (
      <span
        className={cn('inline-flex items-center justify-center bg-neutral-200', className)}
        aria-hidden="true"
      >
        <StoreIcon className="size-3/5" aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      className={cn('object-cover', className)}
      onError={() => setIsError(true)}
    />
  );
}
