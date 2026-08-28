import { createReceiptConfirmParams } from './createReceiptConfirmParams';

describe('createReceiptConfirmParams', () => {
  it('완전한 Google Place 결과만 매장 라우트 값으로 변환한다', () => {
    expect(
      createReceiptConfirmParams({
        uri: 'file://receipt.jpg',
        receiptImageId: 15,
        purchaseDate: '2026-07-25',
        purchaseTime: '11:20:00',
        amount: 33000,
        googlePlaceSearchResult: {
          googlePlaceId: ' ChIJ-two-some ',
          placeName: ' 투썸플레이스 신논현점 ',
          roadAddress: '대한민국 서울특별시 강남구 봉은사로 125 1층',
          latitude: 37.506481,
          longitude: 127.024551,
          thumbnailUrl: ' https://example.com/twosome.jpg ',
        },
      })
    ).toEqual({
      uri: 'file://receipt.jpg',
      receiptImageId: '15',
      shopId: 'ChIJ-two-some',
      shopName: '투썸플레이스 신논현점',
      shopAddress: '서울특별시 강남구 봉은사로 125 1층',
      shopPhotoUrl: 'https://example.com/twosome.jpg',
      latitude: '37.506481',
      longitude: '127.024551',
      amount: '33000',
      visitedAt: String(new Date(2026, 6, 25, 11, 20).getTime()),
      visitPeriod: 'afternoon',
    });
  });

  it.each([
    ['주소 정규화 후 빈 값', { roadAddress: '대한민국' }],
    ['위도 범위 초과', { latitude: 91 }],
    ['경도 범위 초과', { longitude: 181 }],
  ])('%s이면 매장 라우트 값을 만들지 않는다', (_, invalidValue) => {
    expect(
      createReceiptConfirmParams({
        uri: 'file://receipt.jpg',
        googlePlaceSearchResult: {
          googlePlaceId: 'place-01',
          placeName: '카페 차차',
          roadAddress: '대한민국 서울특별시 마포구 월드컵북로 1',
          latitude: 37.5,
          longitude: 127.02,
          ...invalidValue,
        },
      })
    ).toEqual({ uri: 'file://receipt.jpg' });
  });

  it('Google Place 매칭이 없으면 OCR 원문 매장 정보를 사용하지 않는다', () => {
    expect(
      createReceiptConfirmParams({
        uri: 'file://receipt.jpg',
        storeName: '상계동 분식',
        address: '대한민국 서울특별시 노원구 상계 8동',
      })
    ).toEqual({ uri: 'file://receipt.jpg' });
  });
});
