import type { ConsumptionDetailResponse } from '@/features/record/apis/dto';

export const TEST_CONSUMPTION_DETAIL = {
  consumptionId: 196,
  placeId: 10,
  googlePlaceId: 'google-cafe',
  placeName: '테스트 카페',
  roadAddress: '서울시 강남구',
  latitude: 37.5,
  longitude: 127,
  thumbnailUrl: null,
  purchaseDate: '2020-06-01',
  purchaseTime: '11:20:15',
  amount: 5500,
  category: '카페',
  imageId: 42,
  imageUrl: 'https://example.com/sticker.png',
  stickerItemId: null,
  memo: '기존 메모',
} satisfies ConsumptionDetailResponse;
