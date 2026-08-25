import {
  StickerBravoImage,
  StickerCoffeeImage,
  StickerDartImage,
  StickerDonutImage,
  StickerEyesImage,
  StickerFlipperImage,
  StickerFriesImage,
  StickerIceCreamImage,
  StickerLpImage,
  StickerMicrophoneImage,
  StickerPizzaImage,
  StickerSpecialImage,
} from '@/shared/assets/images/stickers';

import type { MapSticker, ShopRecommendation } from './types';

// NOTE: 백엔드 API 연동 전까지, 지도 기본 중심(서울시청) 위쪽을 기준으로 4x3 격자로 흩어 놓은
// 목업이다. 기본 줌(13)·바텀시트 높이를 감안해 스티커끼리 겹치지 않고 전부 화면에 보이도록 잡았다.
export const MOCK_MAP_STICKERS = [
  {
    id: 'cafe-coffee',
    image: StickerCoffeeImage,
    label: '카페',
    place: {
      id: '101',
      name: '투썸플레이스',
      category: '카페',
      address: '서울특별시 강남구 봉은사로 125 1층',
      isRegular: true,
      stickerImages: [StickerFriesImage, StickerPizzaImage, StickerFlipperImage],
    },
    position: { lat: 37.6005, lng: 126.951 },
    visitCount: 3,
  },
  {
    id: 'cafe-donut',
    image: StickerDonutImage,
    label: '도넛 가게',
    place: {
      id: '102',
      name: '노티드 용산점',
      category: '카페',
      address: '서울특별시 용산구 한강대로 23길 55',
      isRegular: true,
      stickerImages: [StickerDonutImage, StickerCoffeeImage],
    },
    position: { lat: 37.6005, lng: 126.969 },
    visitCount: 1,
  },
  {
    id: 'cafe-ice-cream',
    image: StickerIceCreamImage,
    label: '아이스크림 가게',
    place: {
      id: '103',
      name: '배스킨라빈스 시청점',
      category: '카페',
      address: '서울특별시 중구 세종대로 110',
      isRegular: false,
      stickerImages: [StickerIceCreamImage, StickerDonutImage, StickerCoffeeImage],
    },
    position: { lat: 37.6005, lng: 126.987 },
    visitCount: 5,
  },
  {
    id: 'entertainment-dart',
    image: StickerDartImage,
    label: '다트 펍',
    place: {
      id: '104',
      name: '플레이 다트펍',
      category: '취미/놀거리',
      address: '서울특별시 종로구 종로 51',
      isRegular: false,
      stickerImages: [StickerDartImage, StickerMicrophoneImage],
    },
    position: { lat: 37.6005, lng: 127.005 },
    visitCount: 1,
  },
  {
    id: 'entertainment-lp',
    image: StickerLpImage,
    label: 'LP 바',
    place: {
      id: '105',
      name: '뮤직컴플렉스서울',
      category: '취미/놀거리',
      address: '서울특별시 종로구 인사동길 49',
      isRegular: true,
      stickerImages: [StickerLpImage, StickerMicrophoneImage, StickerDartImage],
    },
    position: { lat: 37.5865, lng: 126.951 },
    visitCount: 2,
  },
  {
    id: 'entertainment-microphone',
    image: StickerMicrophoneImage,
    label: '노래방',
    place: {
      id: '106',
      name: '세븐스타 코인노래방',
      category: '취미/놀거리',
      address: '서울특별시 마포구 양화로 162',
      isRegular: true,
      stickerImages: [
        StickerMicrophoneImage,
        StickerLpImage,
        StickerDartImage,
        StickerBravoImage,
        StickerEyesImage,
        StickerSpecialImage,
      ],
    },
    position: { lat: 37.5865, lng: 126.969 },
    visitCount: 4,
  },
  {
    id: 'restaurant-fries',
    image: StickerFriesImage,
    label: '감자튀김 맛집',
    place: {
      id: '107',
      name: '감자밭 서울점',
      category: '음식점',
      address: '서울특별시 성동구 서울숲2길 16',
      isRegular: false,
      stickerImages: [StickerFriesImage, StickerPizzaImage],
    },
    position: { lat: 37.5865, lng: 126.987 },
    visitCount: 2,
  },
  {
    id: 'restaurant-pizza',
    image: StickerPizzaImage,
    label: '피자 가게',
    place: {
      id: '108',
      name: '피자네버슬립스',
      category: '음식점',
      address: '서울특별시 마포구 양화로6길 73',
      isRegular: true,
      stickerImages: [StickerPizzaImage, StickerFriesImage, StickerFlipperImage],
    },
    position: { lat: 37.5865, lng: 127.005 },
    visitCount: 1,
  },
  {
    id: 'restaurant-spatula',
    image: StickerFlipperImage,
    label: '분식집',
    place: {
      id: '109',
      name: '우리할매떡볶이',
      category: '음식점',
      address: '서울특별시 용산구 한강대로 95',
      isRegular: true,
      stickerImages: [StickerFlipperImage, StickerFriesImage],
    },
    position: { lat: 37.5725, lng: 126.951 },
    visitCount: 3,
  },
  {
    id: 'common-bravo',
    image: StickerBravoImage,
    label: '축하 스티커',
    place: {
      id: '110',
      name: '브라보 카페',
      category: '카페',
      address: '서울특별시 중구 을지로 12',
      isRegular: false,
      stickerImages: [StickerBravoImage, StickerCoffeeImage],
    },
    position: { lat: 37.5725, lng: 126.969 },
    visitCount: 1,
  },
  {
    id: 'common-eyes',
    image: StickerEyesImage,
    label: '찹찹 마스코트',
    place: {
      id: '111',
      name: '찹찹 문구점',
      category: '기타',
      address: '서울특별시 종로구 청계천로 41',
      isRegular: false,
      stickerImages: [StickerEyesImage, StickerBravoImage],
    },
    position: { lat: 37.5725, lng: 126.987 },
    visitCount: 1,
  },
  {
    id: 'special',
    image: StickerSpecialImage,
    label: '스페셜',
    place: {
      id: '112',
      name: '챕챕 스페셜 스토어',
      category: '기타',
      address: '서울특별시 중구 세종대로 99',
      isRegular: true,
      stickerImages: [StickerSpecialImage, StickerBravoImage, StickerEyesImage],
    },
    position: { lat: 37.5725, lng: 127.005 },
    visitCount: 6,
  },
] as const satisfies readonly MapSticker[];

