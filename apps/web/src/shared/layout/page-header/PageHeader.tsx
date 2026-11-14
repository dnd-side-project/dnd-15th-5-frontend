import { CloseIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';
import { BackButton } from '@/shared/ui/back-button';
import { Button } from '@/shared/ui/button';

import type { ReactNode } from 'react';

type PageHeaderProps = {
  title?: ReactNode;
  tone?: 'default' | 'inverse';
  onBack?: () => void;
  onClose?: () => void;
  className?: string;
  backButtonClassName?: string;
  backButtonLabel?: string;
  closeButtonLabel?: string;
};

/** 뒤로가기·제목·닫기 버튼을 조합해 표시하는 페이지 공통 헤더입니다. 위아래 16px 여백을 유지합니다. */
export default function PageHeader({
  title,
  tone = 'default',
  onBack,
  onClose,
  className,
  backButtonClassName,
  backButtonLabel,
  closeButtonLabel = '닫기',
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'relative flex h-14.5 shrink-0 items-center justify-center py-4',
        tone === 'inverse' ? 'text-neutral-00' : 'text-neutral-700',
        className
      )}
    >
      {onBack && (
        <BackButton
          variant={tone === 'inverse' ? 'light' : 'default'}
          onClick={onBack}
          aria-label={backButtonLabel}
          className={cn('absolute top-1/2 left-0 mt-0 -translate-y-1/2', backButtonClassName)}
        />
      )}
      {title !== undefined && (
        <h1 className="text-title-02-bold tracking-[-0.02em] text-inherit">{title}</h1>
      )}
      {onClose && (
        <Button
          variant="icon"
          aria-label={closeButtonLabel}
          onClick={onClose}
          className="absolute top-1/2 right-0 size-6 -translate-y-1/2 text-inherit [&_svg]:size-3.5"
        >
          <CloseIcon aria-hidden="true" />
        </Button>
      )}
    </header>
  );
}
