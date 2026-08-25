import { useSocialLogin } from '@/features/auth/hooks/useSocialLogin';
import { KakaoIcon } from '@/shared/assets/icons';
import { Button } from '@/shared/ui/button';

import type { ComponentProps } from 'react';

type KakaoLoginButtonProps = Pick<ComponentProps<typeof Button>, 'disabled'>;

export default function KakaoLoginButton(props: KakaoLoginButtonProps) {
  const { login, isLoading } = useSocialLogin('kakao');

  return (
    <Button
      type="button"
      className="relative bg-kakao text-body-01-medium text-neutral-700 hover:bg-kakao active:bg-kakao"
      isLoading={isLoading}
      onClick={login}
      {...props}
    >
      <KakaoIcon className="absolute left-4 size-7" aria-hidden="true" />
      Kakao 로그인
    </Button>
  );
}
