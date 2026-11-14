import { RECORD_EXIT_CONFIRM_TEXT } from '@chapchap/shared/record';

import { UnsavedChangesDialog } from '@/shared/ui/dialog';

type RecordExitDialogProps = {
  onExit: () => void;
  onContinue: () => void;
};

/** 저장하지 않은 기록 작성을 중단할지 확인합니다. */
export default function RecordExitDialog({ onExit, onContinue }: RecordExitDialogProps) {
  return (
    <UnsavedChangesDialog
      title={RECORD_EXIT_CONFIRM_TEXT.title}
      description={RECORD_EXIT_CONFIRM_TEXT.description}
      exitLabel={RECORD_EXIT_CONFIRM_TEXT.exit}
      continueLabel={RECORD_EXIT_CONFIRM_TEXT.continue}
      onExit={onExit}
      onContinue={onContinue}
    />
  );
}
