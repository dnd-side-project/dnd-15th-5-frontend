import { useState } from 'react';

import PageHeader from '@/shared/layout/page-header';

import RecordExitDialog from './RecordExitDialog';

type RecordNavigationHeaderProps = {
  /** 버튼 사이 가운데에 표시할 화면 제목입니다. */
  title?: string;
  closeButtonLabel?: string;
  onBack?: () => void;
  onClose: () => void;
  /** 닫기 전에 확인창을 띄울지 여부입니다. 기본값은 `false`입니다. */
  confirmBeforeClose?: boolean;
};

/** 기록 플로우에서 이전 화면 이동과 종료를 제공하는 공통 헤더입니다. */
export default function RecordNavigationHeader({
  title,
  closeButtonLabel = '기록 닫고 홈으로 이동',
  onBack,
  onClose,
  confirmBeforeClose = false,
}: RecordNavigationHeaderProps) {
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

  const handleCloseClick = () => {
    if (confirmBeforeClose) {
      setIsExitConfirmOpen(true);
      return;
    }

    onClose();
  };

  const handleExit = () => {
    setIsExitConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <PageHeader
        title={title}
        onBack={onBack}
        onClose={handleCloseClick}
        closeButtonLabel={closeButtonLabel}
      />

      {isExitConfirmOpen && (
        <RecordExitDialog onExit={handleExit} onContinue={() => setIsExitConfirmOpen(false)} />
      )}
    </>
  );
}
