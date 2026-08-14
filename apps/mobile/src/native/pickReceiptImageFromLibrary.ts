import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';

export type PickReceiptImageResult =
  { status: 'picked'; uri: string; width: number; height: number } | { status: 'cancelled' };

/**
 * 사진 보관함에서 영수증 이미지를 선택한다.
 *
 * 사진 보관함 접근 권한이 없으면 오류를 던진다.
 * 사용자가 선택을 취소하는 것은 실패가 아니므로 별도 상태로 구분해 돌려준다.
 * 아이폰 사진 보관함에는 HEIC으로 저장된 사진이 흔한데, 이 함수는 원본 형식을 그대로
 * 돌려주므로 이후 `normalizeReceiptImage`가 JPEG로 다시 인코딩하며 변환까지 처리한다.
 */
export const pickReceiptImageFromLibrary = async (): Promise<PickReceiptImageResult> => {
  const permission = await requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error('사진 보관함 접근 권한이 필요합니다');
  }

  const result = await launchImageLibraryAsync({ mediaTypes: ['images'] });

  if (result.canceled) {
    return { status: 'cancelled' };
  }

  const [asset] = result.assets;

  if (!asset) {
    throw new Error('선택한 이미지를 가져오지 못했습니다');
  }

  return { status: 'picked', uri: asset.uri, width: asset.width, height: asset.height };
};
