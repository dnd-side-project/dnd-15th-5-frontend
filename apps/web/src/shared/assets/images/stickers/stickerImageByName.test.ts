import { DEFAULT_STICKERS } from '@/shared/assets/images/ios-stickers/catalog';

import StickerEyesImage from './img-sticker-eyes.png';
import { getStickerImage, getStickerImageByName, getStickerImages } from './stickerImageByName';

describe('getStickerImages', () => {
  it('유효한 사진 ID가 없으면 임의로 사진 대체 스티커를 만들지 않는다', () => {
    expect(
      getStickerImages([{ imageId: null }, { imageId: 0 }, { imageId: -1 }, { imageId: 1.5 }])
    ).toEqual([]);
  });
  it('사진 URL을 우선 표시하고 기본 스티커와 섞여도 순서와 개수를 유지한다', () => {
    const photo = 'https://example.com/photo-sticker.png';
    expect(
      getStickerImages([
        { imageUrl: photo, itemName: '커피', count: 2 },
        { itemName: '눈' },
        { imageUrl: '   ', itemName: '따봉' },
        { imageId: 12 },
        { imageUrl: photo, count: 0 },
      ])
    ).toEqual([
      photo,
      photo,
      getStickerImageByName('눈'),
      getStickerImageByName('따봉'),
      StickerEyesImage,
    ]);
    expect(getStickerImage({ imageUrl: ` ${photo} ` })).toBe(photo);
    expect(getStickerImage({ imageUrl: null, itemName: '커피' })).toBe(
      getStickerImageByName('커피')
    );
  });
  it('기록에서 선택한 기본 이모지와 같은 이미지를 서버 이름으로 표시한다', () => {
    for (const sticker of DEFAULT_STICKERS) {
      expect(getStickerImageByName(sticker.name)).toBe(sticker.image);
    }
    expect(getStickerImageByName('서버에 없는 이름')).toBeUndefined();
  });
  it('지원하는 스티커의 이미지 경로만 반환한다', () => {
    expect(
      getStickerImages([
        { itemName: '커피' },
        { itemName: '눈' },
        { itemName: '왕관' },
        { itemName: '따봉' },
        { itemName: '미지원' },
        {},
      ])
    ).toEqual([
      getStickerImageByName('커피'),
      getStickerImageByName('눈'),
      getStickerImageByName('왕관'),
      getStickerImageByName('따봉'),
    ]);
  });

  it('summary의 스티커를 count만큼 모두 펼친다', () => {
    expect(
      getStickerImages([
        { itemName: '눈', count: 3 },
        { itemName: '따봉', count: 2 },
        { itemName: '왕관', count: 1 },
      ])
    ).toEqual([
      getStickerImageByName('눈'),
      getStickerImageByName('눈'),
      getStickerImageByName('눈'),
      getStickerImageByName('따봉'),
      getStickerImageByName('따봉'),
      getStickerImageByName('왕관'),
    ]);
  });
});
