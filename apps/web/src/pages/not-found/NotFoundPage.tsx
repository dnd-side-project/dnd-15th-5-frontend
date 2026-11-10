import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { StateView } from '@/shared/ui/state-view';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen-safe-bottom items-center py-8">
      <StateView
        actionLabel="홈으로 가기"
        description="주소가 바뀌었거나 삭제된 페이지일 수 있어요."
        headingAs="h1"
        title="페이지를 찾을 수 없어요"
        to={ROUTE_PATHS.home}
        variant="error"
      />
    </main>
  );
}
