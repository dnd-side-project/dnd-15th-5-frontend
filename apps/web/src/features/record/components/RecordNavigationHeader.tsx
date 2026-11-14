import { useState } from 'react';

import PageHeader from '@/shared/layout/page-header';

import RecordExitDialog from './RecordExitDialog';

type PendingExitAction = 'back' | 'close' | null;

type RecordNavigationHeaderProps = {
  /** 버튼 사이 가운데에 표시할 화면 제목입니다. */
  title?: string;
  showBack?: boolean;
  closeButtonLabel?: string;
  onBack: () => void;
  onClose: () => void;
  /** 뒤로가기 전에 확인창을 띄울지 여부입니다. 기본값은 `false`입니다. */
  confirmBeforeBack?: boolean;
  /** 닫기 전에 확인창을 띄울지 여부입니다. 기본값은 `false`입니다. */
  confirmBeforeClose?: boolean;
};

/** 기록 플로우에서 이전 화면 이동과 종료를 제공하는 공통 헤더입니다. */
export default function RecordNavigationHeader({
  title,
  showBack = true,
  closeButtonLabel = '기록 닫고 홈으로 이동',
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
        onBack={showBack ? handleBackClick : undefined}
        onClose={handleCloseClick}
        closeButtonLabel={closeButtonLabel}
      />

      {pendingExitAction && (
        <RecordExitDialog onExit={handleExit} onContinue={() => setPendingExitAction(null)} />
      )}
    </>
  );
}
