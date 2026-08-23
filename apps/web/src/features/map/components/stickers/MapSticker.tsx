import { AdvancedMarker } from '@vis.gl/react-google-maps';

import { cn } from '@/shared/lib/cn';

import type { MapSticker as MapStickerData } from '../../types';

const VISIT_BADGE_THRESHOLD = 2;

type MapStickerProps = {
  isSelected: boolean;
  onSelect: () => void;
  sticker: MapStickerData;
};

/** 지도 위 스티커 하나. 선택하면 70px로 확대하며, 방문 2회 이상이면 (+N) 배지를 표시한다. */
export default function MapSticker({ isSelected, onSelect, sticker }: MapStickerProps) {
  const { image, label, position, visitCount } = sticker;
  const isVisitBadgeVisible = visitCount >= VISIT_BADGE_THRESHOLD;

  return (
    <AdvancedMarker
      position={position}
      anchorLeft="-50%"
      anchorTop="-50%"
      zIndex={isSelected ? 1 : undefined}
      title={`${label} 스티커${isSelected ? ', 선택됨' : ''}`}
      onClick={onSelect}
    >
      <div className="relative">
        <img
          src={image}
          alt=""
          className={cn(
            'drop-shadow-sticker transition-[width,height] duration-200',
            isSelected ? 'size-17.5' : 'size-12.5'
          )}
        />
        {isVisitBadgeVisible && (
          <span className="pointer-events-none absolute top-0 -right-3 flex items-center justify-center rounded-full bg-neutral-700 px-2 py-0.5 text-label-01-medium text-neutral-00">
            +{visitCount}
          </span>
        )}
      </div>
    </AdvancedMarker>
  );
}
