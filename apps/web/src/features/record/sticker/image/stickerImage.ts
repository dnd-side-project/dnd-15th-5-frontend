import { refineSubjectAlpha } from './stickerAlpha';
import { createOutlineAlpha } from './stickerOutline';

const MAX_IMAGE_EDGE = 1536;
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ALPHA_THRESHOLD = 24;
// NOTE: 작게 표시해도 테두리가 분명하도록 피사체 긴 변에 비례한 두께를 쓴다.
const BORDER_RATIO = 0.035;
const MIN_BORDER_WIDTH = 8;
const SHADOW_BLUR_RATIO = 0.4;
const SHADOW_COLOR = 'rgba(0, 0, 0, 0.18)';
// NOTE: 자르기에서 이미 크기·방향·PNG 변환을 마친 파일만 다시 인코딩하지 않습니다.
const preparedCrops = new WeakSet<File>();

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('이 환경에서는 이미지 편집을 지원하지 않아요.');
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  return { canvas, context };
};

const toPng = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('이미지를 저장하지 못했어요.'))),
      'image/png'
    );
  });

const loadImage = async (blob: Blob) => {
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } catch {
    throw new Error('사진을 읽지 못했어요. JPG, PNG 또는 WebP 파일을 선택해주세요.');
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const validateStickerFile = (file: File) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('JPG, PNG 또는 WebP 사진을 선택해주세요.');
  }
  if (file.size > MAX_FILE_BYTES) throw new Error('20MB 이하의 사진을 선택해주세요.');
};

/** 모바일 메모리 사용량을 제한하고 EXIF 방향이 적용된 이미지를 PNG로 정규화합니다. */
export const prepareStickerImage = async (file: File) => {
  validateStickerFile(file);
  if (preparedCrops.has(file)) return file;
  const image = await loadImage(file);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  const { canvas, context } = createCanvas(
    Math.max(1, Math.round(image.naturalWidth * scale)),
    Math.max(1, Math.round(image.naturalHeight * scale))
  );
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return toPng(canvas);
};

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

/**
 * 피사체를 감싸는 두꺼운 흰색 테두리와 옅은 그림자를 합성해 투명 PNG로 내보냅니다.
 * 테두리는 피사체 사이의 좁은 틈을 메운 둥근 외곽선으로 만듭니다.
 */
export const composeSticker = async (foreground: Blob) => {
  const image = await loadImage(foreground);
  const source = createCanvas(image.naturalWidth, image.naturalHeight);
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
  return toPng(result.canvas);
};

/** 원본 이미지에서 자를 영역입니다. 각 값은 이미지 너비·높이에 대한 0~1 비율입니다. */
export type StickerCrop = { left: number; top: number; right: number; bottom: number };
export type StickerCropCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export const FULL_STICKER_CROP: StickerCrop = { left: 0, top: 0, right: 1, bottom: 1 };

const clampRatio = (value: number) => Math.min(1, Math.max(0, value));

/** 드래그한 모서리를 이미지 안으로 제한하고, 맞은편 모서리와 최소 크기만큼 간격을 유지합니다. */
export const moveCropCorner = (
  crop: StickerCrop,
  corner: StickerCropCorner,
  point: { x: number; y: number },
  minSize: { width: number; height: number }
): StickerCrop => {
  const next = { ...crop };
  if (corner.endsWith('left'))
    next.left = clampRatio(Math.min(point.x, crop.right - minSize.width));
  else next.right = clampRatio(Math.max(point.x, crop.left + minSize.width));
  if (corner.startsWith('top'))
    next.top = clampRatio(Math.min(point.y, crop.bottom - minSize.height));
  else next.bottom = clampRatio(Math.max(point.y, crop.top + minSize.height));
  return next;
};

/** 선택한 영역만 잘라 긴 변을 최대 1536px로 줄인 PNG 파일을 만듭니다. */
export const cropStickerImage = async (file: File, crop: StickerCrop) => {
  validateStickerFile(file);
  const image = await loadImage(file);
  const sourceX = Math.round(crop.left * image.naturalWidth);
  const sourceY = Math.round(crop.top * image.naturalHeight);
  const sourceWidth = Math.max(1, Math.round((crop.right - crop.left) * image.naturalWidth));
  const sourceHeight = Math.max(1, Math.round((crop.bottom - crop.top) * image.naturalHeight));
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(sourceWidth, sourceHeight));
  const { canvas, context } = createCanvas(
    Math.max(1, Math.round(sourceWidth * scale)),
    Math.max(1, Math.round(sourceHeight * scale))
  );
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );
  const cropped = new File([await toPng(canvas)], 'sticker-crop.png', { type: 'image/png' });
  preparedCrops.add(cropped);
  return cropped;
};
