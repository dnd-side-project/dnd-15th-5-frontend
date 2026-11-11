import { STICKER_FLOW_HEADER_TOP_CLASS } from '@/features/record/sticker/constants';
import PageHeader from '@/shared/layout/PageHeader';
import { cn } from '@/shared/lib/cn';

type StickerFlowHeaderProps = {
  title?: string;
  tone?: 'default' | 'inverse';
  isChangingImage?: boolean;
  onBack?: () => void;
  onClose: () => void;
  className?: string;
};

/** 일반 기록의 뒤로가기·종료와, 이미지 변경 중 기존 폼으로 돌아가는 변경 취소를 구분합니다. */
export default function StickerFlowHeader({
  title,
  tone = 'default',
  isChangingImage = false,
  onBack,
  onClose,
  className,
}: StickerFlowHeaderProps) {
  return (
    <div className={cn('absolute inset-x-4', STICKER_FLOW_HEADER_TOP_CLASS, className)}>
      <PageHeader
        title={title}
        tone={tone}
        onBack={isChangingImage ? undefined : onBack}
        onClose={isChangingImage ? undefined : onClose}
        closeButtonLabel="기록 닫고 홈으로 이동"
        className="h-6 py-0"
      />
      {isChangingImage && (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'absolute top-1/2 right-0 min-h-10 -translate-y-1/2 rounded-full px-1 text-body-02-medium',
            tone === 'inverse' ? 'text-neutral-00' : 'text-neutral-700'
          )}
        >
          변경 취소
        </button>
      )}
    </div>
  );
}
