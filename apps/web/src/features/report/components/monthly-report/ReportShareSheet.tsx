import { useRef } from 'react';

import { ImageDownloadIcon } from '@/shared/assets/icons';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';

type ReportShareSheetProps = {
  isDownloading: boolean;
  isSharing: boolean;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  onKakaoShare: () => void;
};

type ReportShareDialogProps = Omit<ReportShareSheetProps, 'isOpen'>;

function ReportShareDialog({
  isDownloading,
  isSharing,
  onClose,
  onDownload,
  onKakaoShare,
}: ReportShareDialogProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useScrollLock();
  useFocusTrap(sheetRef, {
    initialFocusSelector: '[data-report-share-download]',
    onEscape: onClose,
  });

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
        rootRef={sheetRef}
        snapPoint="medium"
        snapPoints={['hidden', 'medium']}
      >
        <section aria-labelledby="report-share-title" aria-modal="true" role="dialog">
          <h2 className="sr-only" id="report-share-title">
            취향 카드 공유하기
          </h2>
          <div className="grid gap-2.5 pt-4">
            <Button
              data-report-share-download
              isLoading={isDownloading}
              onClick={onDownload}
              size="medium"
              variant="secondary"
            >
              <ImageDownloadIcon aria-hidden className="size-4" />
              이미지 저장
            </Button>
            <Button isLoading={isSharing} onClick={onKakaoShare} size="medium" variant="secondary">
              카카오톡으로 공유하기
            </Button>
          </div>
        </section>
      </BottomSheet>
    </>
  );
}

/** 취향 카드의 이미지 저장과 외부 공유 동작을 제공하는 하단 패널입니다. */
export default function ReportShareSheet({
  isDownloading,
  isSharing,
  isOpen,
  onClose,
  onDownload,
  onKakaoShare,
}: ReportShareSheetProps) {
  if (!isOpen) return null;

  return (
    <ReportShareDialog
      isDownloading={isDownloading}
      isSharing={isSharing}
      onClose={onClose}
      onDownload={onDownload}
      onKakaoShare={onKakaoShare}
    />
  );
}
