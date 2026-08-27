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
