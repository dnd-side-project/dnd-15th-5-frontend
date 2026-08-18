import { cn } from '@/shared/lib/cn';

import type { ComponentProps } from 'react';

export type SpinnerProps = ComponentProps<'span'>;

/** 비동기 작업이 진행 중임을 시각적으로 표시하는 공통 스피너입니다. */
export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cn(
        'size-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className
      )}
    />
  );
}
