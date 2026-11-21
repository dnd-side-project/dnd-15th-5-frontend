import PageFrame from '@/shared/layout/page-frame';
import { Spinner } from '@/shared/ui/spinner';

/** URL로 직접 진입했을 때 해당 페이지 코드를 불러오는 동안 표시합니다. */
export default function RouteLoading() {
  return (
    <PageFrame>
      <div
        role="status"
        aria-label="화면을 불러오는 중"
        className="min-h-screen-safe-bottom flex items-center justify-center gap-3 text-body-02-medium text-neutral-600"
      >
        <Spinner className="size-6 motion-reduce:animate-none" />
        <span>화면을 불러오고 있어요</span>
      </div>
    </PageFrame>
  );
}
