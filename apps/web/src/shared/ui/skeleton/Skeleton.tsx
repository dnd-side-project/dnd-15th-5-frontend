import { cn } from '@/shared/lib/cn';

import type { ComponentPropsWithoutRef, ElementType } from 'react';

export type SkeletonProps<Element extends ElementType = 'div'> = {
  as?: Element;
} & Omit<ComponentPropsWithoutRef<Element>, 'as'>;

/**
 * 콘텐츠를 불러오는 동안 영역의 크기와 위치를 유지하는 공통 스켈레톤입니다.
 * 기본 요소는 `div`이며, 문장 안에서는 `as="span"`으로 렌더링할 수 있습니다.
 */
export function Skeleton<Element extends ElementType = 'div'>({
  as,
  className,
  ...props
}: SkeletonProps<Element>) {
  const Component = as ?? 'div';

  return (
    <Component
      {...props}
      aria-hidden="true"
      className={cn('animate-pulse rounded-08 bg-neutral-200', className)}
    />
  );
}
