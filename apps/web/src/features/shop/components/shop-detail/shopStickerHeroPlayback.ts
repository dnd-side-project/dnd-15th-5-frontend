const PLAYED_PLACE_IDS_KEY = 'chapchap:shop-sticker-hero:played-place-ids';

const readPlayedPlaceIds = (): Set<number> => {
  try {
    const raw = window.sessionStorage.getItem(PLAYED_PLACE_IDS_KEY);
    if (!raw) {
      return new Set();
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(
      parsed.filter((placeId): placeId is number => Number.isSafeInteger(placeId) && placeId > 0)
    );
  } catch {
    return new Set();
  }
};

/** 이 브라우저 세션에서 해당 매장의 스티커 등장 애니메이션을 재생했는지 확인한다. */
export const hasPlayedShopStickerHeroAnimation = (placeId: number) =>
  readPlayedPlaceIds().has(placeId);

/**
 * 해당 매장의 스티커 등장 애니메이션이 실제로 시작된 시점을 세션에 기록한다.
 * `sessionStorage`를 쓸 수 없는 환경에서는 이후 방문 때 다시 재생되는 것을 허용한다.
 */
export const markShopStickerHeroAnimationPlayed = (placeId: number) => {
  try {
    const playedPlaceIds = readPlayedPlaceIds();
    playedPlaceIds.add(placeId);
    window.sessionStorage.setItem(PLAYED_PLACE_IDS_KEY, JSON.stringify([...playedPlaceIds]));
  } catch {
    // NOTE: 재생 기록 실패는 화면 표시를 막을 이유가 없다.
  }
};
