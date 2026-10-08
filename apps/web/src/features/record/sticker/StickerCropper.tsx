import { useRef, useState } from 'react';

import { CheckIcon } from '@/shared/assets/icons';
import { BackButton } from '@/shared/ui/back-button';

import { FULL_STICKER_CROP, moveCropCorner } from './stickerImage';

import type { StickerCrop, StickerCropCorner } from './stickerImage';
import type { CSSProperties, PointerEvent } from 'react';

type StickerCropperProps = {
  src: string;
  isCropping: boolean;
  onCancel: () => void;
  onConfirm: (crop: StickerCrop) => void;
};

const CROP_CORNERS: { corner: StickerCropCorner; label: string }[] = [
  { corner: 'top-left', label: '왼쪽 위' },
  { corner: 'top-right', label: '오른쪽 위' },
  { corner: 'bottom-left', label: '왼쪽 아래' },
  { corner: 'bottom-right', label: '오른쪽 아래' },
];
// NOTE: 모서리 두 개가 겹쳐 더 이상 잡을 수 없게 되지 않도록 화면 기준 최소 크기를 유지한다.
const MIN_CROP_SIZE = 48;

const toPercent = (value: number) => `${value * 100}%`;

/** 시안 REC_Crop을 기준으로 가져온 사진의 네 모서리를 드래그해 자를 영역을 정합니다. */
export default function StickerCropper({
  src,
  isCropping,
  onCancel,
  onConfirm,
}: StickerCropperProps) {
  const imageBox = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState<number | null>(null);
  const [crop, setCrop] = useState(FULL_STICKER_CROP);
  const [activeCorner, setActiveCorner] = useState<StickerCropCorner | null>(null);

  const handlePointerDown = (corner: StickerCropCorner) => (event: PointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setActiveCorner(corner);
  };
  const handlePointerMove = (event: PointerEvent) => {
    const box = imageBox.current?.getBoundingClientRect();
    if (!activeCorner || !box || box.width === 0 || box.height === 0) return;
    setCrop((current) =>
      moveCropCorner(
        current,
        activeCorner,
        { x: (event.clientX - box.left) / box.width, y: (event.clientY - box.top) / box.height },
        {
          width: Math.min(1, MIN_CROP_SIZE / box.width),
          height: Math.min(1, MIN_CROP_SIZE / box.height),
        }
      )
    );
  };
  const handlePointerEnd = () => setActiveCorner(null);
  const frameStyle = {
    left: toPercent(crop.left),
    top: toPercent(crop.top),
    width: toPercent(crop.right - crop.left),
    height: toPercent(crop.bottom - crop.top),
  };

  return (
    <>
      <header className="sticker-poc__header">
        <BackButton
          variant="light"
          onClick={onCancel}
          aria-label="사진 다시 선택"
          className="sticker-poc__back mt-0"
        />
        <h1>사진 자르기</h1>
        <button
          type="button"
          className="sticker-poc__confirm"
          aria-label="자르기 완료"
          disabled={!ratio || isCropping}
          onClick={() => onConfirm(crop)}
        >
          <CheckIcon aria-hidden="true" />
        </button>
      </header>
      <div className="sticker-poc__crop-area">
        <div className="sticker-poc__crop-stage">
          <div
            ref={imageBox}
            className="sticker-poc__crop-image"
            style={{ '--crop-ratio': ratio ?? 1 } as CSSProperties}
          >
            <img
              src={src}
              alt="자를 사진"
              draggable={false}
              onLoad={(event) =>
                setRatio(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)
              }
            />
            {/* NOTE: 바깥 어둡게 처리는 이미지 영역으로 잘라야 해서, 모서리 터치 영역과 분리한다. */}
            <div className="sticker-poc__crop-shade" aria-hidden="true">
              <div style={frameStyle} />
            </div>
            <div className="sticker-poc__crop-frame" style={frameStyle}>
              {CROP_CORNERS.map(({ corner, label }) => (
                <span
                  key={corner}
                  aria-label={`${label} 모서리`}
                  className={`sticker-poc__crop-handle sticker-poc__crop-handle--${corner}`}
                  onPointerDown={handlePointerDown(corner)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerEnd}
                  onPointerCancel={handlePointerEnd}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="sticker-poc__crop-guide">
        {isCropping ? '사진을 자르고 있어요' : '모서리를 드래그하여 자르기'}
      </p>
    </>
  );
}
