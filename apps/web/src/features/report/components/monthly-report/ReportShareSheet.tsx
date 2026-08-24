import { ImageDownloadIcon } from '@/shared/assets/icons';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';

type ReportShareSheetProps = {
  isDownloading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
};

export default function ReportShareSheet({
  isDownloading,
  isOpen,
  onClose,
  onDownload,
}: ReportShareSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      <button
        aria-label="공유 메뉴 닫기"
        className="mobile-frame fixed inset-0 z-modal-backdrop bg-neutral-900/20"
        onClick={onClose}
        type="button"
      />
      <BottomSheet
        contentClassName="pb-11.75"
        fitContent
        onSnapPointChange={(snapPoint) => snapPoint === 'hidden' && onClose()}
        snapPoint="medium"
        snapPoints={['hidden', 'medium']}
      >
        <div className="grid gap-2.5 pt-4">
          <Button isLoading={isDownloading} onClick={onDownload} size="medium" variant="secondary">
            <ImageDownloadIcon aria-hidden className="size-4" />
            이미지 저장
          </Button>
          <Button size="medium" variant="secondary">
            카카오톡으로 공유하기
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}
