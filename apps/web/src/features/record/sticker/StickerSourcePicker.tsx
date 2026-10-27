import CameraIcon from '@chapchap/shared/assets/icons/ic-sticker-camera.svg?react';
import DefaultStickerIcon from '@chapchap/shared/assets/icons/ic-sticker-default.svg?react';
import GalleryIcon from '@chapchap/shared/assets/icons/ic-sticker-gallery.svg?react';

import { cn } from '@/shared/lib/cn';

type StickerSourcePickerProps = {
  isCapturing: boolean;
  onCapture?: () => void;
  onImportImage: () => void;
  onSelectDefaultSticker: () => void;
};

/** 촬영 가능 여부에 맞춰 사진·갤러리·기본 스티커 진입 메뉴를 표시합니다. */
export default function StickerSourcePicker({
  isCapturing,
  onCapture,
  onImportImage,
  onSelectDefaultSticker,
}: StickerSourcePickerProps) {
  return (
    <section className="px-4 pt-2 pb-8">
      <h1 className="text-heading-02-semibold leading-8.5 font-bold tracking-[-0.6px]">
        오늘의 방문을 사진으로 남겨요
      </h1>
      <div className={cn('mt-8.25 grid gap-3', onCapture ? 'grid-cols-2' : 'grid-cols-1')}>
        {onCapture && (
          <button
            type="button"
            className="flex h-40 flex-col items-center justify-center gap-4 rounded-16 bg-primary-500 text-body-01-medium text-neutral-00"
            disabled={isCapturing}
            onClick={onCapture}
          >
            <CameraIcon className="h-8 w-9" aria-hidden="true" />
            촬영하기
          </button>
        )}
        <button
          type="button"
          className="flex h-40 flex-col items-center justify-center gap-4 rounded-16 bg-primary-50 text-body-01-medium text-primary-500"
          disabled={isCapturing}
          onClick={onImportImage}
        >
          <GalleryIcon className="h-8 w-9" aria-hidden="true" />
          이미지 가져오기
        </button>
      </div>
      <div className="my-4 flex items-center gap-5.75 text-caption-01-regular leading-3.5 text-neutral-500 before:h-px before:flex-1 before:bg-neutral-300 before:content-[''] after:h-px after:flex-1 after:bg-neutral-300 after:content-['']">
        빠른 추가
      </div>
      <button
        type="button"
        className="flex h-18.25 w-full items-center justify-center gap-2.5 rounded-16 bg-primary-50 text-body-01-medium text-primary-500"
        disabled={isCapturing}
        onClick={onSelectDefaultSticker}
      >
        <DefaultStickerIcon className="size-6" aria-hidden="true" />
        기본 스티커로 기록하기
      </button>
      {isCapturing && (
        <p role="status" className="mt-4 text-center text-body-02-regular text-neutral-500">
          카메라를 열고 있어요
        </p>
      )}
    </section>
  );
}
