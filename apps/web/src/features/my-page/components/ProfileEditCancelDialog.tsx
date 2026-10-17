import { useRef } from 'react';
import { createPortal } from 'react-dom';

import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import { Button } from '@/shared/ui/button';

type ProfileEditCancelDialogProps = {
  onCancel: () => void;
  onContinue: () => void;
};

/** 수정 중인 프로필 정보를 버릴지 확인하는 다이얼로그입니다. */
export default function ProfileEditCancelDialog({
  onCancel,
  onContinue,
}: ProfileEditCancelDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, {
    initialFocusSelector: '[data-action="continue"]',
    onEscape: onContinue,
  });
  useScrollLock();

  return createPortal(
    <div className="mobile-frame fixed inset-0 z-dialog flex items-center justify-center bg-neutral-900/30 px-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-cancel-title"
        aria-describedby="profile-cancel-description"
        className="w-full rounded-30 bg-neutral-00 px-4 pt-8 pb-4"
      >
        <h2 id="profile-cancel-title" className="text-center text-title-01-bold text-neutral-700">
          수정을 그만할까요?
        </h2>
        <p
          id="profile-cancel-description"
          className="mt-2 text-center text-body-01-regular text-neutral-500"
        >
          지금까지 수정한 내용은 저장되지 않아요
        </p>
        <div className="mt-8 flex gap-3">
          <Button
            variant="secondary"
            size="medium"
            onClick={onCancel}
            className="h-12 w-0 min-w-0 flex-1 rounded-full border-0 bg-neutral-300 text-body-01-medium text-neutral-600 hover:bg-neutral-400"
          >
            그만하기
          </Button>
          <Button
            data-action="continue"
            variant="secondary"
            size="medium"
            onClick={onContinue}
            className="h-12 w-0 min-w-0 flex-1 rounded-full border-0 bg-primary-500 text-body-01-medium text-neutral-00 hover:bg-primary-600"
          >
            계속 수정하기
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
