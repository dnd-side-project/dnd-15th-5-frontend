import { Link } from 'react-router-dom';

import { ChevronRightIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';

import { REPORT_PANEL_CLASS_NAME } from './reportPageStyles';

import type { ReactNode } from 'react';

type ReportLinkButtonProps = {
  children: ReactNode;
  to: string;
};

/** 리포트 관련 화면으로 이동하는 카드형 링크 버튼입니다. */
export default function ReportLinkButton({ children, to }: ReportLinkButtonProps) {
  return (
    <Link
      className={cn(
        REPORT_PANEL_CLASS_NAME,
        'flex h-31 w-full items-end justify-between py-2.5 pr-2.5 pl-4 text-title-02-semibold text-neutral-900 transition-colors hover:bg-primary-100 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:outline-none'
      )}
      to={to}
    >
      <span>{children}</span>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-400 text-neutral-00">
        <ChevronRightIcon aria-hidden className="size-5.5" />
      </span>
    </Link>
  );
}
