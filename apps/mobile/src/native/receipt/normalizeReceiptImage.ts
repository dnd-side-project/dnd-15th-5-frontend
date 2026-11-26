import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { releaseTemporaryImage, trackTemporaryImage } from '@/native/image/temporaryImageFiles';

import { MAX_IMAGE_DIMENSION, MAX_IMAGE_FILE_SIZE_BYTES } from './imageConstraints';

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
 * 중간 파일과 네이티브 이미지 참조는 정리하고, 최종 파일의 정리 책임은 호출자에게 넘긴다.
 */
export const normalizeReceiptImage = async ({
  uri,
  width,
  height,
}: ReceiptImageSource): Promise<{ uri: string }> => {
  const context = ImageManipulator.manipulate(uri);
  try {
    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      context.resize(
        width >= height ? { width: MAX_IMAGE_DIMENSION } : { height: MAX_IMAGE_DIMENSION }
      );
    }
    const image = await context.renderAsync();
    let result: { uri: string } | undefined;
    let keepResult = false;
    try {
      let quality = INITIAL_QUALITY;
      result = await image.saveAsync({ format: SaveFormat.JPEG, compress: quality });
      trackTemporaryImage(result.uri);
      while (new File(result.uri).size > MAX_IMAGE_FILE_SIZE_BYTES && quality > MIN_QUALITY) {
        // NOTE: 부동소수점 오차 없이 0.1까지 낮추고, 이전 압축 파일은 더 사용하지 않습니다.
        quality = Math.max(MIN_QUALITY, Math.round((quality - QUALITY_STEP) * 10) / 10);
        const previousUri = result.uri;
        result = await image.saveAsync({ format: SaveFormat.JPEG, compress: quality });
        trackTemporaryImage(result.uri);
        if (previousUri !== result.uri) releaseTemporaryImage(previousUri);
      }
      if (new File(result.uri).size > MAX_IMAGE_FILE_SIZE_BYTES) {
        throw new Error('이미지 용량을 5MB 이하로 줄이지 못했습니다');
      }
      keepResult = true;
      return result;
    } finally {
      if (!keepResult) releaseTemporaryImage(result?.uri);
      image.release();
    }
  } finally {
    context.release();
  }
};
