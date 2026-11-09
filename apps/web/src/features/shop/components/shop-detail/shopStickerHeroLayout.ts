export const SHOP_STICKER_HERO_WIDTH = 375;
const HERO_HEIGHT = 301;
const STICKER_SIZE = 132;
const MAX_STICKER_EDGE = 160;
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
  top: number;
  width: number;
  height: number;
};

const getRotatedDimensions = (width: number, height: number, rotate: number) => {
  const radians = (rotate * Math.PI) / 180;
  const cosine = Math.abs(Math.cos(radians));
  const sine = Math.abs(Math.sin(radians));
  return { width: width * cosine + height * sine, height: width * sine + height * cosine };
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

  const candidateCenterX = candidate.left + candidate.width / 2;
  const candidateCenterY = candidate.top + candidate.height / 2;
  const candidateBounds = getRotatedDimensions(candidate.width, candidate.height, candidate.rotate);

  return Math.min(
    ...placements.map((placement) => {
      const bounds = getRotatedDimensions(placement.width, placement.height, placement.rotate);
      return Math.max(
        Math.abs(candidateCenterX - (placement.left + placement.width / 2)) -
          (candidateBounds.width + bounds.width) / 2 +
          MAX_STICKER_EDGE_OVERLAP,
        Math.abs(candidateCenterY - (placement.top + placement.height / 2)) -
          (candidateBounds.height + bounds.height) / 2 +
          MAX_STICKER_EDGE_OVERLAP
      );
    })
  );
};

/** 장소 ID를 seed로 사용해 상세 히어로 안의 재현 가능한 스티커 배치를 만듭니다. */
export const createShopStickerPlacements = (
  placeId: number,
  count: number,
  aspectRatios: readonly number[] = [],
  heroWidth = SHOP_STICKER_HERO_WIDTH
) => {
  let seed = Math.abs(placeId) || 1;
  const getRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const getRandomBetween = (min: number, max: number) => min + getRandom() * (max - min);
  const placements: StickerPlacement[] = [];

  const createCandidate = (aspectRatio: number): StickerPlacement => {
    const { width, height } = getShopStickerDimensions(aspectRatio);
    const left = getRandomBetween(
      -MAX_HORIZONTAL_OVERFLOW,
      heroWidth - width + MAX_HORIZONTAL_OVERFLOW
    );
    const top = getRandomBetween(MIN_STICKER_TOP, HERO_HEIGHT - height - BOTTOM_STICKER_INSET);
    const rotate = getRandomBetween(MIN_STICKER_ROTATION, MAX_STICKER_ROTATION);
    const bounds = getRotatedDimensions(width, height, rotate);
    const centerX = Math.max(
      bounds.width / 2 - MAX_HORIZONTAL_OVERFLOW,
      Math.min(left + width / 2, heroWidth + MAX_HORIZONTAL_OVERFLOW - bounds.width / 2)
    );
    const centerY = Math.max(
      MIN_STICKER_TOP + bounds.height / 2,
      Math.min(top + height / 2, HERO_HEIGHT - BOTTOM_STICKER_INSET - bounds.height / 2)
    );
    return {
      left: centerX - width / 2,
      top: centerY - height / 2,
      width,
      height,
      rotate,
    };
  };

  for (let index = 0; index < count; index += 1) {
    let selectedPlacement: StickerPlacement | undefined;
    let bestFallback: StickerPlacement | undefined;
    let bestClearance = Number.NEGATIVE_INFINITY;

    for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt += 1) {
      const candidate = createCandidate(aspectRatios[index] ?? 1);
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

    // NOTE: 영역보다 스티커가 많으면 겹침을 완전히 피할 수 없어 가장 덜 겹치는 후보를 사용합니다.
    placements.push(selectedPlacement ?? bestFallback ?? createCandidate(aspectRatios[index] ?? 1));
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

/** 이미지 비율을 유지하면서 표시 면적을 맞추고 긴 변의 과도한 확대를 제한합니다. */
export const getShopStickerDimensions = (aspectRatio: number) => {
  const ratio = Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1;
  const width = STICKER_SIZE * Math.sqrt(ratio);
  const height = STICKER_SIZE / Math.sqrt(ratio);
  const scale = Math.min(1, MAX_STICKER_EDGE / Math.max(width, height));
  return { width: width * scale, height: height * scale };
};

/** 고정 높이의 히어로에서 화면 폭과 무관하게 스티커 비율과 표시 면적을 유지합니다. */
export const getShopStickerSlotStyle = (
  placement: StickerPlacement,
  heroWidth = SHOP_STICKER_HERO_WIDTH
) => {
  const { width, height } = placement;
  const bounds = getRotatedDimensions(width, height, placement.rotate);
  const horizontalInset = bounds.width / 2 - MAX_HORIZONTAL_OVERFLOW;
  return {
    left: `clamp(${horizontalInset}px, ${((placement.left + width / 2) / heroWidth) * 100}%, calc(100% - ${horizontalInset}px))`,
    top: `${(placement.top / HERO_HEIGHT) * 100}%`,
    width: `${width}px`,
    height: `${height}px`,
    transform: `translateX(-50%) rotate(${placement.rotate}deg)`,
  };
};
