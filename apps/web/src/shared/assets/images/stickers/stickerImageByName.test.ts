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
        { itemName: '케이크' },
        { imageUrl: '   ', itemName: '피자' },
        { imageId: 12 },
        { imageUrl: photo, count: 0 },
      ])
    ).toEqual([
      photo,
      photo,
      getStickerImageByName('케이크'),
      getStickerImageByName('피자'),
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

  it.each(['도넛', '다트', 'LP', '감자튀김', '뒤집개', '따봉', '눈', '왕관'])(
    '이전 스티커 이름은 지원 목록에 포함하지 않는다: %s',
    (name) => {
      expect(getStickerImageByName(name)).toBeUndefined();
      expect(getStickerImages([{ itemName: name }])).toEqual([]);
    }
  );

  it('지원하는 스티커의 이미지 경로만 반환한다', () => {
    expect(
      getStickerImages([
        { itemName: '커피' },
        { itemName: '케이크' },
        { itemName: '게임기' },
        { itemName: '피자' },
        { itemName: '미지원' },
        {},
      ])
    ).toEqual([
      getStickerImageByName('커피'),
      getStickerImageByName('케이크'),
      getStickerImageByName('게임기'),
      getStickerImageByName('피자'),
    ]);
  });

  it('summary의 스티커를 count만큼 모두 펼친다', () => {
    expect(
      getStickerImages([
        { itemName: '케이크', count: 3 },
        { itemName: '피자', count: 2 },
        { itemName: '게임기', count: 1 },
      ])
    ).toEqual([
      getStickerImageByName('케이크'),
      getStickerImageByName('케이크'),
      getStickerImageByName('케이크'),
      getStickerImageByName('피자'),
      getStickerImageByName('피자'),
      getStickerImageByName('게임기'),
    ]);
  });
});
