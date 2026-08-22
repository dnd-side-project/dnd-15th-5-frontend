import {
  CafeCoffeeImage,
  CafeDonutImage,
  CafeIceCreamImage,
  CommonBravoImage,
  CommonEyesImage,
  EntertainmentDartImage,
  EntertainmentLpImage,
  EntertainmentMicrophoneImage,
  RestaurantFriesImage,
  RestaurantPizzaImage,
  RestaurantSpatulaImage,
  SpecialImage,
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
  커피: CafeCoffeeImage,
  도넛: CafeDonutImage,
  아이스크림: CafeIceCreamImage,
  다트: EntertainmentDartImage,
  LP: EntertainmentLpImage,
  마이크: EntertainmentMicrophoneImage,
  감자튀김: RestaurantFriesImage,
  피자: RestaurantPizzaImage,
  뒤집개: RestaurantSpatulaImage,
  브라보: CommonBravoImage,
  눈: CommonEyesImage,
  스페셜: SpecialImage,
};
