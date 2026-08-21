import { cn } from '@/shared/lib/cn';

type CardThumbnailProps = {
  src: string | null;
  radius?: 'small' | 'medium';
};

/** 카드 좌측에 쓰는 정사각형 썸네일입니다. 이미지가 없으면 회색 배경으로 대체합니다. */
export function CardThumbnail({ src, radius = 'small' }: CardThumbnailProps) {
  const className = cn('size-15 shrink-0', radius === 'small' ? 'rounded-05' : 'rounded-08');

  if (!src) {
    return <span className={cn('inline-block bg-neutral-200', className)} aria-hidden="true" />;
  }

  return <img src={src} alt="" loading="lazy" className={cn('object-cover', className)} />;
}
