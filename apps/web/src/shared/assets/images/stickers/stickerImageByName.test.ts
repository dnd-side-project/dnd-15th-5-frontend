import { getStickerImageByName, getStickerImages } from './stickerImageByName';

describe('getStickerImages', () => {
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
});
