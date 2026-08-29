import { StickerCoffeeImage, StickerDartImage } from '@/shared/assets/images/stickers';

import type { MapSticker, ShopRecommendation } from './types';

export const TEST_MAP_STICKERS: readonly MapSticker[] = [
  {
    googlePlaceId: 'ChIJ-twosome-101',
    id: '101',
    image: StickerCoffeeImage,
    isLiked: false,
    label: '커피',
    place: {
      id: '101',
      name: '투썸플레이스',
      category: '카페',
      address: '서울특별시 강남구 봉은사로 125 1층',
      isRegular: true,
      stickerImages: [StickerCoffeeImage],
    },
    position: { lat: 37.506481, lng: 127.024551 },
    visitCount: 3,
  },
  {
    googlePlaceId: 'ChIJ-dart-pub-102',
    id: '102',
    image: StickerDartImage,
    isLiked: false,
    label: '다트',
    place: {
      id: '102',
      name: '플레이 다트펍',
      category: '취미/놀거리',
      address: '서울특별시 종로구 종로 51',
      isRegular: false,
      stickerImages: [StickerDartImage],
    },
    position: { lat: 37.5705, lng: 126.975 },
    visitCount: 1,
  },
];

export const TEST_SHOP_RECOMMENDATIONS: readonly ShopRecommendation[] = [
  ...TEST_MAP_STICKERS.map((sticker, index) => ({
    googleMapsUri: `https://maps.google.com/?cid=${sticker.id}`,
    id: sticker.id,
    isLiked: index === 1,
    place: sticker.place,
    position: sticker.position,
    reason: '나의 관심 카테고리' as const,
    thumbnailSrc: null,
    visitCount: sticker.visitCount,
  })),
  ...TEST_MAP_STICKERS.map((sticker, index) => ({
    id: String(Number(sticker.id) + 10),
    isLiked: false,
    place: {
      ...sticker.place,
      id: String(Number(sticker.id) + 10),
      name: `${sticker.place.name} ${index + 2}`,
    },
    position: { lat: sticker.position.lat + 0.01, lng: sticker.position.lng + 0.01 },
    reason: '내 동네에서 많이 방문한 곳' as const,
    thumbnailSrc: null,
    visitCount: sticker.visitCount,
  })),
];
