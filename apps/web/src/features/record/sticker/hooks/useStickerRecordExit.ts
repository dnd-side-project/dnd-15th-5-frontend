import { useState } from 'react';

type StickerRecordExitOptions = {
  isEditing: boolean;
  hasStarted: boolean;
  onExit: () => void;
};

/** 새 기록은 작성 시작 후 종료를 확인하고, 기존 기록 수정은 상위 이탈 확인에 위임합니다. */
export const useStickerRecordExit = ({
  isEditing,
  hasStarted,
  onExit,
}: StickerRecordExitOptions) => {
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const requestClose = () => {
    if (isEditing || !hasStarted) onExit();
    else setIsExitConfirmOpen(true);
  };
  return {
    isExitConfirmOpen,
    requestClose,
    continueWriting: () => setIsExitConfirmOpen(false),
  };
};
