// NOTE: 모델이 배경에 남기는 옅은 알파는 지우고, 피사체 내부의 덜 불투명한 알파는 채운다.
const TRANSPARENT_ALPHA = 80;
const OPAQUE_ALPHA = 200;
// NOTE: 여러 피사체를 함께 남기도록 가장 큰 덩어리의 10% 이상인 덩어리는 유지한다.
const MIN_COMPONENT_RATIO = 0.1;

/** 알파값을 기준 이하면 0, 이상이면 255로 바꾸고 그 사이만 선형으로 보간합니다. */
export const sharpenAlpha = (alpha: number) => {
  if (alpha <= TRANSPARENT_ALPHA) return 0;
  if (alpha >= OPAQUE_ALPHA) return 255;
  return Math.round(((alpha - TRANSPARENT_ALPHA) / (OPAQUE_ALPHA - TRANSPARENT_ALPHA)) * 255);
};

/** 상하좌우로 이어진 불투명 픽셀 덩어리에 1부터 번호를 붙이고 덩어리별 픽셀 수를 셉니다. */
const labelComponents = (data: Uint8ClampedArray, width: number, height: number) => {
  const length = width * height;
  const labels = new Int32Array(length);
  const sizes = [0];
  const stack = new Int32Array(length);
  for (let start = 0; start < length; start += 1) {
    if (labels[start] || data[start * 4 + 3] === 0) continue;
    const label = sizes.length;
    let size = 0;
    let top = 0;
    const visit = (index: number) => {
      if (labels[index] || data[index * 4 + 3] === 0) return;
      labels[index] = label;
      stack[top] = index;
      top += 1;
    };
    visit(start);
    while (top > 0) {
      top -= 1;
      const index = stack[top];
      size += 1;
      const x = index % width;
      if (x > 0) visit(index - 1);
      if (x < width - 1) visit(index + 1);
      if (index >= width) visit(index - width);
      if (index < length - width) visit(index + width);
    }
    sizes.push(size);
  }
  return { labels, sizes };
};

/**
 * 배경 제거 결과의 RGBA 픽셀에서 반투명 배경 잔상을 정리합니다. `data`를 직접 수정합니다.
 *
 * 알파를 선명하게 바꾼 뒤, 가장 큰 덩어리보다 훨씬 작은 떨어진 조각은 투명하게 지웁니다.
 */
export const refineSubjectAlpha = (data: Uint8ClampedArray, width: number, height: number) => {
  for (let index = 3; index < data.length; index += 4) data[index] = sharpenAlpha(data[index]);
  const { labels, sizes } = labelComponents(data, width, height);
  const minSize = sizes.reduce((largest, size) => Math.max(largest, size), 0) * MIN_COMPONENT_RATIO;
  for (let index = 0; index < labels.length; index += 1) {
    if (labels[index] && sizes[labels[index]] < minSize) data[index * 4 + 3] = 0;
  }
};
