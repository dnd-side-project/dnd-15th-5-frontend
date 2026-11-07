const COLOR_CHANNELS = 3;
const RGBA_CHANNELS = 4;
const MAX_COLOR = 255;
const INPUT_MEAN = 0.5;

export const ISNET_INPUT_SIZE = 1024;

/** IS-Net 원본 모델의 RGB 입력을 정규화하고 HWC에서 CHW로 변환합니다. */
export const createIsnetInput = (pixels: Uint8ClampedArray) => {
  const pixelCount = pixels.length / RGBA_CHANNELS;
  const input = new Float32Array(pixelCount * COLOR_CHANNELS);
  for (let index = 0; index < pixelCount; index += 1) {
    for (let channel = 0; channel < COLOR_CHANNELS; channel += 1) {
      input[channel * pixelCount + index] =
        pixels[index * RGBA_CHANNELS + channel] / MAX_COLOR - INPUT_MEAN;
    }
  }
  return input;
};

/** 예측값을 알파로 정규화합니다. 균일한 마스크는 0으로 나누지 않고 그대로 보존합니다. */
export const createIsnetMask = (prediction: Float32Array) => {
  let minimum = Infinity;
  let maximum = -Infinity;
  for (const value of prediction) {
    if (!Number.isFinite(value)) throw new Error('피사체 마스크를 읽지 못했어요.');
    minimum = Math.min(minimum, value);
    maximum = Math.max(maximum, value);
  }
  const range = maximum - minimum;
  const pixels = new Uint8ClampedArray(prediction.length * RGBA_CHANNELS);
  for (let index = 0; index < prediction.length; index += 1) {
    const alpha = range > 0 ? (prediction[index] - minimum) / range : prediction[index];
    pixels[index * RGBA_CHANNELS + 3] = Math.round(Math.min(1, Math.max(0, alpha)) * MAX_COLOR);
  }
  return pixels;
};
