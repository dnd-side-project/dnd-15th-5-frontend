import CameraIcon from '@chapchap/shared/assets/icons/ic-sticker-camera.svg?react';
import DefaultStickerIcon from '@chapchap/shared/assets/icons/ic-sticker-default.svg?react';
import GalleryIcon from '@chapchap/shared/assets/icons/ic-sticker-gallery.svg?react';
import { useId } from 'react';

import { Button } from '@/shared/ui/button';
import { PickerSheet } from '@/shared/ui/picker-sheet';

type ImageChangeSheetProps = {
  onClose: () => void;
  onTakePhoto?: () => void;
  onImportImage: () => void;
  onSelectDefaultSticker: () => void;
};

/** 기록 폼 위에서 이미지를 바꿀 방법을 선택하며 취소 시 기존 이미지를 유지합니다. */
export default function ImageChangeSheet({
  onClose,
  onTakePhoto,
  onImportImage,
  onSelectDefaultSticker,
}: ImageChangeSheetProps) {
  const titleId = useId();
  const actions = [
    ...(onTakePhoto ? [{ label: '사진찍기', Icon: CameraIcon, onSelect: onTakePhoto }] : []),
    { label: '이미지 가져오기', Icon: GalleryIcon, onSelect: onImportImage },
    { label: '기본 스티커로 기록하기', Icon: DefaultStickerIcon, onSelect: onSelectDefaultSticker },
  ];

  return (
    <PickerSheet
      ariaLabelledBy={titleId}
      initialFocusSelector="[data-image-change-title]"
      onClose={onClose}
      snapPoint="medium"
      fitContent
      showHandle={false}
      overlayClassName="bg-neutral-900/30"
      contentClassName="pt-6 pb-[max(32px,env(safe-area-inset-bottom))]"
    >
      {({ close }) => (
        <>
          <h2
            id={titleId}
            data-image-change-title
            tabIndex={-1}
            className="text-title-01-bold text-neutral-700 outline-none"
          >
            이미지 변경
          </h2>
          <div className="mt-6 flex flex-col gap-4">
            {actions.map(({ label, Icon, onSelect }) => (
              <button
                key={label}
                type="button"
                onClick={() =>
                  close(() => {
                    onClose();
                    onSelect();
                  })
                }
                className="flex w-full items-center gap-4 rounded-16 text-left text-body-01-medium text-neutral-700"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-12 bg-primary-50 text-primary-500 [--sticker-primary:var(--color-primary-50)]">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                {label}
              </button>
            ))}
          </div>
          <Button
            onClick={() => close()}
            className="mt-8 bg-neutral-400 text-neutral-00 hover:bg-neutral-500"
          >
            취소하기
          </Button>
        </>
      )}
    </PickerSheet>
  );
}
