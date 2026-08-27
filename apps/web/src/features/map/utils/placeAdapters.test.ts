import { toMapStickers, toShopRecommendations } from './placeAdapters';

describe('placeAdapters', () => {
  it('필수 좌표가 있는 방문 장소만 지도 스티커로 변환한다', () => {
    const stickers = toMapStickers([
      {
        placeId: 101,
        placeName: '투썸플레이스',
        category: '카페',
        latitude: 37.5,
        longitude: 127.02,
        visitCount: 3,
        liked: true,
        stickerName: '커피',
      },
      { placeId: 102, placeName: '좌표 없는 가게' },
    ]);

    expect(stickers).toHaveLength(1);
    expect(stickers[0]).toMatchObject({
      id: '101',
      isLiked: true,
      label: '커피',
      position: { lat: 37.5, lng: 127.02 },
      visitCount: 3,
      place: { category: '카페', name: '투썸플레이스' },
    });
  });

  it('추천 사유 순서를 유지하면서 중복 장소와 유효하지 않은 장소를 제거한다', () => {
    const commonPlace = {
      placeId: 101,
      name: '투썸플레이스',
      dongName: '역삼동',
      category: '알 수 없는 카테고리',
      latitude: 37.5,
      longitude: 127.02,
      liked: false,
      thumbnailUrl: 'https://example.com/twosome.jpg',
      googleMapsUri: 'https://maps.google.com/?cid=101',
    };
    const recommendations = toShopRecommendations({
      sameCategoryPlaces: [commonPlace, { placeId: 999, name: '좌표 없음' }],
      myTownPlaces: [commonPlace, { ...commonPlace, placeId: 102, name: '동네 가게' }],
    });

    expect(recommendations).toHaveLength(2);
    expect(recommendations.map(({ id, reason }) => ({ id, reason }))).toEqual([
      { id: '101', reason: '나의 관심 카테고리' },
      { id: '102', reason: '내 동네에서 많이 방문한 곳' },
    ]);
    expect(recommendations[0]?.place.category).toBe('기타');
    expect(recommendations[0]).toMatchObject({
      googleMapsUri: 'https://maps.google.com/?cid=101',
      thumbnailSrc: 'https://example.com/twosome.jpg',
    });
  });
});
