import { AdvancedMarker } from '@vis.gl/react-google-maps';

import type { MapSticker as MapStickerData } from '../../types';

const VISIT_BADGE_THRESHOLD = 2;

type MapStickerProps = {
  sticker: MapStickerData;
};

/** 지도 위 스티커 하나. 방문 2회 이상이면 우측 상단에 (+N) 배지를 함께 보여준다. */
export default function MapSticker({ sticker }: MapStickerProps) {
  const { image, label, position, visitCount } = sticker;
  const isVisitBadgeVisible = visitCount >= VISIT_BADGE_THRESHOLD;

  return (
    <AdvancedMarker position={position} anchorLeft="-50%" anchorTop="-50%">
      <div className="relative">
        <img src={image} alt={label} className="size-15 drop-shadow-sticker" />
        {isVisitBadgeVisible && (
          <span className="absolute top-0 -right-3 flex items-center justify-center rounded-full bg-neutral-700 px-2 py-0.5 text-label-01-medium text-neutral-00">
            +{visitCount}
          </span>
        )}
      </div>
    </AdvancedMarker>
  );
}
