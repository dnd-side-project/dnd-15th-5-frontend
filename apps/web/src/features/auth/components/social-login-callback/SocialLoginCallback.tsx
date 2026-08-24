import { useSocialLoginCallback } from '@/features/auth/apis/hooks/useSocialLoginCallback';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { Spinner } from '@/shared/ui/spinner';
import { StateView } from '@/shared/ui/state-view';

export default function SocialLoginCallback() {
  const { error, isLoading } = useSocialLoginCallback();

  if (error) {
    return (
      <StateView
        variant="error"
        headingAs="h1"
        title="로그인을 완료하지 못했어요"
        description={error.message}
        actionLabel="로그인으로 돌아가기"
        to={ROUTE_PATHS.login}
      />
    );
  }

  return (
    <section className="flex flex-col items-center gap-3" aria-live="polite" aria-busy={isLoading}>
      <Spinner className="size-6 text-primary-500" />
      <h1 className="text-title-02-semibold text-neutral-700">로그인을 완료하고 있어요</h1>
    </section>
  );
}
