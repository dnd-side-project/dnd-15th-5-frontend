import { createConsumptionRequest } from './createConsumptionRequest';

const shop = {
  id: 'ChIJ-place-01',
  name: '투썸플레이스 신논현점',
  address: '서울특별시 강남구 봉은사로 125 1층',
  photoUrl: null,
  latitude: 37.506481,
  longitude: 127.024551,
};

describe('createConsumptionRequest', () => {
  it('선택한 가게와 폼 값을 소비 등록 요청으로 변환한다', () => {
    expect(
      createConsumptionRequest({
        shop,
        visitDateTime: { date: new Date(2026, 6, 25), period: 'afternoon' },
        amount: '33000',
        category: '카페',
      })
    ).toEqual({
      googlePlaceId: 'ChIJ-place-01',
      placeName: '투썸플레이스 신논현점',
      roadAddress: '서울특별시 강남구 봉은사로 125 1층',
      latitude: 37.506481,
      longitude: 127.024551,
      purchaseDate: '2026-07-25',
      purchaseTime: '11:00:00',
      amount: 33000,
      category: '카페',
    });
  });

  it('위치 정보가 없는 장소는 등록 요청으로 만들지 않는다', () => {
    expect(() =>
      createConsumptionRequest({
        shop: { ...shop, latitude: Number.NaN },
        visitDateTime: { date: new Date(2026, 6, 25), period: 'afternoon' },
        amount: '33000',
        category: '카페',
      })
    ).toThrow('선택한 장소의 위치 정보가 없습니다.');
  });
});
