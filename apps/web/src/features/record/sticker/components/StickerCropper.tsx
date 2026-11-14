import { useRef, useState } from 'react';

import {
  STICKER_FLOW_HEADER_HEIGHT_CLASS,
  STICKER_FLOW_HEADER_TOP_CLASS,
} from '@/features/record/sticker/constants';
import { FULL_STICKER_CROP, moveCropCorner } from '@/features/record/sticker/image/stickerImage';
import type { StickerCrop, StickerCropCorner } from '@/features/record/sticker/image/stickerImage';
import PageHeader from '@/shared/layout/page-header';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';

import type { CSSProperties, PointerEvent } from 'react';

type StickerCropperProps = {
  src: string;
  initialCrop?: StickerCrop;
  isCropping: boolean;
  onCancel: () => void;
  onReselect: () => void;
  closeButtonLabel?: string;
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
  initialCrop = FULL_STICKER_CROP,
  isCropping,
  onCancel,
  onReselect,
  closeButtonLabel = '사진 자르기 닫기',
  onConfirm,
}: StickerCropperProps) {
  const imageBox = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState<number | null>(null);
  const [crop, setCrop] = useState(initialCrop);
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
      <div className={cn('relative shrink-0', STICKER_FLOW_HEADER_HEIGHT_CLASS)}>
        <PageHeader
          title="사진 자르기"
          tone="inverse"
          onClose={onCancel}
          closeButtonLabel={closeButtonLabel}
          className={cn('absolute inset-x-4 h-6 py-0', STICKER_FLOW_HEADER_TOP_CLASS)}
        />
      </div>
      {/* NOTE: 낮은 화면에서도 모서리를 조절할 공간을 확보하고, 부족한 높이는 상위 화면에서 스크롤한다. */}
      <div className="flex min-h-80 flex-1 flex-col overflow-hidden px-4 pt-16">
        <div className="flex min-h-0 flex-1 items-center justify-center @container-size">
          <div
            ref={imageBox}
            className="relative max-w-full shrink-0 touch-none select-none aspect-(--crop-ratio)"
            style={
              {
                '--crop-ratio': ratio ?? 1,
                width: ratio ? `min(100cqw, calc(100cqh * ${ratio}))` : '100cqw',
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
        </div>
        <p className="mt-5 shrink-0 text-center text-body-02-regular text-neutral-500">
          {isCropping ? '사진을 자르고 있어요' : '모서리를 드래그하여 자르기'}
        </p>
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-3 px-4 pt-8 pb-[max(32px,env(safe-area-inset-bottom))]">
        <Button
          onClick={onReselect}
          disabled={isCropping}
          className="bg-neutral-600 hover:bg-neutral-500 active:bg-neutral-700"
        >
          사진 다시 고르기
        </Button>
        <Button
          onClick={() => onConfirm(crop)}
          disabled={!ratio || isCropping}
          isLoading={isCropping}
        >
          스티커로 만들기
        </Button>
      </div>
    </>
  );
}
