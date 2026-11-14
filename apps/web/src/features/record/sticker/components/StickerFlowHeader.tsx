import { getStickerFlowLayout } from '@/features/record/sticker/constants';
import PageHeader from '@/shared/layout/page-header';
import { isNativeApp } from '@/shared/lib/bridge';

type StickerFlowHeaderProps = {
  title?: string;
  tone?: 'default' | 'inverse';
  onClose: () => void;
  closeButtonLabel?: string;
};

/** 스티커 작업 화면 상단에 제목과 기록 종료 버튼을 표시합니다. */
export default function StickerFlowHeader({
  title,
  tone = 'default',
  onClose,
  closeButtonLabel = '기록 닫고 홈으로 이동',
}: StickerFlowHeaderProps) {
  const layout = getStickerFlowLayout(isNativeApp());
  return (
    <div className={`absolute inset-x-4 ${layout.headerTop}`}>
      <PageHeader
        title={title}
        tone={tone}
        onClose={onClose}
        closeButtonLabel={closeButtonLabel}
        className="h-6 py-0"
      />
    </div>
  );
}
