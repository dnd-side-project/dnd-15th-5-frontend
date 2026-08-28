import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';

import {
  createShopStickerPlacements,
  createShopStickerStampDelays,
  getShopStickerSlotStyle,
  getShopStickerStampDuration,
  mixShopStickerImages,
} from './shopStickerHeroLayout';
import {
  hasPlayedShopStickerHeroAnimation,
  markShopStickerHeroAnimationPlayed,
} from './shopStickerHeroPlayback';

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
  const mixedStickerImages = mixShopStickerImages(stickerImages);
  const placements = useMemo(
    () => createShopStickerPlacements(placeId, mixedStickerImages.length),
    [placeId, mixedStickerImages.length]
  );
  const stampDelays = useMemo(
    () => createShopStickerStampDelays(mixedStickerImages.length, newestStickerIndex),
    [newestStickerIndex, mixedStickerImages.length]
  );
  const stickerSetKey = JSON.stringify([placeId, newestStickerIndex, mixedStickerImages]);
  // NOTE: 매장별로 한 세션에 처음 진입했을 때만 등장 애니메이션을 재생한다. 이후 재방문에서는
  // 결과 상태를 바로 보여준다.
  const [hasPlayedBefore] = useState(() => hasPlayedShopStickerHeroAnimation(placeId));
  const [hasPlayedInCurrentMount, setHasPlayedInCurrentMount] = useState(false);
  const handleAnimationStart = useCallback(() => {
    setHasPlayedInCurrentMount(true);
    markShopStickerHeroAnimationPlayed(placeId);
  }, [placeId]);

  return (
    <div className="relative h-75.25 shrink-0 overflow-hidden bg-[linear-gradient(to_bottom,transparent_25%,var(--color-primary-100)_100%)]">
      <div className="absolute top-0 left-4 z-10">{headerContent}</div>

      {mixedStickerImages.length === 0 ? (
        <p className="absolute inset-x-0 bottom-6 text-center text-body-02-medium text-neutral-500">
          아직 획득한 스티커가 없어요
        </p>
      ) : (
        <ShopStickerCanvas
          key={stickerSetKey}
          newestStickerIndex={newestStickerIndex}
          onAnimationStart={handleAnimationStart}
          placements={placements}
          skipAnimation={hasPlayedBefore || hasPlayedInCurrentMount}
          stampDelays={stampDelays}
          stickerImages={mixedStickerImages}
        />
      )}
    </div>
  );
}

type ShopStickerCanvasProps = {
  newestStickerIndex?: number;
  onAnimationStart: () => void;
  placements: ReturnType<typeof createShopStickerPlacements>;
  skipAnimation: boolean;
  stampDelays: readonly number[];
  stickerImages: readonly string[];
};

/** 이미지 집합이 바뀔 때 key로 다시 마운트되어 로드 진행 상태를 처음부터 계산합니다. */
function ShopStickerCanvas({
  newestStickerIndex,
  onAnimationStart,
  placements,
  skipAnimation,
  stampDelays,
  stickerImages,
}: ShopStickerCanvasProps) {
  // NOTE: 이 캔버스가 마운트된 뒤 부모의 세션 재생 상태가 바뀌더라도 이미 시작한 애니메이션은
  // 끝까지 유지한다. 이미지 집합이 바뀌어 key로 새 캔버스가 생길 때만 최신 상태를 반영한다.
  const [shouldAnimate] = useState(() => !skipAnimation && stickerImages.length > 0);
  const [isReady, setIsReady] = useState(() => !shouldAnimate);
  const hasStartedRef = useRef(isReady);
  const loadedCountRef = useRef(0);
  const startAnimation = useCallback(() => {
    if (hasStartedRef.current) return;

    hasStartedRef.current = true;
    onAnimationStart();
    setIsReady(true);
  }, [onAnimationStart]);

  useEffect(() => {
    if (!shouldAnimate) return;

    // NOTE: WebView 초기 로딩이 느려 이미지가 뜨기 전에 애니메이션이 끝나는 것을 막기 위해
    // 모든 이미지의 onLoad를 기다리되, 캐시 등으로 onLoad가 안 오는 경우를 대비한 폴백을 둔다.
    const timeoutId = window.setTimeout(startAnimation, STICKER_LOAD_FALLBACK_MS);

    return () => window.clearTimeout(timeoutId);
  }, [shouldAnimate, startAnimation, stickerImages.length]);

  const handleStickerLoad = () => {
    loadedCountRef.current += 1;
    if (loadedCountRef.current < stickerImages.length) return;
    startAnimation();
  };

  return (
    <div aria-label="획득한 스티커" className="absolute inset-0">
      {stickerImages.map((stickerImage, index) => {
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
            shouldAnimate={shouldAnimate}
            slotStyle={slotStyle}
            src={stickerImage}
          />
        );
      })}
    </div>
  );
}

type ShopStickerStampProps = {
  delayMs: number;
  isNewest: boolean;
  isReady: boolean;
  onLoad: () => void;
  shouldAnimate: boolean;
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
  shouldAnimate,
  slotStyle,
  src,
}: ShopStickerStampProps) {
  return (
    <span className="absolute" style={slotStyle}>
      <img
        alt=""
        className={cn(
          'shop-sticker-hero__stamp h-full w-full object-contain',
          shouldAnimate && isReady && (isNewest ? STAMP_PLAYING_NEWEST_CLASS : STAMP_PLAYING_CLASS)
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
