import { useEffect, useState } from 'react';

import { useMapPlaceStampStore } from '@/features/map/stores/mapPlaceStampStore';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

/** 핀이 준비되면 등록 완료 요청을 한 번 소비하고 재렌더링과 무관하게 모션을 마칩니다. */
export const useCreatedPlaceStamp = (placeId: string, isReady = true) => {
  const request = useMapPlaceStampStore((state) => state.stampRequest);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [playback, setPlayback] = useState({ sequence: 0, isPlaying: false });

  if (isReady && request?.placeId === placeId && request.sequence !== playback.sequence) {
    setPlayback({ sequence: request.sequence, isPlaying: !prefersReducedMotion });
  }

  useEffect(() => {
    if (!isReady || request?.placeId !== placeId) return;
    const store = useMapPlaceStampStore.getState();
    if (store.stampRequest?.sequence !== request.sequence) return;
    store.consumePlaceStamp(request.sequence);
  }, [isReady, placeId, prefersReducedMotion, request]);

  return {
    animationKey: playback.sequence,
    isPlaying: playback.isPlaying && !prefersReducedMotion,
    onAnimationEnd: () => setPlayback((current) => ({ ...current, isPlaying: false })),
  };
};
