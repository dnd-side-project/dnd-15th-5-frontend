import { createMockShopDetailData } from './mockData';

describe('createMockShopDetailData', () => {
  it('지도 장소와 방문 횟수를 상세 화면용 목업으로 변환한다', () => {
    const mockData = createMockShopDetailData({
      place: {
        id: '101',
        name: '투썸플레이스',
        category: '카페',
        address: '서울특별시 강남구 봉은사로 125 1층',
        isRegular: true,
        stickerImages: ['fries.png', 'pizza.png'],
      },
      visitCount: 3,
    });

    expect(mockData.place).toMatchObject({
      placeId: 101,
      placeName: '투썸플레이스',
      stats: {
        monthlyVisitCount: 3,
        totalVisitCount: 3,
      },
    });
    expect(mockData.stickerImages).toEqual(['fries.png', 'pizza.png']);
    expect(mockData.visits).toHaveLength(3);
  });
});
