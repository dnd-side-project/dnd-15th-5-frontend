import { isNativeApp } from '@/shared/lib/bridge';

import RecordMethodLink from './RecordMethodLink';

type ReceiptMethodLinkProps = {
  to: string;
};

/** 실행 환경에 따라 네이티브 영수증 촬영 진입을 제어한다. */
export default function ReceiptMethodLink({ to }: ReceiptMethodLinkProps) {
  return (
    <RecordMethodLink
      title="영수증 인식"
      description="영수증을 찍어 간편 기록해요"
      to={to}
      variant="primary"
      disabled={!isNativeApp()}
    />
  );
}
