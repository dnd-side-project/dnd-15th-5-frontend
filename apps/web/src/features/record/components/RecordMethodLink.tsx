import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';

import type { MouseEventHandler } from 'react';
import type { LinkProps } from 'react-router-dom';

type RecordMethodLinkProps = {
  description: string;
  title: string;
  to: string;
  variant: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  state?: LinkProps['state'];
};

/** 기록 방법의 제목과 설명을 함께 보여주는 이동 링크. */
export default function RecordMethodLink({
  description,
  title,
  to,
  variant,
  disabled = false,
  onClick,
  state,
}: RecordMethodLinkProps) {
  const isPrimary = variant === 'primary';
  const className = cn(
    'block w-full rounded-16 p-4 text-left outline-none transition-colors',
    disabled
      ? 'cursor-not-allowed bg-neutral-200 text-neutral-500'
      : 'focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1',
    !disabled &&
      (isPrimary
        ? 'bg-primary-500 text-neutral-00 hover:bg-primary-600 active:bg-primary-700'
        : 'bg-primary-50 text-primary-600 hover:bg-primary-100 active:bg-primary-200')
  );
  const content = (
    <>
      <span className="block px-2.5 py-1 text-heading-03-semibold">{title}</span>
      <span
        className={cn(
          'mt-2 block px-2.5 text-body-01-regular',
          disabled ? 'text-neutral-500' : isPrimary ? 'text-primary-200' : 'text-neutral-600'
        )}
      >
        {description}
      </span>
    </>
  );

  if (disabled) {
    return (
      <div role="link" aria-disabled="true" className={className}>
        {content}
      </div>
    );
  }

  return (
    <Link to={to} state={state} onClick={onClick} className={className}>
      {content}
    </Link>
  );
}