const MAX_RECOMMENDATIONS_PER_REASON = 2;

const MOCK_INTEREST_CATEGORY_RECOMMENDATIONS = [
  {
    id: 'recommendation-twosome',
    reason: '나의 관심 카테고리',
    place: MOCK_MAP_STICKERS[0].place,
    position: { lat: 37.5705, lng: 126.975 },
    thumbnailSrc: null,
  },
  {
    id: 'recommendation-knotted',
    reason: '나의 관심 카테고리',
    place: MOCK_MAP_STICKERS[1].place,
    position: { lat: 37.5645, lng: 126.984 },
    thumbnailSrc: null,
  },
] as const satisfies readonly ShopRecommendation[];

const MOCK_NEIGHBORHOOD_RECOMMENDATIONS = [
  {
    id: 'recommendation-music-complex',
    reason: '내 동네에서 많이 방문한 곳',
    place: MOCK_MAP_STICKERS[4].place,
    position: { lat: 37.5585, lng: 126.971 },
    thumbnailSrc: null,
  },
  {
    id: 'recommendation-pizza',
    reason: '내 동네에서 많이 방문한 곳',
    place: MOCK_MAP_STICKERS[7].place,
    position: { lat: 37.5755, lng: 126.991 },
    thumbnailSrc: null,
  },
] as const satisfies readonly ShopRecommendation[];

/**
 * 추천 사유별로 최대 2개씩, 전체 최대 4개를 노출합니다.
 * 한 사유의 후보가 부족하면 있는 항목만 포함하므로 1개씩만 내려오는 경우도 그대로 처리합니다.
 */
export const MOCK_SHOP_RECOMMENDATIONS = [
  ...MOCK_INTEREST_CATEGORY_RECOMMENDATIONS.slice(0, MAX_RECOMMENDATIONS_PER_REASON),
  ...MOCK_NEIGHBORHOOD_RECOMMENDATIONS.slice(0, MAX_RECOMMENDATIONS_PER_REASON),
] as const satisfies readonly ShopRecommendation[];
