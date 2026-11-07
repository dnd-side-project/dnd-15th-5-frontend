import { useRef } from 'react';

import { Dialog, DialogActionButton } from '@/shared/ui/dialog';

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
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isLoading) onCancel();
      }}
      title="정말 탈퇴하시겠어요?"
      description="탈퇴하면 모든 기록과 계정 정보를 복구할 수 없어요."
      popupClassName="max-w-[361px]"
      initialFocusRef={cancelButtonRef}
      actions={
        <>
          <DialogActionButton
            ref={cancelButtonRef}
            data-action="cancel"
            tone="neutral"
            disabled={isLoading}
            onClick={onCancel}
          >
            취소
          </DialogActionButton>
          <DialogActionButton tone="primary" isLoading={isLoading} onClick={onConfirm}>
            탈퇴하기
          </DialogActionButton>
        </>
      }
    />
  );
}
