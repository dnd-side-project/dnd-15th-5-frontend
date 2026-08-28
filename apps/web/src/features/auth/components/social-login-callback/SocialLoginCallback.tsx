import { useSocialLoginCallback } from '@/features/auth/apis/hooks/useSocialLoginCallback';
import { AUTH_FLOW_ERROR_CODE, AuthFlowError } from '@/features/auth/errors';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { Spinner } from '@/shared/ui/spinner';
import { StateView } from '@/shared/ui/state-view';

export default function SocialLoginCallback() {
  const { error, isLoading } = useSocialLoginCallback();

  if (error) {
    const errorContent = getCallbackErrorContent(error);

    return (
      <StateView
        variant="error"
        headingAs="h1"
        title={errorContent.title}
        description={errorContent.description}
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

const getCallbackErrorContent = (error: Error) => {
  if (error instanceof AuthFlowError) {
    if (error.code === AUTH_FLOW_ERROR_CODE.ACCOUNT_WITHDRAWN) {
      return {
        title: '탈퇴한 계정은 로그인할 수 없어요',
        description:
          '계정 데이터는 탈퇴 다음 날 0시에 삭제돼요.\n삭제가 완료된 후 다시 가입할 수 있어요.',
      };
    }

    if (error.code === AUTH_FLOW_ERROR_CODE.OAUTH_FAILED) {
      return {
        title: '소셜 로그인에 실패했어요',
        description: '잠시 후 다시 시도해 주세요.',
      };
    }

    if (error.code === AUTH_FLOW_ERROR_CODE.WITHDRAWAL_FAILED) {
      return {
        title: '회원 탈퇴에 실패했어요',
        description: '잠시 후 다시 시도해 주세요.',
      };
    }
  }

  return {
    title: '로그인을 완료하지 못했어요',
    description: error.message,
  };
};
