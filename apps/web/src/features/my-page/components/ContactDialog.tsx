import { useRef } from 'react';

import { CloseIcon } from '@/shared/assets/icons';
import { Button, LinkButton } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';

export const CONTACT_EMAIL = 'contact@chapchap.kr';
const CONTACT_MAILTO_URL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('[ChapChap] 문의')}`;

type ContactDialogProps = {
  onClose: () => void;
  onCopy: () => void;
};

/** 이메일 앱 실행과 주소 복사를 제공하는 문의 다이얼로그입니다. */
export default function ContactDialog({ onClose, onCopy }: ContactDialogProps) {
  const copyButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="문의하기"
      description="궁금한 점이나 불편한 점을 이메일로 보내주세요."
      popupClassName="relative max-w-90.25"
      initialFocusRef={copyButtonRef}
      actionsClassName="mt-6"
      actions={
        <>
          <Button
            ref={copyButtonRef}
            data-action="copy"
            variant="secondary"
            size="medium"
            onClick={onCopy}
            className="h-12 w-0 min-w-0 flex-1 rounded-full"
          >
            주소 복사
          </Button>
          <LinkButton to={CONTACT_MAILTO_URL} size="medium" className="h-12 w-0 min-w-0 flex-1">
            메일 앱 열기
          </LinkButton>
        </>
      }
    >
      <button
        type="button"
        aria-label="문의 팝업 닫기"
        className="absolute top-4 right-4 size-6 rounded-full p-1 text-neutral-500 outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-primary-300"
        onClick={onClose}
      >
        <CloseIcon aria-hidden="true" className="size-full" />
      </button>

      <p className="mt-5 rounded-12 bg-neutral-100 px-4 py-3 text-center text-body-01-medium text-neutral-700">
        {CONTACT_EMAIL}
      </p>
    </Dialog>
  );
}
