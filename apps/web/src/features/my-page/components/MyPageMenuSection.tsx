import { cn } from '@/shared/lib/cn';

import type { PropsWithChildren } from 'react';

type MyPageMenuSectionProps = PropsWithChildren<{
  className?: string;
}>;

export default function MyPageMenuSection({ children, className }: MyPageMenuSectionProps) {
  return (
    <div
      className={cn(
        'relative mx-4 pt-4 before:absolute before:inset-x-0 before:top-0 before:border-t before:border-neutral-100',
        className
      )}
    >
      {children}
    </div>
  );
}
