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

export const HOME_CATEGORIES = [
  '편의점/마트',
  '카페',
  '운동',
  '음식점',
  '취미/놀거리',
  '미용/뷰티',
  '기타',
] as const;

/**
 * 백엔드가 내려주는 `stickerName`을 스티커 이미지로 변환하는 맵이다.
 *
 * TODO: "도넛"/"피자"/"뒤집개" 3개만 실제 API 응답으로 확인했다. 나머지 키는 같은 규칙(스티커
 * 소재를 그대로 한글 명사로)일 거라 추정한 값이라, 백엔드에 정확한 전체 목록을 받으면 다시 맞춰야 한다.
 */
export const STICKER_IMAGE_BY_NAME: Record<string, string> = {
  커피: StickerCoffeeImage,
  도넛: StickerDonutImage,
  아이스크림: StickerIceCreamImage,
  다트: StickerDartImage,
  LP: StickerLpImage,
  마이크: StickerMicrophoneImage,
  감자튀김: StickerFriesImage,
  피자: StickerPizzaImage,
  뒤집개: StickerFlipperImage,
  브라보: StickerBravoImage,
  눈: StickerEyesImage,
  스페셜: StickerSpecialImage,
};
