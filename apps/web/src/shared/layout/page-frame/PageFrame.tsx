import { cn } from '@/shared/lib/cn';

import type { CSSProperties, PropsWithChildren } from 'react';

type PageFrameProps = PropsWithChildren<{
  usesOwnTopSafeArea?: boolean;
  usesOwnBottomSafeArea?: boolean;
}>;

/**
 * 라우트·로딩·오류 화면에 동일한 모바일 너비와 Safe Area를 적용합니다.
 * 지도·사진 편집처럼 화면이 직접 여백을 확보하면 해당 가장자리의 처리를 위임합니다.
 * 고정 화면과 뷰포트 높이는 상속된 `--page-safe-area-top`을 기준으로 배치합니다.
 */
export default function PageFrame({
  children,
  usesOwnTopSafeArea = false,
  usesOwnBottomSafeArea = false,
}: PageFrameProps) {
  return (
    <div className="flex min-h-dvh justify-center bg-neutral-100">
      <div
        className={cn(
          'mobile-frame min-h-dvh bg-neutral-00 pt-[var(--page-safe-area-top)]',
          !usesOwnBottomSafeArea && 'pb-safe-bottom'
        )}
        style={
          {
            '--page-safe-area-top': usesOwnTopSafeArea ? '0px' : 'env(safe-area-inset-top)',
          } as CSSProperties
        }
      >
        {!usesOwnTopSafeArea && (
          <div
            aria-hidden="true"
            className="mobile-frame pointer-events-none fixed inset-x-0 top-0 z-bottom-navigation h-[var(--page-safe-area-top)] bg-neutral-00"
          />
        )}
        {children}
      </div>
    </div>
  );
}
