import { cn } from '@/shared/lib/cn';

type CardThumbnailProps = {
  src: string | null;
  radius?: 'small' | 'medium';
  size?: 'default' | 'large';
};

/** 카드 좌측에 쓰는 정사각형 썸네일입니다. 기본은 60px, `large`는 90px입니다. */
export function CardThumbnail({ src, radius = 'small', size = 'default' }: CardThumbnailProps) {
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

  if (!src) {
    return <span className={cn('inline-block bg-neutral-200', className)} aria-hidden="true" />;
  }

  return <img src={src} alt="" loading="lazy" className={cn('object-cover', className)} />;
}
