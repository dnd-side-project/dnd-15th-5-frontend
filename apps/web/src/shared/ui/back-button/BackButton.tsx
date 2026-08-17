import { ChevronLeftIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';

import type { MouseEventHandler } from 'react';

type BackButtonProps = {
  /** 버튼을 눌렀을 때 실행할 뒤로 가기 동작입니다. */
  onClick: MouseEventHandler<HTMLButtonElement>;
  /** 어두운 배경에서는 `light`를 사용합니다. */
  variant?: 'default' | 'light';
  className?: string;
  'aria-label'?: string;
};

/**
 * 이전 화면으로 이동할 때 사용하는 공통 아이콘 버튼입니다.
 *
 * 라우터에 의존하지 않으므로 사용하는 화면에서 `navigate(-1)` 등의 이동 동작을 전달합니다.
 *
 * @example
 * ```tsx
 * <BackButton onClick={() => navigate(-1)} />
 * ```
 */
export function BackButton({
  onClick,
  variant = 'default',
  className,
  'aria-label': ariaLabel = '뒤로 가기',
}: BackButtonProps) {
  return (
    <Button
      variant="icon"
      size="icon"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(variant === 'light' ? 'text-neutral-00' : 'text-neutral-700', className)}
    >
      <span className="inline-flex size-6">
        <ChevronLeftIcon aria-hidden="true" />
      </span>
    </Button>
  );
}
