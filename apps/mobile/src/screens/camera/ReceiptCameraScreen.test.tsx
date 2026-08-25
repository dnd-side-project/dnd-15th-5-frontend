import { act, fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { requestWebViewNavigation } from '@/bridge/webViewNavigation';
import { recognizeReceipt } from '@/features/record/apis/clients';
import { normalizeReceiptImage } from '@/native/normalizeReceiptImage';
import { pickReceiptImageFromLibrary } from '@/native/pickReceiptImageFromLibrary';

import ReceiptCameraScreen from './ReceiptCameraScreen';

const mockTakePictureAsync = jest.fn();
const mockShowToast = jest.fn();

jest.mock('expo-camera', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  const CameraView = React.forwardRef(
    ({ onCameraReady }: { onCameraReady?: () => void }, ref: React.ForwardedRef<unknown>) => {
      React.useImperativeHandle(ref, () => ({ takePictureAsync: mockTakePictureAsync }));
      React.useEffect(() => onCameraReady?.(), [onCameraReady]);

      return <View testID="camera-view" />;
    }
  );

  CameraView.displayName = 'CameraView';

  return { CameraView };
});

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), dismissTo: jest.fn(), replace: jest.fn() },
}));
jest.mock('@/bridge/webViewNavigation', () => ({ requestWebViewNavigation: jest.fn() }));
jest.mock('@/native/normalizeReceiptImage', () => ({ normalizeReceiptImage: jest.fn() }));
jest.mock('@/features/record/apis/clients', () => ({ recognizeReceipt: jest.fn() }));
jest.mock('@/native/pickReceiptImageFromLibrary', () => ({
  pickReceiptImageFromLibrary: jest.fn(),
}));
jest.mock('@/shared/ui/toast', () => ({
  useToast: () => ({ showToast: mockShowToast, closeToast: jest.fn() }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 47, right: 0, bottom: 34, left: 0 }),
}));

const mockNormalizeReceiptImage = jest.mocked(normalizeReceiptImage);
const mockRecognizeReceipt = jest.mocked(recognizeReceipt);
const mockPickReceiptImageFromLibrary = jest.mocked(pickReceiptImageFromLibrary);
const mockReplace = jest.mocked(router.replace);

