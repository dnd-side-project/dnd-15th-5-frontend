import { useRef } from 'react';
import { createPortal } from 'react-dom';

import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import { Button } from '@/shared/ui/button';

type WithdrawAccountDialogProps = {
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function WithdrawAccountDialog({
  isLoading,
  onCancel,
  onConfirm,
}: WithdrawAccountDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, {
    initialFocusSelector: '[data-action="cancel"]',
    onEscape: isLoading ? undefined : onCancel,
  });
  useScrollLock();

  return createPortal(
    <div className="mobile-frame fixed inset-0 z-dialog flex items-center justify-center bg-neutral-900/30 px-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdraw-account-title"
        aria-describedby="withdraw-account-description"
        className="w-full max-w-[361px] rounded-30 bg-neutral-00 px-4 pt-8 pb-4"
      >
        <h2 id="withdraw-account-title" className="text-center text-title-01-bold text-neutral-700">
          정말 탈퇴하시겠어요?
        </h2>
        <p
          id="withdraw-account-description"
          className="mt-2 text-center text-body-01-regular text-neutral-500"
        >
          탈퇴하면 모든 기록과 계정 정보를 복구할 수 없어요.
        </p>

        <div className="mt-8 flex gap-3">
          <Button
            data-action="cancel"
            variant="secondary"
            size="medium"
            disabled={isLoading}
            onClick={onCancel}
            className="h-12 w-0 min-w-0 flex-1 rounded-full border-0 bg-neutral-300 text-body-01-medium text-neutral-600 hover:bg-neutral-400 active:bg-neutral-400"
          >
            취소
          </Button>
          <Button
            variant="secondary"
            size="medium"
            isLoading={isLoading}
            onClick={onConfirm}
            className="h-12 w-0 min-w-0 flex-1 rounded-full border-0 bg-primary-500 text-body-01-medium text-neutral-00 hover:bg-primary-600 active:bg-primary-700"
          >
            탈퇴하기
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
