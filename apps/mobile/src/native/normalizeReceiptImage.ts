import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** 백엔드 OCR이 받는 최대 변 길이(px). 가로·세로 중 큰 쪽 기준이다. */
const MAX_DIMENSION = 4096;
/** 백엔드 OCR이 받는 최대 파일 크기(byte). */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const INITIAL_QUALITY = 0.8;
const MIN_QUALITY = 0.1;
const QUALITY_STEP = 0.1;

type ReceiptImageSource = {
  uri: string;
  width: number;
  height: number;
};

/**
 * 촬영한 영수증 이미지를 백엔드 OCR 제약(4096x4096, 5MB)에 맞게 정리한다.
 *
 * 두 변 중 하나라도 4096을 넘으면 비율을 유지한 채 줄이고, 그래도 5MB를 넘으면
 * 5MB 이하가 될 때까지 화질을 단계적으로 낮춘다.
 * expo-camera로 촬영한 이미지는 항상 JPEG이라 별도 포맷 변환은 하지 않는다.
 */
export const normalizeReceiptImage = async ({
  uri,
  width,
  height,
}: ReceiptImageSource): Promise<{ uri: string }> => {
  const context = ImageManipulator.manipulate(uri);

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width >= height) {
      context.resize({ width: MAX_DIMENSION });
    } else {
      context.resize({ height: MAX_DIMENSION });
    }
  }

  const image = await context.renderAsync();
  let quality = INITIAL_QUALITY;
  let result = await image.saveAsync({ format: SaveFormat.JPEG, compress: quality });

  while (new File(result.uri).size > MAX_FILE_SIZE_BYTES && quality > MIN_QUALITY) {
    // NOTE: 부동소수점 오차가 쌓이면 0.1 근처에서 루프가 한 번 더/덜 돌 수 있어 소수 첫째 자리로 반올림한다.
    quality = Math.max(MIN_QUALITY, Math.round((quality - QUALITY_STEP) * 10) / 10);
    result = await image.saveAsync({ format: SaveFormat.JPEG, compress: quality });
  }

  return result;
};
