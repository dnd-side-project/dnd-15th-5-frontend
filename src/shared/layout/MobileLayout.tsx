import { cn } from '@/shared/lib/cn';

import type { PropsWithChildren } from 'react';

type MobileLayoutProps = PropsWithChildren<{
  noPadding?: boolean;
}>;

export default function MobileLayout({ children, noPadding = false }: MobileLayoutProps) {
  return (
    <div className="flex min-h-screen justify-center bg-layout-bg">
      {/* TODO: 디자인 확정되면 max-w 값 수정 */}
      <div className={cn('min-h-screen w-full max-w-[480px] bg-white', !noPadding && 'px-4')}>
        {children}
      </div>
    </div>
  );
}
