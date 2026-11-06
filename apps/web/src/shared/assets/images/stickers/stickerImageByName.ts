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

type StickerImageSource = {
  imageId?: number | null;
  imageUrl?: string | null;
  itemName?: string;
};

/** 업로드한 사진 URL을 우선 사용하고 기본 스티커는 이름으로 찾습니다. */
export const getStickerImage = ({ imageId, imageUrl, itemName }: StickerImageSource) => {
  const photoUrl = imageUrl?.trim();
  if (photoUrl) return photoUrl;

  const defaultImage = getStickerImageByName(itemName);
  if (defaultImage) return defaultImage;

  if (typeof imageId === 'number' && Number.isSafeInteger(imageId) && imageId > 0) {
    return StickerEyesImage;
  }

  return undefined;
};

/** 사진과 기본 스티커를 응답 순서와 각 항목의 개수대로 펼쳐 반환합니다. */
export const getStickerImages = (stickers: readonly (StickerImageSource & { count?: number })[]) =>
  stickers.flatMap(({ count, ...source }) => {
    const stickerCount = count === undefined ? 1 : count;
    if (!Number.isSafeInteger(stickerCount) || stickerCount <= 0) return [];

    const stickerImage = getStickerImage(source);
    return stickerImage ? Array.from({ length: stickerCount }, () => stickerImage) : [];
  });
