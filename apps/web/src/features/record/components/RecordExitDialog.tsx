import { RECORD_EXIT_CONFIRM_TEXT, IMAGE_CHANGE_EXIT_CONFIRM_TEXT } from '@chapchap/shared/record';

import { UnsavedChangesDialog } from '@/shared/ui/dialog';

type RecordExitDialogProps = {
  mode?: 'record' | 'imageChange';
  onExit: () => void;
  onContinue: () => void;
};

/** 저장하지 않은 기록 작성을 중단할지 확인합니다. */
export default function RecordExitDialog({
  onExit,
  onContinue,
  mode = 'record',
}: RecordExitDialogProps) {
  const text = mode === 'imageChange' ? IMAGE_CHANGE_EXIT_CONFIRM_TEXT : RECORD_EXIT_CONFIRM_TEXT;
  return (
    <UnsavedChangesDialog
      title={text.title}
      description={text.description}
      exitLabel={text.exit}
      continueLabel={text.continue}
      onExit={onExit}
      onContinue={onContinue}
    />
  );
}
