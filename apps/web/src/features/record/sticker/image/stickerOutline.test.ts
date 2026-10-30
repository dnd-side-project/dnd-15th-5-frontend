import { createOutlineAlpha, getDistanceToMask } from './stickerOutline';

const createMask = (width: number, height: number, pixels: [number, number][]) => {
  const mask = new Uint8Array(width * height);
  pixels.forEach(([x, y]) => {
    mask[y * width + x] = 1;
  });
  return mask;
};

describe('스티커 외곽선', () => {
  it('가장 가까운 피사체 픽셀까지의 거리를 구한다', () => {
    const distances = getDistanceToMask(createMask(5, 5, [[2, 2]]), 5, 5);
    expect(distances[2 * 5 + 2]).toBe(0);
    expect(distances[2 * 5 + 4]).toBe(2);
    expect(distances[0]).toBeCloseTo(Math.SQRT2 * 2);
  });

  it('피사체를 테두리 두께만큼 둥글게 넓힌다', () => {
    const size = 21;
    const alpha = createOutlineAlpha(createMask(size, size, [[10, 10]]), size, size, 4, 0);
    expect(alpha[10 * size + 14]).toBe(255);
    expect(alpha[10 * size + 16]).toBe(0);
    // NOTE: 대각선 방향은 사각형이 아니라 원형으로 넓혀진다.
    expect(alpha[14 * size + 14]).toBe(0);
  });

  it('두 피사체 사이의 좁은 틈을 메운다', () => {
    const width = 31;
    const height = 21;
    const mask = createMask(width, height, [
      [10, 10],
      [20, 10],
    ]);
    const gap = 10 * width + 15;
    expect(createOutlineAlpha(mask, width, height, 3, 0)[gap]).toBe(0);
    expect(createOutlineAlpha(mask, width, height, 3, 4)[gap]).toBe(255);
  });
});