describe('<ReceiptCameraScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockRecognizeReceipt.mockResolvedValue({
      receiptImageId: 15,
      storeName: null,
      address: null,
      purchaseDate: null,
      purchaseTime: null,
      amount: null,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('영수증을 촬영하면 이미지를 정규화하고 확인 화면으로 이동한다', async () => {
    const picture = { uri: 'file://captured.jpg', width: 3000, height: 4000 };
    mockTakePictureAsync.mockResolvedValue(picture);
    mockNormalizeReceiptImage.mockResolvedValue({ uri: 'file://normalized.jpg' });
    mockRecognizeReceipt.mockResolvedValue({
      receiptImageId: 15,
      storeName: '투썸플레이스 신논현점',
      address: '서울특별시 강남구 봉은사로 125 1층',
      purchaseDate: '2026-07-25',
      purchaseTime: '11:20:00',
      amount: 33000,
    });
    const { getByRole } = await render(<ReceiptCameraScreen />);

    expect(getByRole('button', { name: '이전 화면으로 돌아가기' })).toHaveStyle({ top: 65 });
    expect(getByRole('button', { name: '이전 화면으로 돌아가기' })).toHaveProp(
      'className',
      expect.stringContaining('left-4')
    );

    await act(async () => {
      fireEvent.press(getByRole('button', { name: '영수증 촬영' }));
      await Promise.resolve();
      await jest.runAllTimersAsync();
    });

    expect(mockNormalizeReceiptImage).toHaveBeenCalledWith(picture);
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/receipt-confirm',
      params: {
        uri: 'file://normalized.jpg',
        receiptImageId: '15',
        shopName: '투썸플레이스 신논현점',
        shopAddress: '서울특별시 강남구 봉은사로 125 1층',
        amount: '33000',
        visitedAt: String(new Date(2026, 6, 25, 11, 20).getTime()),
        visitPeriod: 'afternoon',
      },
    });
  });

  it('X 버튼을 누르면 기록 화면을 닫고 메인 WebView를 홈으로 이동시킨다', async () => {
    const { getByRole } = await render(<ReceiptCameraScreen />);

    fireEvent.press(getByRole('button', { name: '기록 닫고 홈으로 이동' }));

    expect(requestWebViewNavigation).toHaveBeenCalledWith('/home');
    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });

  it('촬영한 이미지를 처리하는 동안 스캔 로딩 화면을 보여준다', async () => {
    const picture = { uri: 'file://captured.jpg', width: 3000, height: 4000 };
    mockTakePictureAsync.mockResolvedValue(picture);
    mockNormalizeReceiptImage.mockResolvedValue({ uri: 'file://normalized.jpg' });
    const { findByRole, getByRole, getByTestId, queryByTestId } = await render(
      <ReceiptCameraScreen />
    );

    await act(async () => {
      fireEvent.press(getByRole('button', { name: '영수증 촬영' }));
      await Promise.resolve();
    });

    expect(await findByRole('progressbar', { name: '영수증 인식 중' })).toBeOnTheScreen();
    expect(queryByTestId('camera-view')).toBeNull();
    expect(getByTestId('receipt-scan-image')).toHaveProp('source', {
      uri: 'file://captured.jpg',
    });
    expect(getByTestId('receipt-scan-image')).toHaveProp('resizeMode', 'cover');
    expect(getByTestId('receipt-scan-animation')).toHaveProp('autoPlay', true);
    expect(getByTestId('receipt-scan-animation')).toHaveProp('loop', true);
    expect(getByTestId('receipt-scan-animation')).toHaveProp('resizeMode', 'cover');
    expect(getByTestId('receipt-scan-animation')).toHaveStyle({
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
    expect(mockReplace).not.toHaveBeenCalled();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1999);
    });

    expect(mockReplace).not.toHaveBeenCalled();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1);
    });

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/receipt-confirm',
      params: { uri: 'file://normalized.jpg', receiptImageId: '15' },
    });
  });

  it('사진 보관함에서 선택해도 확인 화면으로 이동한다', async () => {
    const picked = {
      status: 'picked' as const,
      uri: 'file://picked.jpg',
      width: 2000,
      height: 3000,
    };
    mockPickReceiptImageFromLibrary.mockResolvedValue(picked);
    mockNormalizeReceiptImage.mockResolvedValue({ uri: 'file://normalized-picked.jpg' });
    const { getByRole } = await render(<ReceiptCameraScreen />);

    await act(async () => {
      fireEvent.press(getByRole('button', { name: '사진 보관함에서 선택' }));
      await Promise.resolve();
      await jest.runAllTimersAsync();
    });

    expect(mockNormalizeReceiptImage).toHaveBeenCalledWith(picked);
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/receipt-confirm',
      params: { uri: 'file://normalized-picked.jpg', receiptImageId: '15' },
    });
  });

  it('서버가 영수증 인식 오류 메시지를 반환하면 카메라를 유지하고 안내 Toast를 띄운다', async () => {
    const picture = { uri: 'file://captured.jpg', width: 3000, height: 4000 };
    const message = '주요 정보를 중앙에 배치시켜 촬영해주세요';
    mockTakePictureAsync.mockResolvedValue(picture);
    mockNormalizeReceiptImage.mockRejectedValue({ response: { data: { message } } });
    const { getByRole } = await render(<ReceiptCameraScreen />);

    await act(async () => {
      fireEvent.press(getByRole('button', { name: '영수증 촬영' }));
      await Promise.resolve();
      await jest.runAllTimersAsync();
    });

    expect(mockShowToast).toHaveBeenCalledWith({ message, type: 'info' });
    expect(mockReplace).not.toHaveBeenCalled();
    expect(getByRole('button', { name: '영수증 촬영' })).toBeEnabled();
  });
});
