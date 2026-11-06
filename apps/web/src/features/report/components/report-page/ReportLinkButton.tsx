import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';

import type { ReactNode } from 'react';

type ReportLinkButtonProps = {
  children: ReactNode;
  image: string;
  to: string;
};

/** 리포트 관련 화면으로 이동하는 카드형 링크 버튼입니다. */
export default function ReportLinkButton({ children, image, to }: ReportLinkButtonProps) {
  return (
    <Link
      className={cn(
        'relative flex h-24 w-full items-center overflow-hidden rounded-16 bg-neutral-00 px-4 text-body-01-semibold text-neutral-700 outline-none transition-colors hover:bg-primary-100 focus-visible:ring-2 focus-visible:ring-primary-300'
      )}
      to={to}
    >
      <span className="relative z-report-content">{children}</span>
      <img alt="" aria-hidden className="absolute right-0 bottom-0 h-21 w-auto" src={image} />
    </Link>
  );
}
