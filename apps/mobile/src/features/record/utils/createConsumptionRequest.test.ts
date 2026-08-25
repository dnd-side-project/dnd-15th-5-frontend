import { createConsumptionRequest } from './createConsumptionRequest';

const draft = {
  receiptImageId: 15,
  shopId: 'ChIJ-place-01',
  shopName: '투썸플레이스 신논현점',
  shopAddress: '서울특별시 강남구 봉은사로 125 1층',
  shopPhotoUrl: null,
  latitude: 37.506481,
  longitude: 127.024551,
  visitDateTime: { date: new Date(2026, 6, 25), period: 'afternoon' as const },
  amount: '33000',
  category: '카페' as const,
  receiptUri: 'file://receipt.jpg',
};

describe('createConsumptionRequest', () => {
  it('확인한 영수증 폼 값을 소비 등록 요청으로 변환한다', () => {
    expect(createConsumptionRequest(draft)).toEqual({
      receiptImageId: 15,
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

  it('영수증 또는 장소 식별 정보가 빠지면 등록 요청을 만들지 않는다', () => {
    expect(() => createConsumptionRequest({ ...draft, receiptImageId: null })).toThrow(
      '가게 또는 영수증 정보를 다시 확인해 주세요.'
    );
    expect(() => createConsumptionRequest({ ...draft, latitude: null })).toThrow(
      '가게 또는 영수증 정보를 다시 확인해 주세요.'
    );
  });
});
