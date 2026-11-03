import { createIsnetInput, createIsnetMask } from './isnetImage';

it('RGB를 채널별로 배치하고 원본 IS-Net 입력 범위로 정규화한다', () => {
  const result = createIsnetInput(new Uint8ClampedArray([255, 0, 128, 255, 0, 255, 64, 0]));
  expect(Array.from(result.slice(0, 4))).toEqual([0.5, -0.5, -0.5, 0.5]);
  expect(result[4]).toBeCloseTo(128 / 255 - 0.5);
  expect(result[5]).toBeCloseTo(64 / 255 - 0.5);
});

it('예측값의 최소·최대 사이를 부드러운 알파로 변환한다', () => {
  const result = createIsnetMask(new Float32Array([0.25, 0.5, 0.75]));
  expect([result[3], result[7], result[11]]).toEqual([0, 128, 255]);
});

it.each([0, 1])('균일한 마스크 %s도 유효한 알파를 유지한다', (value) => {
  const result = createIsnetMask(new Float32Array([value, value]));
  expect([result[3], result[7]]).toEqual([value * 255, value * 255]);
});

it('추론 결과가 유효하지 않으면 잘못된 PNG를 만들지 않는다', () => {
  expect(() => createIsnetMask(new Float32Array([NaN]))).toThrow('피사체 마스크');
});
