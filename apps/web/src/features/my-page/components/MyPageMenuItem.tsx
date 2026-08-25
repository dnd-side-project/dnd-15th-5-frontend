import { ChevronRightIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';

import type { ComponentType, MouseEventHandler, SVGProps } from 'react';

type MyPageMenuItemProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export default function MyPageMenuItem({
  icon: Icon,
  label,
  disabled,
  isLoading = false,
  onClick,
}: MyPageMenuItemProps) {
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="size-6 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </span>
      <ChevronRightIcon className="size-5.5 shrink-0 text-neutral-400" aria-hidden="true" />
    </>
  );
  const className = cn(
    'flex h-12 w-full items-center justify-between rounded-08 px-4 text-left text-body-01-regular text-neutral-700',
    onClick &&
      'outline-none hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-inset disabled:cursor-wait disabled:opacity-60'
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
