import { useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';

import {
  createShopStickerPlacements,
  createShopStickerStampDelays,
  getShopStickerSlotStyle,
  getShopStickerStampDuration,
  MAX_HERO_STICKER_COUNT,
} from './shopStickerHeroLayout';

import './shopStickerHero.css';

import type { CSSProperties, ReactNode } from 'react';

const STICKER_LOAD_FALLBACK_MS = 400;

const STAMP_PLAYING_CLASS = 'shop-sticker-hero__stamp--playing';
const STAMP_PLAYING_NEWEST_CLASS = 'shop-sticker-hero__stamp--playing-newest';

type ShopStickerHeroProps = {
  headerContent: ReactNode;
  /** 나머지 스티커가 다 찍힌 뒤 마지막으로 강조 등장시킬 스티커의 인덱스 */
  newestStickerIndex?: number;
  placeId: number;
  stickerImages: readonly string[];
};

export default function ShopStickerHero({
  headerContent,
  newestStickerIndex,
  placeId,
  stickerImages,
}: ShopStickerHeroProps) {
  const visibleStickerImages = stickerImages.slice(0, MAX_HERO_STICKER_COUNT);
  const placements = useMemo(
    () => createShopStickerPlacements(placeId, visibleStickerImages.length),
    [placeId, visibleStickerImages.length]
  );
  const stampDelays = useMemo(
    () => createShopStickerStampDelays(visibleStickerImages.length, newestStickerIndex),
    [newestStickerIndex, visibleStickerImages.length]
  );

  // NOTE: 스티커가 하나도 없으면 로드를 기다릴 필요가 없어 처음부터 준비된 상태로 시작한다.
  const [isReady, setIsReady] = useState(() => visibleStickerImages.length === 0);
  const hasStartedRef = useRef(isReady);
  const loadedCountRef = useRef(0);

  useEffect(() => {
    if (visibleStickerImages.length === 0) return;

    // NOTE: WebView 초기 로딩이 느려 이미지가 뜨기 전에 애니메이션이 끝나는 것을 막기 위해
    // 모든 이미지의 onLoad를 기다리되, 캐시 등으로 onLoad가 안 오는 경우를 대비한 폴백을 둔다.
    const timeoutId = window.setTimeout(() => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;
      setIsReady(true);
    }, STICKER_LOAD_FALLBACK_MS);

    return () => window.clearTimeout(timeoutId);
  }, [visibleStickerImages.length]);

  const handleStickerLoad = () => {
    loadedCountRef.current += 1;
    if (loadedCountRef.current < visibleStickerImages.length) return;
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    setIsReady(true);
  };

  return (
    <div className="relative h-75.25 shrink-0 overflow-hidden bg-[linear-gradient(to_bottom,transparent_25%,var(--color-primary-100)_100%)]">
      <div className="absolute top-0 left-4 z-10">{headerContent}</div>

      <div aria-label="최근 획득한 스티커" className="absolute inset-0">
        {visibleStickerImages.map((stickerImage, index) => {
          const placement = placements[index];
          if (!placement) return null;

          const slotStyle = getShopStickerSlotStyle(placement) satisfies CSSProperties;

          return (
            <ShopStickerStamp
              key={`${stickerImage}-${index}`}
              delayMs={stampDelays[index] ?? 0}
              isNewest={index === newestStickerIndex}
              isReady={isReady}
              onLoad={handleStickerLoad}
              slotStyle={slotStyle}
              src={stickerImage}
            />
          );
        })}
      </div>
    </div>
  );
}

type ShopStickerStampProps = {
  delayMs: number;
  isNewest: boolean;
  isReady: boolean;
  onLoad: () => void;
  slotStyle: CSSProperties;
  src: string;
};

/**
 * 스티커 한 장을 도장 찍듯 등장시킵니다.
 * 위치·기본 기울기는 바깥 span이, 등장 애니메이션은 안쪽 img가 각각 담당합니다.
 * 한 요소에 합치면 애니메이션 종료 시 transform이 덮어써져 기본 기울기가 사라집니다.
 * 재생 중에만 will-change를 두기 위해, 재생이 끝나면 DOM에서 직접 재생 클래스를 제거한다.
 */
function ShopStickerStamp({
  delayMs,
  isNewest,
  isReady,
  onLoad,
  slotStyle,
  src,
}: ShopStickerStampProps) {
  return (
    <span className="absolute" style={slotStyle}>
      <img
        alt=""
        className={cn(
          'shop-sticker-hero__stamp h-full w-full object-contain',
          isReady && (isNewest ? STAMP_PLAYING_NEWEST_CLASS : STAMP_PLAYING_CLASS)
        )}
        onAnimationEnd={(event) => {
          event.currentTarget.classList.remove(STAMP_PLAYING_CLASS, STAMP_PLAYING_NEWEST_CLASS);
        }}
        onLoad={onLoad}
        src={src}
        style={{
          animationDelay: `${delayMs}ms`,
          animationDuration: `${getShopStickerStampDuration(isNewest)}ms`,
        }}
      />
    </span>
  );
}
