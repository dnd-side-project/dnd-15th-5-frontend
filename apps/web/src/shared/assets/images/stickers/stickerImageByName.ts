import StickerCoffeeImage from './img-sticker-coffee.png';
import StickerDartImage from './img-sticker-dart.png';
import StickerDonutImage from './img-sticker-donut.png';
import StickerFlipperImage from './img-sticker-flipper.png';
import StickerFriesImage from './img-sticker-fries.png';
import StickerIceCreamImage from './img-sticker-ice-cream.png';
import StickerLpImage from './img-sticker-lp.png';
import StickerMicrophoneImage from './img-sticker-microphone.png';
import StickerPizzaImage from './img-sticker-pizza.png';

/** 백엔드 스티커 이름별 웹 이미지 경로입니다. */
// TODO: 백엔드에서 따봉(브라보), 눈, 스페셜 스티커를 지원하면 이미지 매핑을 추가합니다.
const STICKER_IMAGE_BY_NAME = new Map<string, string>([
  ['커피', StickerCoffeeImage],
  ['도넛', StickerDonutImage],
  ['아이스크림', StickerIceCreamImage],
  ['다트', StickerDartImage],
  ['LP', StickerLpImage],
  ['마이크', StickerMicrophoneImage],
  ['감자튀김', StickerFriesImage],
  ['피자', StickerPizzaImage],
  ['뒤집개', StickerFlipperImage],
]);

/** 백엔드에서 지원하는 스티커 이름에 해당하는 이미지를 반환합니다. */
export const getStickerImageByName = (stickerName?: string) =>
  stickerName ? STICKER_IMAGE_BY_NAME.get(stickerName) : undefined;
