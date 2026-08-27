const HERO_WIDTH = 375;
const HERO_HEIGHT = 301;
const MIN_STICKER_SIZE = 120;
const MAX_STICKER_SIZE = 148;
const MIN_STICKER_ROTATION = -30;
const MAX_STICKER_ROTATION = 30;
const MIN_STICKER_TOP = 20;
const MAX_HORIZONTAL_OVERFLOW = 20;
const BOTTOM_STICKER_INSET = 36;
const MAX_STICKER_EDGE_OVERLAP = 50;
const MAX_PLACEMENT_ATTEMPTS = 200;

// NOTE: 원래 스펙(0.34s/55ms/320ms) 대비 재생 속도를 0.7배로 늦춘 값이다.
const STAMP_DURATION_MS = 486;
const NEWEST_STAMP_DURATION_MS = 657;
const STAMP_STAGGER_MS = 79;
const NEWEST_STAMP_BASE_DELAY_MS = 457;

type StickerPlacement = {
  left: number;
  rotate: number;
  size: number;
  top: number;
};

/** 같은 종류가 연달아 찍히지 않도록 종류별 스티커를 한 장씩 번갈아 배치합니다. */
export const mixShopStickerImages = (stickerImages: readonly string[]) => {
  const remainingCountByImage = new Map<string, number>();

  stickerImages.forEach((stickerImage) => {
    remainingCountByImage.set(stickerImage, (remainingCountByImage.get(stickerImage) ?? 0) + 1);
  });

  const mixedStickerImages: string[] = [];
  while (mixedStickerImages.length < stickerImages.length) {
    remainingCountByImage.forEach((remainingCount, stickerImage) => {
      if (remainingCount <= 0) return;

      mixedStickerImages.push(stickerImage);
      remainingCountByImage.set(stickerImage, remainingCount - 1);
    });
  }

  return mixedStickerImages;
};

const getPlacementClearance = (
  candidate: StickerPlacement,
  placements: readonly StickerPlacement[]
) => {
  if (placements.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  const candidateCenterX = candidate.left + candidate.size / 2;
  const candidateCenterY = candidate.top + candidate.size / 2;

  return Math.min(
    ...placements.map((placement) => {
      const centerDistance = Math.hypot(
        candidateCenterX - (placement.left + placement.size / 2),
        candidateCenterY - (placement.top + placement.size / 2)
      );
      const minimumCenterDistance =
        (candidate.size + placement.size) / 2 - MAX_STICKER_EDGE_OVERLAP;

      return centerDistance - minimumCenterDistance;
    })
  );
};

/** 장소 ID를 seed로 사용해 상세 히어로 안의 재현 가능한 스티커 배치를 만듭니다. */
export const createShopStickerPlacements = (placeId: number, count: number) => {
  let seed = Math.abs(placeId) || 1;
  const getRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const getRandomBetween = (min: number, max: number) => min + getRandom() * (max - min);
  const placements: StickerPlacement[] = [];

  const createCandidate = (): StickerPlacement => {
    const size = getRandomBetween(MIN_STICKER_SIZE, MAX_STICKER_SIZE);

    return {
      left: getRandomBetween(-MAX_HORIZONTAL_OVERFLOW, HERO_WIDTH - size + MAX_HORIZONTAL_OVERFLOW),
      top: getRandomBetween(MIN_STICKER_TOP, HERO_HEIGHT - size - BOTTOM_STICKER_INSET),
      size,
      rotate: getRandomBetween(MIN_STICKER_ROTATION, MAX_STICKER_ROTATION),
    };
  };

  for (let index = 0; index < count; index += 1) {
    let selectedPlacement: StickerPlacement | undefined;
    let bestFallback: StickerPlacement | undefined;
    let bestClearance = Number.NEGATIVE_INFINITY;

    for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt += 1) {
      const candidate = createCandidate();
      const clearance = getPlacementClearance(candidate, placements);

      if (clearance > bestClearance) {
        bestFallback = candidate;
        bestClearance = clearance;
      }

      if (clearance >= 0) {
        selectedPlacement = candidate;
        break;
      }
    }

    placements.push(selectedPlacement ?? bestFallback ?? createCandidate());
  }

  return placements;
};

/** 최신 스티커가 나머지 도장 애니메이션 뒤에 등장하도록 지연 시간을 계산합니다. */
export const createShopStickerStampDelays = (visibleCount: number, newestStickerIndex?: number) => {
  const otherIndices = Array.from({ length: visibleCount }, (_, index) => index).filter(
    (index) => index !== newestStickerIndex
  );
  const lastOtherIndex = otherIndices.length > 0 ? Math.max(...otherIndices) : -1;
  const otherStickersEndMs =
    lastOtherIndex >= 0 ? lastOtherIndex * STAMP_STAGGER_MS + STAMP_DURATION_MS : 0;
  const newestDelayMs = Math.max(NEWEST_STAMP_BASE_DELAY_MS, otherStickersEndMs);

  return Array.from({ length: visibleCount }, (_, index) =>
    index === newestStickerIndex ? newestDelayMs : index * STAMP_STAGGER_MS
  );
};

/** 일반·최신 스티커에 맞는 도장 애니메이션 재생 시간을 반환합니다. */
export const getShopStickerStampDuration = (isNewest: boolean) =>
  isNewest ? NEWEST_STAMP_DURATION_MS : STAMP_DURATION_MS;

/** 픽셀 단위 스티커 배치를 반응형 히어로에서 사용할 퍼센트 좌표로 변환합니다. */
export const getShopStickerSlotStyle = (placement: StickerPlacement) => ({
  left: `${(placement.left / HERO_WIDTH) * 100}%`,
  top: `${(placement.top / HERO_HEIGHT) * 100}%`,
  width: `${(placement.size / HERO_WIDTH) * 100}%`,
  height: `${(placement.size / HERO_HEIGHT) * 100}%`,
  transform: `rotate(${placement.rotate}deg)`,
});
