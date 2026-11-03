import { refineSubjectAlpha, sharpenAlpha } from './stickerAlpha';

const createPixels = (width: number, height: number, alphas: [number, number, number][]) => {
  const data = new Uint8ClampedArray(width * height * 4);
  alphas.forEach(([x, y, alpha]) => {
    data[(y * width + x) * 4 + 3] = alpha;
  });
  return data;
};

const getAlpha = (data: Uint8ClampedArray, width: number, x: number, y: number) =>
  data[(y * width + x) * 4 + 3];

const fillRect = (left: number, top: number, size: number, alpha: number) =>
  Array.from({ length: size * size }, (_, index): [number, number, number] => [
    left + (index % size),
    top + Math.floor(index / size),
    alpha,
  ]);

describe('스티커 알파 정리', () => {
  it('옅은 알파는 지우고 진한 알파는 불투명하게 바꾼다', () => {
    expect(sharpenAlpha(10)).toBe(0);
    expect(sharpenAlpha(80)).toBe(0);
    expect(sharpenAlpha(140)).toBe(128);
    expect(sharpenAlpha(200)).toBe(255);
    expect(sharpenAlpha(230)).toBe(255);
  });

  it('피사체 밖의 반투명 잔상을 투명하게 만든다', () => {
    const data = createPixels(5, 1, [
      [0, 0, 30],
      [1, 0, 220],
      [2, 0, 220],
      [3, 0, 220],
      [4, 0, 30],
    ]);
    refineSubjectAlpha(data, 5, 1);
    expect(getAlpha(data, 5, 0, 0)).toBe(0);
    expect(getAlpha(data, 5, 2, 0)).toBe(255);
    expect(getAlpha(data, 5, 4, 0)).toBe(0);
  });

  it('가장 큰 덩어리보다 훨씬 작은 떨어진 조각을 지운다', () => {
    const width = 20;
    const data = createPixels(width, 20, [...fillRect(0, 0, 10, 255), [15, 15, 255]]);
    refineSubjectAlpha(data, width, 20);
    expect(getAlpha(data, width, 5, 5)).toBe(255);
    expect(getAlpha(data, width, 15, 15)).toBe(0);
  });

  it('비슷한 크기의 피사체는 함께 남긴다', () => {
    const width = 20;
    const data = createPixels(width, 10, [...fillRect(0, 0, 6, 255), ...fillRect(10, 0, 5, 255)]);
    refineSubjectAlpha(data, width, 10);
    expect(getAlpha(data, width, 2, 2)).toBe(255);
    expect(getAlpha(data, width, 12, 2)).toBe(255);
  });

  it('대각선으로만 닿은 픽셀은 다른 덩어리로 본다', () => {
    const width = 20;
    const data = createPixels(width, 20, [...fillRect(0, 0, 10, 255), [10, 10, 255]]);
    refineSubjectAlpha(data, width, 20);
    expect(getAlpha(data, width, 10, 10)).toBe(0);
  });
});
