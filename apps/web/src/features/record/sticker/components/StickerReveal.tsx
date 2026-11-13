import { useEffectEvent, useLayoutEffect, useRef, useState } from 'react';

import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

type StickerRevealProps = {
  src: string;
  isPaused?: boolean;
  onComplete?: () => void;
  onLoad?: () => void;
  onError?: () => void;
};

const STICKER_REVEAL_DURATION_MS = 1000;

/** 스티커가 한 번 튀어 오른 뒤 작은 반동으로 자리 잡으면 대기 없이 완료를 알립니다. */
export default function StickerReveal({
  src,
  isPaused = false,
  onComplete,
  onLoad,
  onError,
}: StickerRevealProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const hasCompleted = useRef(false);
  const [loadedSource, setLoadedSource] = useState('');
  const prefersReducedMotion = usePrefersReducedMotion();
  const complete = useEffectEvent(() => {
    if (isPaused || hasCompleted.current) return;
    hasCompleted.current = true;
    onComplete?.();
  });

  // NOTE: 이미지가 먼저 보인 뒤 투명한 첫 프레임으로 되돌아가지 않도록 페인트 전에 모션을 시작한다.
  useLayoutEffect(() => {
    const image = imageRef.current;
    if (!image || loadedSource !== src) return;
    hasCompleted.current = false;
    if (prefersReducedMotion || typeof image.animate !== 'function') return;

    let isActive = true;
    const animation = image.animate(
      [
        { opacity: 0, transform: 'scale(0.82)', easing: 'ease-out' },
        { opacity: 1, transform: 'scale(1.02)', offset: 0.18, easing: 'ease-out' },
        { opacity: 1, transform: 'scale(1.14)', offset: 0.36, easing: 'ease-in-out' },
        { opacity: 1, transform: 'scale(0.95)', offset: 0.58, easing: 'ease-in-out' },
        { opacity: 1, transform: 'scale(1.035)', offset: 0.76, easing: 'ease-in-out' },
        { opacity: 1, transform: 'scale(0.99)', offset: 0.9, easing: 'ease-in-out' },
        { opacity: 1, transform: 'scale(1)' },
      ],
      { duration: STICKER_REVEAL_DURATION_MS, easing: 'linear', fill: 'both' }
    );
    animationRef.current = animation;
    animation.pause();
    void animation.finished
      .then(() => {
        if (isActive) complete();
      })
      .catch(() => {});
    return () => {
      isActive = false;
      animation.cancel();
      animationRef.current = null;
    };
  }, [src, loadedSource, prefersReducedMotion]);

  useLayoutEffect(() => {
    if (loadedSource !== src) return;
    const animation = animationRef.current;
    if (isPaused) {
      animation?.pause();
      return;
    }
    if (
      !animation ||
      (typeof animation.currentTime === 'number' &&
        animation.currentTime >= STICKER_REVEAL_DURATION_MS)
    ) {
      complete();
      return;
    }
    animation.play();
  }, [src, loadedSource, isPaused, prefersReducedMotion]);

  return (
    <img
      ref={imageRef}
      src={src}
      alt="흰색 테두리가 적용된 스티커"
      className="relative size-40 origin-bottom object-contain"
      style={{ opacity: loadedSource === src ? 1 : 0 }}
      onLoad={() => {
        setLoadedSource(src);
        onLoad?.();
      }}
      onError={onError}
    />
  );
}
