import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { useId, useState } from 'react';

import type { MapSticker as MapStickerData } from '@/features/map/types';
import { cn } from '@/shared/lib/cn';

const VISIT_BADGE_THRESHOLD = 2;
const SELECTED_PIN_TIP_HEIGHT = 8;
const DEFAULT_PIN_SIZE = 46;
const SELECTED_PIN_SIZE = 66;
const DEFAULT_IMAGE_SIZE = 40;
const SELECTED_IMAGE_SIZE = 80;
const DEFAULT_BORDER_WIDTH = 1;
const SELECTED_BORDER_WIDTH = 2;
const PIN_TIP_HALF_WIDTH = 4;
const SQUARE_ASPECT_RATIO_LIMIT = 1.1;

type MapStickerProps = {
  isSelected: boolean;
  onSelect: () => void;
  sticker: MapStickerData;
};

/** 기록 이미지를 원형 핀에 표시하며 선택한 핀의 화살표 끝을 장소 좌표에 맞춥니다. */
export default function MapSticker({ isSelected, onSelect, sticker }: MapStickerProps) {
  const { image, label, position, visitCount } = sticker;
  const clipId = useId();
  const [loadedImage, setLoadedImage] = useState<{
    source: string;
    isLandscape: boolean;
    isSquare: boolean;
  } | null>(null);
  const isLandscape = loadedImage?.source === image && loadedImage.isLandscape;
  const isSquare = loadedImage?.source === image && loadedImage.isSquare;
  const isProtruding = isSelected && loadedImage?.source === image && !isSquare;
  const isVisitBadgeVisible = visitCount >= VISIT_BADGE_THRESHOLD;
  const additionalRecordCount = visitCount - 1;
  const pinSize = isSelected ? SELECTED_PIN_SIZE : DEFAULT_PIN_SIZE;
  const borderWidth = isSelected ? SELECTED_BORDER_WIDTH : DEFAULT_BORDER_WIDTH;
  const center = pinSize / 2;
  const imageInset = isSelected ? borderWidth : (pinSize - DEFAULT_IMAGE_SIZE) / 2;
  // 원의 안쪽 경계에 맞춰야 사진이 돌출 방향의 반대쪽 테두리를 덮지 않습니다.
  const shortImageSize = pinSize - imageInset * 2;
  const imageWidth = isProtruding && isLandscape ? SELECTED_IMAGE_SIZE : shortImageSize;
  const imageHeight = isProtruding && !isLandscape ? SELECTED_IMAGE_SIZE : shortImageSize;
  const imageX = isProtruding && isLandscape ? imageInset : (pinSize - imageWidth) / 2;
  const imageY =
    isProtruding && !isLandscape ? pinSize - imageInset - imageHeight : (pinSize - imageHeight) / 2;

  return (
    <AdvancedMarker
      position={position}
      anchorLeft="-50%"
      anchorTop={isSelected ? `calc(-100% - ${SELECTED_PIN_TIP_HEIGHT}px)` : '-50%'}
      zIndex={isSelected ? 1 : undefined}
      title={`${label} 스티커${isSelected ? ', 선택됨' : ''}`}
      onClick={onSelect}
    >
      <div
        className={cn('relative', isSelected ? 'size-16.5' : 'size-11.5')}
        data-analytics-id="map-place-sticker"
        data-state={isSelected ? 'selected' : 'default'}
      >
        {isSelected && (
          <div
            aria-hidden="true"
            data-map-sticker-glass
            className={cn(
              'pointer-events-none absolute inset-0 z-0 rounded-full bg-[#d9d9d9]/20',
              'backdrop-blur-[1.78px] backdrop-saturate-[1.15]',
              'shadow-[inset_1px_1px_1px_rgb(255_255_255/0.45),inset_-1px_-1px_2px_rgb(255_255_255/0.2)]',
              "after:absolute after:inset-0 after:rounded-[inherit] after:content-['']",
              'after:bg-[linear-gradient(135deg,rgb(255_255_255/0.32),rgb(255_255_255/0.04)_45%,transparent_70%)]'
            )}
          />
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={pinSize}
          height={pinSize}
          viewBox={`0 0 ${pinSize} ${pinSize}`}
          overflow="visible"
          aria-hidden="true"
          className="pointer-events-none relative z-10"
        >
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <circle cx={center} cy={center} r={center - borderWidth} />
              {isProtruding &&
                (isLandscape ? (
                  <rect
                    x={center}
                    y={imageInset}
                    width={imageX + imageWidth - center}
                    height={shortImageSize}
                  />
                ) : (
                  <rect x={imageInset} y={imageY} width={shortImageSize} height={center - imageY} />
                ))}
            </clipPath>
          </defs>
          {isSelected && (
            <path
              d={`M ${center - PIN_TIP_HALF_WIDTH} ${pinSize - borderWidth / 2} H ${center + PIN_TIP_HALF_WIDTH} L ${center} ${pinSize + SELECTED_PIN_TIP_HEIGHT} Z`}
              className="fill-primary-500"
            />
          )}
          <circle
            cx={center}
            cy={center}
            r={center - borderWidth / 2}
            fillOpacity={isSelected ? 0 : 0.5}
            strokeWidth={borderWidth}
            className={cn(
              'fill-neutral-00',
              isSelected ? 'stroke-primary-500' : 'stroke-neutral-00'
            )}
          />
          <image
            href={image}
            x={imageX}
            y={imageY}
            width={imageWidth}
            height={imageHeight}
            preserveAspectRatio={
              isProtruding ? (isLandscape ? 'xMinYMid meet' : 'xMidYMax meet') : 'xMidYMid meet'
            }
            clipPath={`url(#${clipId})`}
          />
        </svg>
        <img
          src={image}
          alt=""
          hidden
          onLoad={(event) => {
            const { naturalWidth, naturalHeight } = event.currentTarget;
            const shortSide = Math.min(naturalWidth, naturalHeight);
            setLoadedImage({
              source: image,
              isLandscape: naturalWidth > naturalHeight,
              isSquare:
                shortSide > 0 &&
                Math.max(naturalWidth, naturalHeight) / shortSide <= SQUARE_ASPECT_RATIO_LIMIT,
            });
          }}
        />
        {isVisitBadgeVisible && (
          <span className="pointer-events-none absolute -right-2 bottom-0 z-20 flex min-w-6 items-center justify-center rounded-full bg-primary-500 px-1.5 py-0.5 text-label-01-medium text-neutral-00">
            +{additionalRecordCount}
          </span>
        )}
      </div>
    </AdvancedMarker>
  );
}
