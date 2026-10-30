import { DEFAULT_STICKERS } from '@/shared/assets/images/ios-stickers/catalog';

import StickerBravoImage from './img-sticker-bravo.png';
import StickerDartImage from './img-sticker-dart.png';
import StickerDonutImage from './img-sticker-donut.png';
import StickerEyesImage from './img-sticker-eyes.png';
import StickerFlipperImage from './img-sticker-flipper.png';
import StickerFriesImage from './img-sticker-fries.png';
import StickerLpImage from './img-sticker-lp.png';
import StickerSpecialImage from './img-sticker-special.png';

/** 백엔드 스티커 이름별 웹 이미지 경로입니다. */
const STICKER_IMAGE_BY_NAME = new Map<string, string>([
  ['도넛', StickerDonutImage],
  ['다트', StickerDartImage],
  ['LP', StickerLpImage],
  ['감자튀김', StickerFriesImage],
  ['뒤집개', StickerFlipperImage],
  ['따봉', StickerBravoImage],
  ['눈', StickerEyesImage],
  ['왕관', StickerSpecialImage],
  ...DEFAULT_STICKERS.map(({ name, image }): [string, string] => [name, image]),
]);

/** 백엔드에서 지원하는 스티커 이름에 해당하는 이미지를 반환합니다. */
export const getStickerImageByName = (stickerName?: string) =>
  stickerName ? STICKER_IMAGE_BY_NAME.get(stickerName) : undefined;

/** 스티커 응답 목록에서 웹이 지원하는 이미지를 각 항목의 개수만큼 펼쳐 반환합니다. */
export const getStickerImages = (stickers: readonly { count?: number; itemName?: string }[]) =>
  stickers.flatMap(({ count, itemName }) => {
    const stickerImage = getStickerImageByName(itemName);
    const stickerCount =
      count === undefined ? 1 : Number.isSafeInteger(count) && count > 0 ? count : 0;

    return stickerImage ? Array.from({ length: stickerCount }, () => stickerImage) : [];
  });
