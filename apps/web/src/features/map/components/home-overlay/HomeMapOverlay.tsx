import HomeCategoryFilter from './HomeCategoryFilter';
import HomeTopBar from './HomeTopBar';

// TODO: 실제 리포트 데이터 연동 후 이번 달 기록 개수로 교체한다.
const MOCK_RECORDED_SHOP_COUNT = 7;

/**
 * 지도 홈에서 지도 위에 떠 있는 UI 전체(취향 요약 배너, 바로가기, 카테고리 필터)입니다.
 *
 * 바텀시트와 독립적으로 화면 최상단에 고정됩니다. 빈 공간은 지도 제스처가 그대로 통과하도록
 * `pointer-events-none`을 두고, 실제 UI가 있는 영역에만 `pointer-events-auto`로 되돌립니다.
 */
export default function HomeMapOverlay() {
  return (
    <div className="pointer-events-none fixed top-0 right-0 left-0 z-10 mx-auto flex max-w-120 flex-col gap-3 pt-[env(safe-area-inset-top)]">
      <div className="pointer-events-auto">
        <HomeTopBar recordedShopCount={MOCK_RECORDED_SHOP_COUNT} />
      </div>
      <div className="pointer-events-auto">
        <HomeCategoryFilter />
      </div>
    </div>
  );
}
