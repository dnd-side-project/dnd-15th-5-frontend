import { CloseIcon } from '@/shared/assets/icons';
import { BackButton } from '@/shared/ui/back-button';
import { Button } from '@/shared/ui/button';

type RecordNavigationHeaderProps = {
  onBack: () => void;
  onClose: () => void;
};

/** 기록 플로우에서 이전 화면 이동과 홈으로 나가기를 제공하는 공통 헤더. */
export default function RecordNavigationHeader({ onBack, onClose }: RecordNavigationHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <BackButton onClick={onBack} />
      <Button
        variant="icon"
        aria-label="기록 닫고 홈으로 이동"
        onClick={onClose}
        className="mt-4 size-6 text-neutral-700 [&_svg]:size-3.5"
      >
        <CloseIcon aria-hidden="true" />
      </Button>
    </div>
  );
}
