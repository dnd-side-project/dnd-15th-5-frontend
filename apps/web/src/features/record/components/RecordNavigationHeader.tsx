import { RECORD_EXIT_CONFIRM_TEXT } from '@chapchap/shared/record';
import { useState } from 'react';

import PageHeader from '@/shared/layout/PageHeader';
import { UnsavedChangesDialog } from '@/shared/ui/dialog';

type PendingExitAction = 'back' | 'close' | null;

type RecordNavigationHeaderProps = {
  /** 버튼 사이 가운데에 표시할 화면 제목입니다. */
  title?: string;
  onBack: () => void;
  onClose: () => void;
  /** 뒤로가기 전에 확인창을 띄울지 여부입니다. 기본값은 `false`입니다. */
  confirmBeforeBack?: boolean;
  /** 닫기 전에 확인창을 띄울지 여부입니다. 기본값은 `false`입니다. */
  confirmBeforeClose?: boolean;
};

/** 기록 플로우에서 이전 화면 이동과 홈으로 나가기를 제공하는 공통 헤더. */
export default function RecordNavigationHeader({
  title,
  onBack,
  onClose,
  confirmBeforeBack = false,
  confirmBeforeClose = false,
}: RecordNavigationHeaderProps) {
  const [pendingExitAction, setPendingExitAction] = useState<PendingExitAction>(null);

  const handleBackClick = () => {
    if (confirmBeforeBack) {
      setPendingExitAction('back');
      return;
    }

    onBack();
  };

  const handleCloseClick = () => {
    if (confirmBeforeClose) {
      setPendingExitAction('close');
      return;
    }

    onClose();
  };

  const handleExit = () => {
    const action = pendingExitAction;
    setPendingExitAction(null);

    if (action === 'back') {
      onBack();
      return;
    }

    onClose();
  };

  return (
    <>
      <PageHeader
        title={title}
        onBack={handleBackClick}
        onClose={handleCloseClick}
        closeButtonLabel="기록 닫고 홈으로 이동"
      />

      {pendingExitAction && (
        <UnsavedChangesDialog
          title={RECORD_EXIT_CONFIRM_TEXT.title}
          description={RECORD_EXIT_CONFIRM_TEXT.description}
          exitLabel={RECORD_EXIT_CONFIRM_TEXT.exit}
          continueLabel={RECORD_EXIT_CONFIRM_TEXT.continue}
          onExit={handleExit}
          onContinue={() => setPendingExitAction(null)}
        />
      )}
    </>
  );
}
