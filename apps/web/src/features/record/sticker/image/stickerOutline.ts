const INFINITE_DISTANCE = 1e20;

/** 한 줄의 제곱 거리를 하한 포락선으로 계산합니다(Felzenszwalb & Huttenlocher). */
const transformLine = (
  values: Float64Array,
  length: number,
  output: Float64Array,
  parabolas: Int32Array,
  boundaries: Float64Array
) => {
  let count = 0;
  parabolas[0] = 0;
  boundaries[0] = -INFINITE_DISTANCE;
  boundaries[1] = INFINITE_DISTANCE;
  for (let index = 1; index < length; index += 1) {
    let intersection: number;
    do {
      const previous = parabolas[count];
      intersection =
        (values[index] + index * index - (values[previous] + previous * previous)) /
        (2 * index - 2 * previous);
      if (intersection > boundaries[count]) break;
      count -= 1;
    } while (count >= 0);
    count += 1;
    parabolas[count] = index;
    boundaries[count] = intersection;
    boundaries[count + 1] = INFINITE_DISTANCE;
  }
  count = 0;
  for (let index = 0; index < length; index += 1) {
    while (boundaries[count + 1] < index) count += 1;
    const parabola = parabolas[count];
    output[index] = (index - parabola) * (index - parabola) + values[parabola];
  }
};

/** 각 픽셀에서 가장 가까운 대상 픽셀까지의 유클리드 거리를 구합니다. 대상 픽셀은 0입니다. */
export const getDistanceToMask = (mask: Uint8Array, width: number, height: number) => {
  // NOTE: 큰 사진의 메모리를 줄이려고 Float32를 쓴다. 제곱 거리도 정수 범위 안에서 정확하다.
  const distances = new Float32Array(width * height);
  for (let index = 0; index < distances.length; index += 1) {
    distances[index] = mask[index] ? 0 : INFINITE_DISTANCE;
  }
  const size = Math.max(width, height);
  const values = new Float64Array(size);
  const output = new Float64Array(size);
  const parabolas = new Int32Array(size);
  const boundaries = new Float64Array(size + 1);
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) values[y] = distances[y * width + x];
    transformLine(values, height, output, parabolas, boundaries);
    for (let y = 0; y < height; y += 1) distances[y * width + x] = output[y];
  }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) values[x] = distances[y * width + x];
    transformLine(values, width, output, parabolas, boundaries);
    for (let x = 0; x < width; x += 1) distances[y * width + x] = Math.sqrt(output[x]);
  }
  return distances;
};

/**
 * 피사체 마스크를 `border`만큼 넓힌 테두리의 알파값(0~255)을 만듭니다.
 *
 * `smoothing`만큼 더 넓혔다가 다시 줄여(closing) 피사체 사이의 좁은 틈과 오목한 곳을 메우고
 * 외곽선을 둥글게 만듭니다. 테두리가 잘리지 않도록 마스크 가장자리에 `border + smoothing`보다
 * 넓은 투명 여백이 있어야 합니다.
 */
export const createOutlineAlpha = (
  mask: Uint8Array,
  width: number,
  height: number,
  border: number,
  smoothing: number
) => {
  const distanceToSubject = getDistanceToMask(mask, width, height);
  const outside = new Uint8Array(mask.length);
  for (let index = 0; index < mask.length; index += 1) {
    outside[index] = distanceToSubject[index] > border + smoothing ? 1 : 0;
  }
  const distanceToOutside = getDistanceToMask(outside, width, height);
  const alpha = new Uint8ClampedArray(mask.length);
  for (let index = 0; index < mask.length; index += 1) {
    // NOTE: 경계 1px을 거리 비율로 채워 계단 현상 없이 부드러운 외곽선을 만든다.
    alpha[index] = Math.round(Math.min(1, Math.max(0, distanceToOutside[index] - smoothing)) * 255);
  }
  return alpha;
};
