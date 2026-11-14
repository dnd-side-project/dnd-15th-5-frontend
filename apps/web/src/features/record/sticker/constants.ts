/** 앱은 안전 영역 아래의 기본 헤더만 두고, 웹은 기존 상단 배치를 유지합니다. */
export const getStickerFlowLayout = (isApp: boolean) => ({
  headerHeight: isApp
    ? 'h-[calc(3.5rem+env(safe-area-inset-top))]'
    : 'h-[max(8.375rem,calc(env(safe-area-inset-top)+5.375rem))]',
  headerTop: isApp
    ? 'top-[calc(1rem+env(safe-area-inset-top))]'
    : 'top-[max(4.8125rem,calc(env(safe-area-inset-top)+1.8125rem))]',
  sourceHeaderHeight: isApp
    ? 'h-[calc(3.5rem+env(safe-area-inset-top))]'
    : 'h-[max(7rem,calc(env(safe-area-inset-top)+4rem))]',
  defaultHeaderHeight: isApp ? 'h-[calc(3.5rem+env(safe-area-inset-top))]' : 'h-32',
  // 자르기 핸들이 이미지 바깥으로 돌출되는 공간은 남깁니다.
  cropPaddingTop: isApp ? 'pt-6' : 'pt-16',
});
