import { TEST_SHOP_RECOMMENDATIONS } from '@/features/map/testFixtures';

import { resolveRecommendationShop } from './resolveRecommendationShop';

const createPlacesLibrary = (places: unknown[]) => {
  const searchByText = jest.fn().mockResolvedValue({ places });

  return {
    library: { Place: { searchByText } } as unknown as google.maps.PlacesLibrary,
    searchByText,
  };
};

const createPlace = ({
  id,
  name,
  latitude,
  longitude,
}: {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}) => ({
  id,
  displayName: name,
  formattedAddress: '서울특별시 강남구 봉은사로 125 1층',
  location: {
    lat: () => latitude,
    lng: () => longitude,
  },
  photos: [{ getURI: jest.fn(() => 'https://example.com/place.jpg') }],
});

describe('resolveRecommendationShop', () => {
  const recommendation = TEST_SHOP_RECOMMENDATIONS[0]!;

  it('추천 이름과 좌표에 가장 가까운 Google 장소를 기록용 가게로 변환한다', async () => {
    const unrelatedPlace = createPlace({
      id: 'ChIJ-unrelated',
      name: '다른 카페',
      latitude: recommendation.position.lat,
      longitude: recommendation.position.lng,
    });
    const matchingPlace = createPlace({
      id: 'ChIJ-twosome-nearby',
      name: `${recommendation.place.name} 강남점`,
      latitude: recommendation.position.lat + 0.0001,
      longitude: recommendation.position.lng + 0.0001,
    });
    const { library, searchByText } = createPlacesLibrary([unrelatedPlace, matchingPlace]);

    await expect(resolveRecommendationShop(library, recommendation)).resolves.toEqual({
      id: 'ChIJ-twosome-nearby',
      name: `${recommendation.place.name} 강남점`,
      address: '서울특별시 강남구 봉은사로 125 1층',
      photoUrl: 'https://example.com/place.jpg',
      latitude: recommendation.position.lat + 0.0001,
      longitude: recommendation.position.lng + 0.0001,
    });
    expect(searchByText).toHaveBeenCalledWith(
      expect.objectContaining({
        textQuery: `${recommendation.place.name} ${recommendation.place.address}`,
        locationBias: {
          center: recommendation.position,
          radius: 300,
        },
      })
    );
  });

  it('이름과 좌표가 일치하는 Google 장소가 없으면 잘못된 가게를 선택하지 않는다', async () => {
    const { library } = createPlacesLibrary([
      createPlace({
        id: 'ChIJ-unrelated',
        name: '다른 카페',
        latitude: recommendation.position.lat,
        longitude: recommendation.position.lng,
      }),
    ]);

    await expect(resolveRecommendationShop(library, recommendation)).rejects.toThrow(
      '추천 매장과 일치하는 Google Places 결과를 찾지 못했습니다'
    );
  });
});
