import { useState } from 'react';

import { CloseIcon } from '@/shared/assets/icons';
import { BackButton } from '@/shared/ui/back-button';
import { Button } from '@/shared/ui/button';

import RecordExitConfirmDialog from './RecordExitConfirmDialog';

type PendingExitAction = 'back' | 'close' | null;

type RecordNavigationHeaderProps = {
  onBack: () => void;
  onClose: () => void;
  /** 뒤로가기 전에 확인창을 띄울지 여부입니다. 기본값은 `false`입니다. */
  confirmBeforeBack?: boolean;
  /** 닫기 전에 확인창을 띄울지 여부입니다. 기본값은 `false`입니다. */
  confirmBeforeClose?: boolean;
};

/** 기록 플로우에서 이전 화면 이동과 홈으로 나가기를 제공하는 공통 헤더. */
export default function RecordNavigationHeader({
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
      <div className="flex items-start justify-between">
        <BackButton onClick={handleBackClick} />
        <Button
          variant="icon"
          aria-label="기록 닫고 홈으로 이동"
          onClick={handleCloseClick}
          className="mt-4 size-6 text-neutral-700 [&_svg]:size-3.5"
        >
          <CloseIcon aria-hidden="true" />
        </Button>
      </div>

      {pendingExitAction && (
        <RecordExitConfirmDialog
          onExit={handleExit}
          onContinue={() => setPendingExitAction(null)}
        />
      )}
    </>
  );
}
