import { isNativeApp } from '@/shared/lib/bridge';
import { useToast } from '@/shared/ui/toast';

import RecordMethodLink from './RecordMethodLink';

import type { MouseEventHandler } from 'react';

const RECEIPT_APP_ONLY_MESSAGE = '영수증 인식은 앱에서만 사용할 수 있어요';

type ReceiptMethodLinkProps = {
  to: string;
};

/** 실행 환경에 따라 네이티브 영수증 촬영 진입을 제어한다. */
export default function ReceiptMethodLink({ to }: ReceiptMethodLinkProps) {
  const { showToast } = useToast();

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (isNativeApp()) {
      return;
    }

    event.preventDefault();
    showToast({ message: RECEIPT_APP_ONLY_MESSAGE, type: 'info' });
  };

  return (
    <RecordMethodLink
      title="영수증 인식"
      description="영수증을 찍어 간편 기록해요"
      to={to}
      variant="primary"
      onClick={handleClick}
    />
  );
}
