import { createReceiptScanData } from './createReceiptScanData';

it('Google Places 매칭을 문자열 좌표 변환 없이 웹 폼의 가게 정보로 전달한다', () => {
  expect(
    createReceiptScanData({
      receiptImageId: 15,
      purchaseDate: '2026-07-25',
      purchaseTime: '11:20:00',
      amount: 33000,
      googlePlaceSearchResult: {
        googlePlaceId: ' place-01 ',
        placeName: ' 카페 ',
        roadAddress: '대한민국 서울특별시 마포구 월드컵북로 1',
        latitude: 37.5,
        longitude: 127.02,
        thumbnailUrl: ' https://example.com/cafe.jpg ',
      },
    })
  ).toEqual({
    receiptImageId: 15,
    purchaseDate: '2026-07-25',
    purchaseTime: '11:20:00',
    amount: 33000,
    shop: {
      id: 'place-01',
      name: '카페',
      address: '서울특별시 마포구 월드컵북로 1',
      latitude: 37.5,
      longitude: 127.02,
      photoUrl: 'https://example.com/cafe.jpg',
    },
  });
});

it('불완전한 매칭은 OCR 원문 가게로 대체하지 않고 인식한 금액만 유지한다', () => {
  expect(
    createReceiptScanData({
      receiptImageId: 15,
      amount: 33000,
      storeName: 'OCR 가게',
      address: 'OCR 주소',
      googlePlaceSearchResult: { googlePlaceId: 'place-01', latitude: 37.5, longitude: 127.02 },
    })
  ).toEqual({
    receiptImageId: 15,
    amount: 33000,
    shop: null,
    purchaseDate: null,
    purchaseTime: null,
  });
});

it.each([undefined, 0, -1, 1.5])(
  '사용할 수 없는 영수증 ID %s는 반환하지 않는다',
  (receiptImageId) => {
    expect(() => createReceiptScanData({ receiptImageId })).toThrow('다시 촬영');
  }
);
