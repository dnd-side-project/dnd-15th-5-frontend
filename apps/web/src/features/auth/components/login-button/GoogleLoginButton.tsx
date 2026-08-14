import { GoogleIcon } from '@/shared/assets/icons';
import { Button } from '@/shared/ui/button';

import type { ComponentProps } from 'react';

type GoogleLoginButtonProps = Pick<ComponentProps<typeof Button>, 'disabled' | 'onClick'>;

export default function GoogleLoginButton(props: GoogleLoginButtonProps) {
  return (
    <Button
      type="button"
      className="relative bg-neutral-50 text-body-01-medium text-neutral-700 hover:bg-neutral-50 active:bg-neutral-50"
      {...props}
    >
      <GoogleIcon className="absolute left-4 size-7" aria-hidden="true" />
      Google 로그인
    </Button>
  );
}
