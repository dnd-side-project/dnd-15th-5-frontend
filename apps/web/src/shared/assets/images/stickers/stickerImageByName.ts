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

/** 백엔드 스티커 이름별 웹 이미지 경로입니다. */
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
  ['눈', StickerEyesImage],
  ['왕관', StickerSpecialImage],
  ['따봉', StickerBravoImage],
]);

/** 백엔드에서 지원하는 스티커 이름에 해당하는 이미지를 반환합니다. */
export const getStickerImageByName = (stickerName?: string) =>
  stickerName ? STICKER_IMAGE_BY_NAME.get(stickerName) : undefined;

/** 스티커 응답 목록에서 웹에서 지원하는 이미지 경로만 반환합니다. */
export const getStickerImages = (stickers: readonly { itemName?: string }[]) =>
  stickers.flatMap(({ itemName }) => {
    const stickerImage = getStickerImageByName(itemName);

    return stickerImage ? [stickerImage] : [];
  });
