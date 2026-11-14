import { refineSubjectAlpha } from './stickerAlpha';
import { createOutlineAlpha } from './stickerOutline';

const ALPHA_THRESHOLD = 24;
// NOTE: 작게 표시해도 테두리가 분명하도록 피사체 긴 변에 비례한 두께를 쓴다.
const BORDER_RATIO = 0.035;
const MIN_BORDER_WIDTH = 8;
const SHADOW_BLUR_RATIO = 0.4;
const SHADOW_COLOR = 'rgba(0, 0, 0, 0.18)';

/** 유효한 알파 영역의 경계를 찾습니다. 희미한 배경 잔상은 크롭 기준에서 제외합니다. */
export const getAlphaBounds = (data: Uint8ClampedArray, width: number, height: number) => {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] <= ALPHA_THRESHOLD) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  return right < 0 ? null : { left, top, width: right - left + 1, height: bottom - top + 1 };
};

type StickerCanvas = HTMLCanvasElement | OffscreenCanvas;
type StickerSurface<T extends StickerCanvas> = {
  canvas: T;
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
};

/** DOM과 Worker에서 같은 알파 보정·테두리·그림자 계산으로 스티커를 합성합니다. */
export const renderSticker = <T extends StickerCanvas>(
  image: CanvasImageSource,
  imageWidth: number,
  imageHeight: number,
  createCanvas: (width: number, height: number) => StickerSurface<T>
): T => {
  const source = createCanvas(imageWidth, imageHeight);
  source.context.drawImage(image, 0, 0);
  const pixels = source.context.getImageData(0, 0, source.canvas.width, source.canvas.height);
  refineSubjectAlpha(pixels.data, pixels.width, pixels.height);
  source.context.putImageData(pixels, 0, 0);
  const bounds = getAlphaBounds(pixels.data, pixels.width, pixels.height);
  if (!bounds) throw new Error('피사체를 찾지 못했어요. 다른 사진으로 시도해주세요.');
  const border = Math.max(
    MIN_BORDER_WIDTH,
    Math.round(Math.max(bounds.width, bounds.height) * BORDER_RATIO)
  );
  const smoothing = border;
  const shadowBlur = Math.round(border * SHADOW_BLUR_RATIO);
  // NOTE: 외곽선을 넓혔다 줄이는 동안 캔버스 가장자리에 닿지 않도록 작업 여백을 둔다.
  const margin = border + smoothing + 2;
  const subject = createCanvas(bounds.width + margin * 2, bounds.height + margin * 2);
  const { width, height } = subject.canvas;
  subject.context.drawImage(
    source.canvas,
    bounds.left,
    bounds.top,
    bounds.width,
    bounds.height,
    margin,
    margin,
    bounds.width,
    bounds.height
  );
  const subjectPixels = subject.context.getImageData(0, 0, width, height).data;
  const mask = new Uint8Array(width * height);
  for (let index = 0; index < mask.length; index += 1) {
    mask[index] = subjectPixels[index * 4 + 3] > ALPHA_THRESHOLD ? 1 : 0;
  }
  const outlineAlpha = createOutlineAlpha(mask, width, height, border, smoothing);
  const outline = createCanvas(width, height);
  const outlinePixels = outline.context.createImageData(width, height);
  for (let index = 0; index < outlineAlpha.length; index += 1) {
    outlinePixels.data.fill(255, index * 4, index * 4 + 3);
    outlinePixels.data[index * 4 + 3] = outlineAlpha[index];
  }
  outline.context.putImageData(outlinePixels, 0, 0);
  const padding = border + shadowBlur + 2;
  const offset = padding - margin;
  const result = createCanvas(bounds.width + padding * 2, bounds.height + padding * 2);
  result.context.shadowColor = SHADOW_COLOR;
  result.context.shadowBlur = shadowBlur;
  result.context.drawImage(outline.canvas, offset, offset);
  result.context.shadowColor = 'transparent';
  result.context.shadowBlur = 0;
  result.context.drawImage(subject.canvas, offset, offset);
  return result.canvas;
};
