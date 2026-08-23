import StickerBravoImage from './img-sticker-bravo.png';
import StickerCoffeeImage from './img-sticker-coffee.png';
import StickerDartImage from './img-sticker-dart.png';
import StickerDonutImage from './img-sticker-donut.png';
import StickerEyesImage from './img-sticker-eyes.png';
import StickerFlipperImage from './img-sticker-flipper.png';
import StickerFriesImage from './img-sticker-fries.png';
import StickerIceCreamImage from './img-sticker-ice-cream.png';
import StickerLpImage from './img-sticker-lp.png';
import StickerMicrophoneImage from './img-sticker-microphone.png';
import StickerPizzaImage from './img-sticker-pizza.png';
import StickerSpecialImage from './img-sticker-special.png';

/** 백엔드 스티커 이름을 웹에서 표시할 이미지로 변환합니다. */
const STICKER_IMAGE_BY_NAME: Record<string, string> = {
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

export const getStickerImageByName = (stickerName?: string) =>
  STICKER_IMAGE_BY_NAME[stickerName ?? ''] ?? StickerSpecialImage;
