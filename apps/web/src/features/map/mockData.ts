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

import type { MapSticker } from './types';

// NOTE: 백엔드 API 연동 전까지, 지도 기본 중심(서울시청) 위쪽을 기준으로 4x3 격자로 흩어 놓은
// 목업이다. 기본 줌(13)·바텀시트 높이를 감안해 스티커끼리 겹치지 않고 전부 화면에 보이도록 잡았다.
export const MOCK_MAP_STICKERS = [
  {
    id: 'cafe-coffee',
    image: StickerCoffeeImage,
    label: '카페',
    position: { lat: 37.6005, lng: 126.951 },
    visitCount: 3,
  },
  {
    id: 'cafe-donut',
    image: StickerDonutImage,
    label: '도넛 가게',
    position: { lat: 37.6005, lng: 126.969 },
    visitCount: 1,
  },
  {
    id: 'cafe-ice-cream',
    image: StickerIceCreamImage,
    label: '아이스크림 가게',
    position: { lat: 37.6005, lng: 126.987 },
    visitCount: 5,
  },
  {
    id: 'entertainment-dart',
    image: StickerDartImage,
    label: '다트 펍',
    position: { lat: 37.6005, lng: 127.005 },
    visitCount: 1,
  },
  {
    id: 'entertainment-lp',
    image: StickerLpImage,
    label: 'LP 바',
    position: { lat: 37.5865, lng: 126.951 },
    visitCount: 2,
  },
  {
    id: 'entertainment-microphone',
    image: StickerMicrophoneImage,
    label: '노래방',
    position: { lat: 37.5865, lng: 126.969 },
    visitCount: 4,
  },
  {
    id: 'restaurant-fries',
    image: StickerFriesImage,
    label: '감자튀김 맛집',
    position: { lat: 37.5865, lng: 126.987 },
    visitCount: 2,
  },
  {
    id: 'restaurant-pizza',
    image: StickerPizzaImage,
    label: '피자 가게',
    position: { lat: 37.5865, lng: 127.005 },
    visitCount: 1,
  },
  {
    id: 'restaurant-spatula',
    image: StickerFlipperImage,
    label: '분식집',
    position: { lat: 37.5725, lng: 126.951 },
    visitCount: 3,
  },
  {
    id: 'common-bravo',
    image: StickerBravoImage,
    label: '축하 스티커',
    position: { lat: 37.5725, lng: 126.969 },
    visitCount: 1,
  },
  {
    id: 'common-eyes',
    image: StickerEyesImage,
    label: '찹찹 마스코트',
    position: { lat: 37.5725, lng: 126.987 },
    visitCount: 1,
  },
  {
    id: 'special',
    image: StickerSpecialImage,
    label: '스페셜',
    position: { lat: 37.5725, lng: 127.005 },
    visitCount: 6,
  },
] as const satisfies readonly MapSticker[];
