import {
  FULL_STICKER_CROP,
  getAlphaBounds,
  moveCropCorner,
  validateStickerFile,
} from './stickerImage';

describe('스티커 이미지 검사', () => {
  it('투명 여백과 희미한 잔상을 제외한 피사체 경계를 반환한다', () => {
    const data = new Uint8ClampedArray(4 * 4 * 4);
    data[3] = 10;
    data[(1 * 4 + 1) * 4 + 3] = 255;
    data[(2 * 4 + 2) * 4 + 3] = 255;
    expect(getAlphaBounds(data, 4, 4)).toEqual({ left: 1, top: 1, width: 2, height: 2 });
  });
  it('피사체가 없으면 null을 반환한다', () => {
    expect(getAlphaBounds(new Uint8ClampedArray(16), 2, 2)).toBeNull();
  });
  it('이미지 가장자리의 피사체를 포함한다', () => {
    const data = new Uint8ClampedArray(16);
    data[3] = 255;
    data[15] = 255;
    expect(getAlphaBounds(data, 2, 2)).toEqual({ left: 0, top: 0, width: 2, height: 2 });
  });
  it('지원하지 않는 파일을 거절한다', () => {
    expect(() =>
      validateStickerFile(new File(['x'], 'photo.heic', { type: 'image/heic' }))
    ).toThrow('JPG');
  });
  it('20MB 초과 사진을 거절한다', () => {
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 20 * 1024 * 1024 + 1 });
    expect(() => validateStickerFile(file)).toThrow('20MB');
  });
});

describe('스티커 자르기 영역', () => {
  const minSize = { width: 0.1, height: 0.1 };

  it('드래그한 모서리만 이동한다', () => {
    expect(moveCropCorner(FULL_STICKER_CROP, 'top-left', { x: 0.2, y: 0.3 }, minSize)).toEqual({
      left: 0.2,
      top: 0.3,
      right: 1,
      bottom: 1,
    });
    expect(moveCropCorner(FULL_STICKER_CROP, 'bottom-right', { x: 0.6, y: 0.7 }, minSize)).toEqual({
      left: 0,
      top: 0,
      right: 0.6,
      bottom: 0.7,
    });
  });

  it('이미지 밖으로 나가지 않는다', () => {
    expect(moveCropCorner(FULL_STICKER_CROP, 'top-right', { x: 1.4, y: -0.2 }, minSize)).toEqual(
      FULL_STICKER_CROP
    );
  });

  it('맞은편 모서리와 최소 크기만큼 간격을 유지한다', () => {
    const crop = { left: 0.2, top: 0.2, right: 0.6, bottom: 0.6 };
    const next = moveCropCorner(crop, 'bottom-right', { x: 0.1, y: 0.1 }, minSize);
    expect(next.right).toBeCloseTo(0.3);
    expect(next.bottom).toBeCloseTo(0.3);
  });
});
