import { toMapStickers, toShopRecommendations, toShopSearchResult } from './placeAdapters';

describe('placeAdapters', () => {
  it.each([
    [undefined, true, true],
    [undefined, false, false],
    [false, true, false],
    [true, false, true],
    [true, undefined, true],
    [false, undefined, false],
    [undefined, undefined, false],
  ])(
    '중복 장소의 liked %p / %p에서 처음 정의된 값 %p를 유지한다',
    (categoryLiked, allLiked, expectedLiked) => {
      const place = { placeId: 101, name: '카페', latitude: 37.5, longitude: 127 };
      const recommendations = toShopRecommendations({
        categoryPlaces: [{ category: '카페', places: [{ ...place, liked: categoryLiked }] }],
        allPlaces: [{ ...place, liked: allLiked }],
      });
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0]?.isLiked).toBe(expectedLiked);
    }
  );

  it('전체 카테고리 추천을 개인 관심 카테고리로 안내하지 않는다', () => {
    const place = { placeId: 101, name: '카페', latitude: 37.5, longitude: 127 };
    expect(
      toShopRecommendations({ categoryPlaces: [{ category: '카페', places: [place] }] })[0]?.reason
    ).toBe('카테고리별 인기 가게');
  });
  it('사진 URL이 있는 방문 장소는 기본 스티커 이름보다 사진을 우선 표시한다', () => {
    const [sticker] = toMapStickers([
      {
        placeId: 101,
        placeName: '사진으로 기록한 가게',
        latitude: 37.5,
        longitude: 127,
        visitCount: 1,
        stickerName: '커피',
        imageUrl: 'https://example.com/photo-sticker.png',
      },
    ]);

    expect(sticker?.image).toBe('https://example.com/photo-sticker.png');
    expect(sticker?.place.stickerImages).toEqual(['https://example.com/photo-sticker.png']);
  });
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
        googlePlaceId: 'ChIJ-twosome-101',
      },
      { placeId: 102, placeName: '좌표 없는 가게' },
    ]);

    expect(stickers).toHaveLength(1);
    expect(stickers[0]).toMatchObject({
      id: '101',
      googlePlaceId: 'ChIJ-twosome-101',
      isLiked: true,
      label: '커피',
      position: { lat: 37.5, lng: 127.02 },
      visitCount: 3,
      place: { category: '카페', name: '투썸플레이스' },
    });
  });

  it('방문 기록 없이 좋아요만 한 장소는 지도 스티커로 변환하지 않는다', () => {
    const stickers = toMapStickers([
      {
        placeId: 102,
        placeName: '좋아요한 가게',
        latitude: 37.4999,
        longitude: 127.0364,
        visitCount: 0,
        liked: true,
      },
    ]);

    expect(stickers).toEqual([]);
  });

  it('Google Place ID가 있는 지도 스티커를 소비 기록용 가게 모델로 변환한다', () => {
    const [sticker] = toMapStickers([
      {
        placeId: 101,
        placeName: '투썸플레이스',
        latitude: 37.5,
        longitude: 127.02,
        googlePlaceId: 'ChIJ-twosome-101',
      },
    ]);

    expect(toShopSearchResult(sticker)).toEqual({
      id: 'ChIJ-twosome-101',
      name: '투썸플레이스',
      address: '',
      photoUrl: null,
      latitude: 37.5,
      longitude: 127.02,
    });
    expect(toShopSearchResult({ ...sticker!, googlePlaceId: undefined })).toBeUndefined();
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
    };
    const recommendations = toShopRecommendations({
      allPlaces: [
        commonPlace,
        { placeId: 999, name: '좌표 없음' },
        commonPlace,
        { ...commonPlace, placeId: 102, name: '다른 가게' },
      ],
    });

    expect(recommendations).toHaveLength(2);
    expect(recommendations.map(({ id, reason }) => ({ id, reason }))).toEqual([
      { id: '101', reason: '카테고리별 인기 가게' },
      { id: '102', reason: '카테고리별 인기 가게' },
    ]);
    expect(recommendations[0]?.place.category).toBe('기타');
    expect(recommendations[0]).toMatchObject({
      googleMapsUri: null,
      thumbnailSrc: 'https://example.com/twosome.jpg',
    });
  });
});
