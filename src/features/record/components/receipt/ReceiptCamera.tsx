import { useRef } from 'react';

import { useReceiptCamera } from '@/features/record/hooks/receipt/useReceiptCamera';

type ReceiptCameraProps = {
  onClose: () => void;
};

function GalleryIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" className="h-7 w-7">
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="15"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="8.5" cy="9" r="1.5" fill="currentColor" />
      <path
        d="m5.5 17 4.2-4.2a1 1 0 0 1 1.4 0l2.15 2.15 1.65-1.65a1 1 0 0 1 1.4 0l2.2 2.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" className="h-7 w-7">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function ReceiptCamera({ onClose }: ReceiptCameraProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    errorMessage,
    isCameraReady,
    photoUrl,
    retakePhoto,
    selectPhoto,
    startCamera,
    stopCamera,
    takePhoto,
    videoRef,
  } = useReceiptCamera();

  const handleCameraClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <section className="relative h-dvh w-full overflow-hidden bg-black" aria-label="영수증 촬영">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        aria-label="카메라 미리보기"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {photoUrl && (
        <img
          src={photoUrl}
          alt="촬영한 사진 미리보기"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[15%] bg-black/75" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[21%] bg-black/80 backdrop-blur-[2px]" />

      <header className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1.25rem,env(safe-area-inset-right))] pl-[max(1.25rem,env(safe-area-inset-left))] text-white">
        <button
          type="button"
          aria-label="카메라 닫기"
          onClick={handleCameraClose}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black/20"
        >
          <CloseIcon />
        </button>
        <p className="text-sm font-medium text-white/90">영수증을 사각형 안에 맞춰주세요</p>
        <span className="h-11 w-11" aria-hidden="true" />
      </header>

      <div
        className="pointer-events-none absolute top-[17%] right-[max(1.5rem,env(safe-area-inset-right))] bottom-[23%] left-[max(1.5rem,env(safe-area-inset-left))] z-10"
        aria-hidden="true"
      >
        <span className="absolute top-0 left-0 h-10 w-10 rounded-tl-lg border-t-2 border-l-2 border-white" />
        <span className="absolute top-0 right-0 h-10 w-10 rounded-tr-lg border-t-2 border-r-2 border-white" />
        <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-lg border-b-2 border-l-2 border-white" />
        <span className="absolute right-0 bottom-0 h-10 w-10 rounded-br-lg border-r-2 border-b-2 border-white" />
      </div>

      {!isCameraReady && !photoUrl && !errorMessage && (
        <p className="absolute inset-x-0 top-1/2 z-20 text-center text-sm text-white/80">
          카메라를 준비하고 있어요...
        </p>
      )}

      {errorMessage && (
        <div className="absolute inset-x-5 top-1/2 z-20 -translate-y-1/2 rounded-2xl bg-black/75 p-5 text-center text-white backdrop-blur-sm">
          <p role="alert" className="text-sm leading-6">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => void startCamera()}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-950"
          >
            다시 시도
          </button>
        </div>
      )}

      <div className="absolute right-0 bottom-0 left-0 z-20 grid h-[21%] grid-cols-3 items-center pr-[max(2rem,env(safe-area-inset-right))] pb-[env(safe-area-inset-bottom)] pl-[max(2rem,env(safe-area-inset-left))] text-white">
        <button
          type="button"
          aria-label="갤러리에서 사진 선택"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-12 w-12 items-center justify-center justify-self-start rounded-xl bg-white/10 transition active:scale-95"
        >
          <GalleryIcon />
        </button>

        {photoUrl ? (
          <button
            type="button"
            onClick={retakePhoto}
            className="h-16 min-w-24 justify-self-center rounded-full border-2 border-white bg-black/30 px-5 text-sm font-semibold"
          >
            다시 촬영
          </button>
        ) : (
          <button
            type="button"
            aria-label="사진 촬영"
            onClick={takePhoto}
            disabled={!isCameraReady}
            className="h-[4.75rem] w-[4.75rem] justify-self-center rounded-full border-[5px] border-white/70 bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.2)] transition active:scale-95 disabled:opacity-50"
          />
        )}

        <span aria-hidden="true" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => {
          selectPhoto(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
    </section>
  );
}
