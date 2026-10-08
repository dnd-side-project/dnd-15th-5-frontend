import CameraIcon from '@chapchap/shared/assets/icons/ic-sticker-camera.svg?react';
import DefaultStickerIcon from '@chapchap/shared/assets/icons/ic-sticker-default.svg?react';
import GalleryIcon from '@chapchap/shared/assets/icons/ic-sticker-gallery.svg?react';
import { useRef } from 'react';

import { CloseIcon } from '@/shared/assets/icons';
import { isNativeApp } from '@/shared/lib/bridge';
import { cn } from '@/shared/lib/cn';

import StickerCropper from './StickerCropper';
import StickerRecordPreview from './StickerRecordPreview';
import { useStickerPoc } from './useStickerPoc';
import './StickerPoc.css';

import type { ChangeEvent } from 'react';

type StickerPocProps = {
  onClose: () => void;
};

export default function StickerPoc({ onClose }: StickerPocProps) {
  const isApp = isNativeApp();
  const galleryInput = useRef<HTMLInputElement>(null);
  const {
    stage,
    isCapturing,
    capturePhoto,
    result,
    original,
    isProcessing,
    message,
    error,
    cropSource,
    isCropping,
    openCrop,
    confirmCrop,
    reset,
    retry,
    confirm,
    selectDefaultSticker,
  } = useStickerPoc();
  const isPreview = stage === 'preview';
  const isDark = isPreview || stage === 'crop';
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) openCrop(file);
  };
  const handleRetake = () => {
    reset();
    if (isApp) void capturePhoto();
    else galleryInput.current?.click();
  };

  return (
    <main className={cn('sticker-poc', isDark && 'sticker-poc--dark')}>
      <input
        ref={galleryInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageChange}
        className="hidden"
        aria-label="사진 가져오기"
      />
      {stage !== 'crop' && (
        <header className="sticker-poc__header">
          {stage !== 'select' && <h1>{isPreview ? '스티커 생성' : '기록하기'}</h1>}
          <button type="button" className="sticker-poc__close" aria-label="닫기" onClick={onClose}>
            <CloseIcon aria-hidden="true" />
          </button>
        </header>
      )}
      {stage === 'crop' && cropSource && (
        <StickerCropper
          key={cropSource.url}
          src={cropSource.url}
          isCropping={isCropping}
          onCancel={reset}
          onConfirm={(crop) => void confirmCrop(crop)}
        />
      )}
      {stage === 'select' && (
        <section className="sticker-poc__method">
          <h1 className="sticker-poc__title">오늘의 방문을 사진으로 남겨요</h1>
          <div className={cn('sticker-poc__choices', !isApp && 'sticker-poc__choices--web')}>
            {isApp && (
              <button
                type="button"
                className="sticker-poc__choice sticker-poc__choice--camera"
                disabled={isCapturing}
                onClick={() => void capturePhoto()}
              >
                <CameraIcon aria-hidden="true" />
                촬영하기
              </button>
            )}
            <button
              type="button"
              className="sticker-poc__choice"
              disabled={isCapturing}
              onClick={() => galleryInput.current?.click()}
            >
              <GalleryIcon aria-hidden="true" />
              이미지 가져오기
            </button>
          </div>
          <div className="sticker-poc__divider">빠른 추가</div>
          <button
            type="button"
            className="sticker-poc__default"
            disabled={isCapturing}
            onClick={selectDefaultSticker}
          >
            <DefaultStickerIcon aria-hidden="true" />
            기본 스티커로 기록하기
          </button>
          {isCapturing && (
            <p role="status" className="mt-4 text-center text-body-02-regular text-neutral-500">
              카메라를 열고 있어요
            </p>
          )}
        </section>
      )}
      {isPreview && (
        <>
          <div className="sticker-poc__photo">
            {original && (
              <img src={original} alt="선택한 원본 사진" className="sticker-poc__original" />
            )}
            <div className="sticker-poc__shade" />
            {result && (
              <img src={result.sticker} alt="생성한 스티커" className="sticker-poc__result" />
            )}
            {isProcessing && (
              <div role="status" className="relative px-8 text-center">
                <div className="mx-auto mb-5 size-8 animate-spin rounded-full border-2 border-neutral-00 border-t-transparent" />
                <p>{message}</p>
              </div>
            )}
          </div>
          <div className="sticker-poc__footer">
            {error && (
              <div role="alert" className="text-body-02-regular">
                <p>{error}</p>
                <button type="button" className="mt-2 underline" onClick={retry}>
                  다시 시도
                </button>
              </div>
            )}
            <div className="sticker-poc__actions">
              <button type="button" onClick={isProcessing ? reset : handleRetake}>
                {isProcessing ? '취소' : isApp ? '다시 찍기' : '다른 사진 선택'}
              </button>
              <button type="button" disabled={!result || isProcessing} onClick={confirm}>
                이 스티커 사용
              </button>
            </div>
          </div>
        </>
      )}
      {stage === 'record' && result && (
        <StickerRecordPreview sticker={result.sticker} onChangeImage={reset} />
      )}
      {!isPreview && error && (
        <p role="alert" className="px-4 pb-5 text-body-02-regular text-notification">
          {error}
        </p>
      )}
    </main>
  );
}
