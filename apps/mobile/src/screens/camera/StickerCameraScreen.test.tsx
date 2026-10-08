import { act, fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { finishStickerCapture, isStickerCaptureActive } from '@/native/captureStickerPhoto';
import { prepareStickerPhoto } from '@/native/prepareStickerPhoto';

import StickerCameraScreen from './StickerCameraScreen';

const mockTakePicture = jest.fn();
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('expo-camera', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  const CameraView = React.forwardRef(
    (
      { onCameraReady, facing }: { onCameraReady: () => void; facing: string },
      ref: React.ForwardedRef<unknown>
    ) => {
      React.useImperativeHandle(ref, () => ({ takePictureAsync: mockTakePicture }));
      React.useEffect(() => onCameraReady(), [onCameraReady]);
      return <View testID="sticker-camera" accessibilityLabel={facing} />;
    }
  );
  CameraView.displayName = 'CameraView';
  return { CameraView };
});
jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: () => ({ captureId: 'capture-01' }),
}));
jest.mock('@/native/captureStickerPhoto', () => ({
  finishStickerCapture: jest.fn(),
  isStickerCaptureActive: jest.fn(),
}));
jest.mock('@/native/prepareStickerPhoto', () => ({ prepareStickerPhoto: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(isStickerCaptureActive).mockReturnValue(true);
  mockTakePicture.mockResolvedValue({ uri: 'file://photo.jpg', width: 100, height: 100 });
  jest
    .mocked(prepareStickerPhoto)
    .mockResolvedValue({ status: 'success', base64: 'cGhvdG8=', mimeType: 'image/jpeg' });
});
it('촬영 후 WebView로 돌아가고 카메라 화면이 닫힌 뒤 사진을 반환한다', async () => {
  const { getByLabelText, unmount } = await render(<StickerCameraScreen />);
  await act(async () => fireEvent.press(getByLabelText('스티커 사진 촬영')));
  expect(router.back).toHaveBeenCalled();
  expect(finishStickerCapture).not.toHaveBeenCalled();
  await act(async () => unmount());
  expect(finishStickerCapture).toHaveBeenCalledWith('capture-01', {
    status: 'success',
    base64: 'cGhvdG8=',
    mimeType: 'image/jpeg',
  });
});
it('전후면 카메라를 전환한다', async () => {
  const { getByLabelText, getByTestId } = await render(<StickerCameraScreen />);
  await fireEvent.press(getByLabelText('카메라 전환'));
  expect(getByTestId('sticker-camera')).toHaveProp('accessibilityLabel', 'front');
});
it('닫으면 촬영을 취소한다', async () => {
  const { getByLabelText } = await render(<StickerCameraScreen />);
  await fireEvent.press(getByLabelText('촬영 닫기'));
  expect(finishStickerCapture).toHaveBeenCalledWith('capture-01', { status: 'cancelled' });
  expect(router.back).toHaveBeenCalled();
});
it('사진 처리 실패 시 같은 화면에서 재시도할 수 있다', async () => {
  jest.mocked(prepareStickerPhoto).mockRejectedValueOnce(new Error('failure'));
  const { getByLabelText, getByText } = await render(<StickerCameraScreen />);
  await act(async () => fireEvent.press(getByLabelText('스티커 사진 촬영')));
  expect(getByText('사진 변환에 실패했어요. failure')).toBeOnTheScreen();
  expect(router.back).not.toHaveBeenCalled();
  await act(async () => fireEvent.press(getByLabelText('스티커 사진 촬영')));
  expect(router.back).toHaveBeenCalled();
});
