import { File, Paths } from 'expo-file-system';
import { Asset, requestPermissionsAsync } from 'expo-media-library';

const DEFAULT_IMAGE_FILE_NAME = 'chapchap-report';
const MAX_IMAGE_FILE_NAME_LENGTH = 80;
let temporaryFileSequence = 0;

const createTemporaryFileName = (fileName: string) => {
  const nameWithoutPath = fileName.split(/[\\/]/).pop() ?? '';
  const nameWithoutExtension = nameWithoutPath.replace(/\.png$/i, '');
  const safeName = [...nameWithoutExtension]
    .filter((character) => character.charCodeAt(0) >= 32)
    .join('')
    .replace(/[<>:"|?*]/g, '-')
    .trim()
    .slice(0, MAX_IMAGE_FILE_NAME_LENGTH);

  const sequence = temporaryFileSequence++;

  return `${Date.now()}-${sequence}-${safeName || DEFAULT_IMAGE_FILE_NAME}.png`;
};

/**
 * Base64 PNG를 임시 파일로 만든 뒤 기기의 사진 보관함에 저장한다.
 *
 * 사진 읽기 권한은 요청하지 않으며, 저장이 끝나거나 실패하면 임시 파일을 제거한다.
 *
 * @param base64 data URL prefix가 없는 PNG의 Base64 문자열
 * @param fileName 사진 보관함에 전달할 PNG 파일명
 */
export const saveImageToLibrary = async (base64: string, fileName: string) => {
  if (!base64 || !fileName) {
    throw new Error('저장할 이미지 정보가 올바르지 않습니다');
  }

  const permission = await requestPermissionsAsync(true, []);

  if (!permission.granted) {
    throw new Error('사진 저장 권한이 필요합니다');
  }

  // NOTE: 사진 보관함 API가 로컬 파일 경로를 받으므로 Base64를 캐시 파일로 변환한다.
  const temporaryFile = new File(Paths.cache, createTemporaryFileName(fileName));

  try {
    temporaryFile.create();
    temporaryFile.write(base64, { encoding: 'base64' });
    await Asset.create(temporaryFile.uri);
  } finally {
    if (temporaryFile.exists) {
      try {
        temporaryFile.delete();
      } catch {
        // INFO: 캐시 정리 실패가 이미 완료된 사진 저장 결과를 실패로 바꾸지 않게 한다.
      }
    }
  }
};
