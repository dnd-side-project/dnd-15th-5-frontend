import { STICKER_FLOW_HEADER_TOP_CLASS } from '@/features/record/sticker/constants';
import PageHeader from '@/shared/layout/PageHeader';

type StickerFlowHeaderProps = {
  title?: string;
  tone?: 'default' | 'inverse';
  onClose: () => void;
};

/** 스티커 작업 화면 상단에 제목과 기록 종료 버튼을 표시합니다. */
export default function StickerFlowHeader({
  title,
  tone = 'default',
  onClose,
}: StickerFlowHeaderProps) {
  return (
    <div className={`absolute inset-x-4 ${STICKER_FLOW_HEADER_TOP_CLASS}`}>
      <PageHeader
        title={title}
        tone={tone}
        onClose={onClose}
        closeButtonLabel="기록 닫고 홈으로 이동"
        className="h-6 py-0"
      />
    </div>
  );
}
