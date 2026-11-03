import { StoreIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';

type StoreImageFallbackProps = {
  ariaLabel?: string;
  className?: string;
  iconClassName?: string;
};

/** 매장 사진이 없거나 불러오지 못했을 때 표시하는 기본 이미지입니다. */
export function StoreImageFallback({
  ariaLabel,
  className,
  iconClassName,
}: StoreImageFallbackProps) {
  return (
    <span
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={cn(
        'inline-flex items-center justify-center bg-neutral-200 text-neutral-400',
        className
      )}
    >
      <StoreIcon aria-hidden="true" className={cn('size-1/2', iconClassName)} />
    </span>
  );
}
