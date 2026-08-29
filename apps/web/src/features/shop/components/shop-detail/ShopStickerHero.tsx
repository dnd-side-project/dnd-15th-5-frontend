import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';

import '@/shared/styles/stickerStamp.css';

import {
  createShopStickerPlacements,
  createShopStickerStampDelays,
  getShopStickerSlotStyle,
  getShopStickerStampDuration,
  mixShopStickerImages,
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
  const [hasPlayedInCurrentMount, setHasPlayedInCurrentMount] = useState(false);
  const handleAnimationStart = useCallback(() => {
    setHasPlayedInCurrentMount(true);
  }, []);

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
          skipAnimation={hasPlayedInCurrentMount}
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
  // NOTE: 이 캔버스가 마운트된 뒤 부모에서 현재 진입의 재생 완료 상태가 바뀌더라도 애니메이션은
  // 끝까지 유지한다. 이미지 집합이 바뀌어 key로 새 캔버스가 생길 때만 최신 상태를 반영한다.
  const [shouldAnimate] = useState(() => !skipAnimation && stickerImages.length > 0);
  const [isReady, setIsReady] = useState(() => !shouldAnimate);
  const [replaySequences, setReplaySequences] = useState(() => stickerImages.map(() => 0));
  const hasStartedRef = useRef(isReady);
  const loadedCountRef = useRef(0);
  const nextReplaySequenceRef = useRef(0);
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
  const createReplaySequence = () => {
    nextReplaySequenceRef.current += 1;
    return nextReplaySequenceRef.current;
  };
  const replayAllStickers = () => {
    const replaySequence = createReplaySequence();
    setReplaySequences((current) => current.map(() => replaySequence));
  };
  const replaySticker = (targetIndex: number) => {
    const replaySequence = createReplaySequence();
    setReplaySequences((current) =>
      current.map((sequence, index) => (index === targetIndex ? replaySequence : sequence))
    );
  };

  return (
    <div role="group" aria-label="획득한 스티커" className="absolute inset-0">
      <button
        type="button"
        aria-label="모든 스티커 다시 붙이기"
        className="absolute inset-0 cursor-pointer bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-inset"
        onClick={replayAllStickers}
      />

      {stickerImages.map((stickerImage, index) => {
        const placement = placements[index];
        if (!placement) return null;

        const slotStyle = getShopStickerSlotStyle(placement) satisfies CSSProperties;
        const replaySequence = replaySequences[index] ?? 0;

        return (
          <ShopStickerStamp
            key={`${stickerImage}-${index}`}
            ariaLabel={`${index + 1}번째 스티커 다시 붙이기`}
            delayMs={replaySequence > 0 ? 0 : (stampDelays[index] ?? 0)}
            isNewest={index === newestStickerIndex}
            isReady={isReady}
            onLoad={handleStickerLoad}
            onReplay={() => replaySticker(index)}
            playbackSequence={replaySequence}
            shouldAnimate={shouldAnimate || replaySequence > 0}
            slotStyle={slotStyle}
            src={stickerImage}
          />
        );
      })}
    </div>
  );
}

type ShopStickerStampProps = {
  ariaLabel: string;
  delayMs: number;
  isNewest: boolean;
  isReady: boolean;
  onLoad: () => void;
  onReplay: () => void;
  playbackSequence: number;
  shouldAnimate: boolean;
  slotStyle: CSSProperties;
  src: string;
};

/**
 * 스티커 한 장을 도장 찍듯 등장시킵니다.
 * 위치·기본 기울기는 바깥 button이, 등장 애니메이션은 안쪽 img가 각각 담당합니다.
 * 한 요소에 합치면 애니메이션 종료 시 transform이 덮어써져 기본 기울기가 사라집니다.
 * 재생 시퀀스를 img key에 반영해 같은 스티커를 연속으로 눌러도 애니메이션을 다시 시작합니다.
 */
function ShopStickerStamp({
  ariaLabel,
  delayMs,
  isNewest,
  isReady,
  onLoad,
  onReplay,
  playbackSequence,
  shouldAnimate,
  slotStyle,
  src,
}: ShopStickerStampProps) {
  const [completedPlaybackSequence, setCompletedPlaybackSequence] = useState<number | null>(null);
  const isPlaying = shouldAnimate && isReady && completedPlaybackSequence !== playbackSequence;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="absolute cursor-pointer rounded-full border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1"
      onClick={onReplay}
      style={slotStyle}
    >
      <img
        key={playbackSequence}
        alt=""
        className={cn(
          'shop-sticker-hero__stamp pointer-events-none h-full w-full object-contain',
          isPlaying && (isNewest ? STAMP_PLAYING_NEWEST_CLASS : STAMP_PLAYING_CLASS)
        )}
        draggable={false}
        onAnimationEnd={() => setCompletedPlaybackSequence(playbackSequence)}
        onLoad={onLoad}
        src={src}
        style={{
          animationDelay: `${delayMs}ms`,
          animationDuration: `${getShopStickerStampDuration(isNewest)}ms`,
        }}
      />
    </button>
  );
}
