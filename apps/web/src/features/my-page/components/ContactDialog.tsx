import { useRef } from 'react';
import { createPortal } from 'react-dom';

import { CloseIcon } from '@/shared/assets/icons';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import { Button, LinkButton } from '@/shared/ui/button';

export const CONTACT_EMAIL = 'contact@chapchap.kr';
const CONTACT_MAILTO_URL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('[ChapChap] 문의')}`;

type ContactDialogProps = {
  onClose: () => void;
  onCopy: () => void;
};

/** 이메일 앱 실행과 주소 복사를 제공하는 문의 다이얼로그입니다. */
export default function ContactDialog({ onClose, onCopy }: ContactDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, {
    initialFocusSelector: '[data-action="copy"]',
    onEscape: onClose,
  });
  useScrollLock();

  return createPortal(
    <div className="mobile-frame fixed inset-0 z-dialog flex items-center justify-center bg-neutral-900/30 px-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        aria-describedby="contact-description"
        className="relative w-full max-w-90.25 rounded-30 bg-neutral-00 px-4 pt-8 pb-4"
      >
        <button
          type="button"
          aria-label="문의 팝업 닫기"
          className="absolute top-4 right-4 size-6 rounded-full p-1 text-neutral-500 outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-primary-300"
          onClick={onClose}
        >
          <CloseIcon aria-hidden="true" className="size-full" />
        </button>

        <h2 id="contact-title" className="text-center text-title-01-bold text-neutral-700">
          문의하기
        </h2>
        <p
          id="contact-description"
          className="mt-2 text-center text-body-01-regular text-neutral-500"
        >
          궁금한 점이나 불편한 점을 이메일로 보내주세요.
        </p>
        <p className="mt-5 rounded-12 bg-neutral-100 px-4 py-3 text-center text-body-01-medium text-neutral-700">
          {CONTACT_EMAIL}
        </p>

        <div className="mt-6 flex gap-3">
          <Button
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
        </div>
      </div>
    </div>,
    document.body
  );
}
