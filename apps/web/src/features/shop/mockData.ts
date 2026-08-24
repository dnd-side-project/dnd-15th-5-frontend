import type { PlaceDetailResponse, PlaceVisitResponse } from './apis/dto';

const MOCK_VISIT_AMOUNTS = [23_000, 18_000, 15_500, 32_000, 12_800, 27_000] as const;
const MOCK_VISIT_BASE_DATE = Date.UTC(2026, 7, 23, 12);
const MOCK_VISIT_INTERVAL_DAYS = 2;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

type MockShopDetailSeed = {
  place: {
    address: string;
    category: string;
    id: string;
    isRegular: boolean;
    name: string;
    stickerImages: readonly string[];
  };
  visitCount: number;
};

export type MockShopDetailData = {
  place: PlaceDetailResponse;
  stickerImages: readonly string[];
  visits: readonly PlaceVisitResponse[];
};

const createMockVisits = (visitCount: number): PlaceVisitResponse[] =>
  Array.from({ length: Math.max(visitCount, 1) }, (_, index) => ({
    visitedAt: new Date(
      MOCK_VISIT_BASE_DATE - index * MOCK_VISIT_INTERVAL_DAYS * MILLISECONDS_PER_DAY
    ).toISOString(),
    amount: MOCK_VISIT_AMOUNTS[index % MOCK_VISIT_AMOUNTS.length],
  }));

/** 지도 목업 장소를 상세 화면과 무한 스크롤에서 사용할 목업 응답으로 변환합니다. */
export const createMockShopDetailData = (seed: MockShopDetailSeed): MockShopDetailData => {
  const visits = createMockVisits(seed.visitCount);
  const firstVisitedDate = visits.at(-1)?.visitedAt;

  return {
    place: {
      placeId: Number(seed.place.id),
      placeName: seed.place.name,
      category: seed.place.category,
      address: seed.place.address,
      isRegular: seed.place.isRegular,
      stats: {
        firstVisitedDate,
        monthlyVisitCount: visits.length,
        totalVisitCount: visits.length,
      },
      recentStickers: [],
      stickerSummary: [],
    },
    stickerImages: seed.place.stickerImages,
    visits,
  };
};
