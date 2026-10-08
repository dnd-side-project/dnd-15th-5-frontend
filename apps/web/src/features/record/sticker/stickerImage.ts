const MAX_IMAGE_EDGE = 1536;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('이 환경에서는 이미지 편집을 지원하지 않아요.');
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
  const image = await loadImage(file);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  const { canvas, context } = createCanvas(
    Math.max(1, Math.round(image.naturalWidth * scale)),
    Math.max(1, Math.round(image.naturalHeight * scale))
  );
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return toPng(canvas);
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
  return new File([await toPng(canvas)], 'sticker-crop.png', { type: 'image/png' });
};
