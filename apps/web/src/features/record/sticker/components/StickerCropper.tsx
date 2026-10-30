import { useRef, useState } from 'react';

import {
  STICKER_FLOW_CROP_AREA_TOP,
  STICKER_FLOW_HEADER_HEIGHT_CLASS,
  STICKER_FLOW_HEADER_TOP_CLASS,
} from '@/features/record/sticker/constants';
import { FULL_STICKER_CROP, moveCropCorner } from '@/features/record/sticker/image/stickerImage';
import type { StickerCrop, StickerCropCorner } from '@/features/record/sticker/image/stickerImage';
import { CheckIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';
import { BackButton } from '@/shared/ui/back-button';

import type { CSSProperties, PointerEvent } from 'react';

type StickerCropperProps = {
  src: string;
  isCropping: boolean;
  onCancel: () => void;
  onConfirm: (crop: StickerCrop) => void;
};

const CROP_CORNERS: { corner: StickerCropCorner; label: string; positionClassName: string }[] = [
  { corner: 'top-left', label: '왼쪽 위', positionClassName: '-top-5.5 -left-5.5' },
  { corner: 'top-right', label: '오른쪽 위', positionClassName: '-top-5.5 -right-5.5' },
  { corner: 'bottom-left', label: '왼쪽 아래', positionClassName: '-bottom-5.5 -left-5.5' },
  { corner: 'bottom-right', label: '오른쪽 아래', positionClassName: '-bottom-5.5 -right-5.5' },
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
      <header className={cn('absolute inset-x-0 top-0 z-10', STICKER_FLOW_HEADER_HEIGHT_CLASS)}>
        <BackButton
          variant="light"
          onClick={onCancel}
          aria-label="사진 다시 선택"
          className={cn('absolute left-4 mt-0', STICKER_FLOW_HEADER_TOP_CLASS)}
        />
        <h1
          className={cn(
            'absolute inset-x-14 text-center text-title-02-semibold',
            STICKER_FLOW_HEADER_TOP_CLASS
          )}
        >
          사진 자르기
        </h1>
        <button
          type="button"
          className={cn(
            'absolute right-4 grid size-6 place-items-center',
            STICKER_FLOW_HEADER_TOP_CLASS
          )}
          aria-label="자르기 완료"
          disabled={!ratio || isCropping}
          onClick={() => onConfirm(crop)}
        >
          <CheckIcon className="h-3.5 w-4.25" aria-hidden="true" />
        </button>
      </header>
      {/* NOTE: 모서리 터치 영역의 가로 넘침을 막고, 절대 위치 영역으로 컨테이너 높이를 확정한다. */}
      <div
        className="absolute inset-x-0 bottom-0 overflow-hidden"
        style={{ top: STICKER_FLOW_CROP_AREA_TOP }}
      >
        <div className="absolute inset-x-4 top-20 bottom-0 flex flex-col items-center justify-start @container-size">
          <div
            ref={imageBox}
            className="relative max-w-full shrink-0 touch-none select-none aspect-(--crop-ratio)"
            style={
              {
                '--crop-ratio': ratio ?? 1,
                width: ratio ? `min(100cqw, calc((100cqh - 2.8125rem) * ${ratio}))` : '100cqw',
              } as CSSProperties
            }
          >
            <img
              src={src}
              alt="자를 사진"
              draggable={false}
              className="pointer-events-none block size-full"
              onLoad={(event) =>
                setRatio(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)
              }
            />
            {/* NOTE: 바깥 어둡게 처리는 이미지 영역으로 잘라야 해서, 모서리 터치 영역과 분리한다. */}
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden"
              aria-hidden="true"
            >
              <div
                className="absolute shadow-[0_0_0_100vmax] shadow-neutral-900/50"
                style={frameStyle}
              />
            </div>
            <div className="absolute border border-neutral-00" style={frameStyle}>
              {CROP_CORNERS.map(({ corner, label, positionClassName }) => (
                <span
                  key={corner}
                  aria-label={`${label} 모서리`}
                  className={cn('absolute size-11 touch-none', positionClassName)}
                  onPointerDown={handlePointerDown(corner)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerEnd}
                  onPointerCancel={handlePointerEnd}
                />
              ))}
            </div>
          </div>
          <p className="mt-7 shrink-0 text-center text-body-02-regular leading-4.25 text-neutral-500">
            {isCropping ? '사진을 자르고 있어요' : '모서리를 드래그하여 자르기'}
          </p>
        </div>
      </div>
    </>
  );
}
