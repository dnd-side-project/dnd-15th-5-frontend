import { useRef } from 'react';

import { Dialog } from './Dialog';
import { DialogActionButton } from './DialogActionButton';

type UnsavedChangesDialogProps = {
  title: string;
  description: string;
  exitLabel: string;
  continueLabel: string;
  onExit: () => void;
  onContinue: () => void;
};

/**
 * 저장되지 않은 변경 사항을 버리고 나갈지, 편집을 계속할지 확인하는 다이얼로그입니다.
 * 편집 계속 버튼에 초기 포커스를 두며 Escape와 닫기 요청은 편집 계속 동작으로 처리합니다.
 *
 * @example
 * ```tsx
 * <UnsavedChangesDialog
 *   title="수정을 그만할까요?"
 *   description="지금까지 수정한 내용은 저장되지 않아요."
 *   exitLabel="그만하기"
 *   continueLabel="계속 수정하기"
 *   onExit={discardChanges}
 *   onContinue={closeDialog}
 * />
 * ```
 *
 * @param props - 확인 문구와 두 가지 선택 동작입니다.
 * @param props.title - 다이얼로그 제목입니다.
 * @param props.description - 변경 사항이 저장되지 않는다는 안내입니다.
 * @param props.exitLabel - 편집을 종료하는 버튼에 표시할 문구입니다.
 * @param props.continueLabel - 편집을 계속하는 버튼에 표시할 문구입니다.
 * @param props.onExit - 편집을 종료하기로 선택했을 때 호출됩니다.
 * @param props.onContinue - 편집을 계속하거나 다이얼로그를 닫기로 선택했을 때 호출됩니다.
 */
export default function UnsavedChangesDialog({
  title,
  description,
  exitLabel,
  continueLabel,
  onExit,
  onContinue,
}: UnsavedChangesDialogProps) {
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onContinue();
      }}
      title={title}
      description={description}
      initialFocusRef={continueButtonRef}
      actions={
        <>
          <DialogActionButton tone="neutral" onClick={onExit}>
            {exitLabel}
          </DialogActionButton>
          <DialogActionButton ref={continueButtonRef} tone="primary" onClick={onContinue}>
            {continueLabel}
          </DialogActionButton>
        </>
      }
    />
  );
}
