import { KakaoIcon } from '@/shared/assets/icons';
import { Button } from '@/shared/ui/button';

import type { ComponentProps } from 'react';

type KakaoLoginButtonProps = Pick<ComponentProps<typeof Button>, 'disabled' | 'onClick'>;

export default function KakaoLoginButton(props: KakaoLoginButtonProps) {
  return (
    <Button
      type="button"
      className="relative bg-kakao text-body-01-medium text-neutral-700 hover:bg-kakao active:bg-kakao"
      {...props}
    >
      <KakaoIcon className="absolute left-4 size-7" aria-hidden="true" />
      Kakao 로그인
    </Button>
  );
}
