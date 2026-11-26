import { ANALYTICS_EVENTS } from '@chapchap/shared/analytics';
import { act, fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { requestWebViewNavigation } from '@/bridge/webViewNavigation';
import { recognizeReceipt } from '@/features/record/apis/clients';
import { releaseTemporaryImage, trackTemporaryImage } from '@/native/image/temporaryImageFiles';
import { normalizeReceiptImage } from '@/native/receipt/normalizeReceiptImage';
import { pickReceiptImageFromLibrary } from '@/native/receipt/pickReceiptImageFromLibrary';
import { trackNativeAnalyticsEvent } from '@/shared/lib/analytics';

import ReceiptCameraScreen from './ReceiptCameraScreen';

const mockTakePictureAsync = jest.fn();
const mockShowToast = jest.fn();
let mockScanId = '';
let mockScanActive = true;
const mockFinishReceiptScan = jest.fn();
jest.mock('@/native/receipt/scanReceipt', () => ({
  finishReceiptScan: (...args: unknown[]) => mockFinishReceiptScan(...args),
  isReceiptScanActive: () => mockScanActive,
}));

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
  useLocalSearchParams: () => ({ scanId: mockScanId }),
  router: { back: jest.fn(), dismissTo: jest.fn(), replace: jest.fn() },
}));
jest.mock('@/bridge/webViewNavigation', () => ({ requestWebViewNavigation: jest.fn() }));
jest.mock('@/native/receipt/normalizeReceiptImage', () => ({ normalizeReceiptImage: jest.fn() }));
jest.mock('@/native/image/temporaryImageFiles', () => ({
  releaseTemporaryImage: jest.fn(),
  trackTemporaryImage: jest.fn(),
}));
jest.mock('@/features/record/apis/clients', () => ({ recognizeReceipt: jest.fn() }));
jest.mock('@/native/receipt/pickReceiptImageFromLibrary', () => ({
  pickReceiptImageFromLibrary: jest.fn(),
}));
jest.mock('@/shared/lib/analytics', () => ({
  NATIVE_ANALYTICS_SCREENS: {
    receiptScan: { screenName: 'REC_ReceiptScan', screenPath: '/camera' },
  },
  trackNativeAnalyticsEvent: jest.fn(),
  useNativeScreenAnalytics: jest.fn(),
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
    mockScanId = '';
    mockScanActive = true;
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

  it('웹 기록에서 촬영하면 확인 화면을 열지 않고 OCR 결과를 웹으로 반환한다', async () => {
    mockScanId = 'web-scan-01';
    const picture = { uri: 'file://receipt.jpg', width: 100, height: 100 };
    mockTakePictureAsync.mockResolvedValue(picture);
    mockNormalizeReceiptImage.mockResolvedValue({ uri: 'file://normalized.jpg' });
    const { getByRole, unmount } = await render(<ReceiptCameraScreen />);
    await act(async () => {
      fireEvent.press(getByRole('button', { name: '영수증 촬영' }));
      await Promise.resolve();
      await jest.runAllTimersAsync();
    });
    expect(router.back).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(releaseTemporaryImage).toHaveBeenCalledWith('file://normalized.jpg');
    await unmount();
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockFinishReceiptScan).toHaveBeenCalledWith('web-scan-01', {
      status: 'success',
      receipt: {
        receiptImageId: 15,
        purchaseDate: null,
        purchaseTime: null,
        amount: null,
        shop: null,
      },
    });
    expect(releaseTemporaryImage).toHaveBeenCalledWith('file://receipt.jpg');
  });

  it('웹 기록의 영수증 촬영을 취소하면 홈 이동 없이 취소를 반환한다', async () => {
    mockScanId = 'web-scan-cancel';
    const { getByRole, unmount } = await render(<ReceiptCameraScreen />);
    await fireEvent.press(getByRole('button', { name: '영수증 촬영 취소' }));
    expect(router.back).toHaveBeenCalled();
    expect(requestWebViewNavigation).not.toHaveBeenCalled();
    await unmount();
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockFinishReceiptScan).toHaveBeenCalledWith('web-scan-cancel', { status: 'cancelled' });
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
      googlePlaceSearchResult: {
        googlePlaceId: 'ChIJ-two-some',
        placeName: '투썸플레이스 신논현점',
        roadAddress: '서울특별시 강남구 봉은사로 125 1층',
        latitude: 37.506481,
        longitude: 127.024551,
        thumbnailUrl: 'https://example.com/twosome.jpg',
      },
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
    expect(trackTemporaryImage).toHaveBeenCalledWith(picture.uri);
    expect(releaseTemporaryImage).not.toHaveBeenCalledWith('file://normalized.jpg');
    expect(trackNativeAnalyticsEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.stepAttempted, {
      step_name: 'REC_ReceiptScan',
      screen_name: 'REC_ReceiptScan',
      screen_path: '/camera',
      input_method: 'camera',
      attempt_number: 1,
      retry_count: 0,
      is_retry: false,
    });
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/receipt-confirm',
      params: {
        uri: 'file://normalized.jpg',
        receiptImageId: '15',
        shopId: 'ChIJ-two-some',
        shopName: '투썸플레이스 신논현점',
        shopAddress: '서울특별시 강남구 봉은사로 125 1층',
        shopPhotoUrl: 'https://example.com/twosome.jpg',
        latitude: '37.506481',
        longitude: '127.024551',
        amount: '33000',
        visitedAt: String(new Date(2026, 6, 25, 11, 20).getTime()),
        visitPeriod: 'afternoon',
      },
    });
    expect(trackNativeAnalyticsEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.stepCompleted, {
      step_name: 'REC_ReceiptScan',
      screen_name: 'REC_ReceiptScan',
      screen_path: '/camera',
      completion_reason: 'ocr_succeeded',
      input_method: 'camera',
      attempt_number: 1,
    });
  });

  it('Google Place 주소 앞의 대한민국을 제거해 수기 입력 주소와 형식을 맞춘다', async () => {
    const picture = { uri: 'file://captured.jpg', width: 3000, height: 4000 };
    mockTakePictureAsync.mockResolvedValue(picture);
    mockNormalizeReceiptImage.mockResolvedValue({ uri: 'file://normalized.jpg' });
    mockRecognizeReceipt.mockResolvedValue({
      receiptImageId: 15,
      storeName: '투썸플레이스 신논현점',
      address: null,
      purchaseDate: null,
      purchaseTime: null,
      amount: null,
      googlePlaceSearchResult: {
        googlePlaceId: 'ChIJ-two-some',
        placeName: '투썸플레이스 신논현점',
        roadAddress: '대한민국 서울특별시 강남구 봉은사로 125 1층',
        latitude: 37.506481,
        longitude: 127.024551,
        thumbnailUrl: 'https://example.com/twosome.jpg',
      },
    });
    const { getByRole } = await render(<ReceiptCameraScreen />);

    await act(async () => {
      fireEvent.press(getByRole('button', { name: '영수증 촬영' }));
      await Promise.resolve();
      await jest.runAllTimersAsync();
    });

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/receipt-confirm',
      params: expect.objectContaining({
        shopAddress: '서울특별시 강남구 봉은사로 125 1층',
      }),
    });
  });

  it('Google Place 매칭이 없으면 OCR 원문 가게명과 주소를 매장 정보로 사용하지 않는다', async () => {
    const picture = { uri: 'file://captured.jpg', width: 3000, height: 4000 };
    mockTakePictureAsync.mockResolvedValue(picture);
    mockNormalizeReceiptImage.mockResolvedValue({ uri: 'file://normalized.jpg' });
    mockRecognizeReceipt.mockResolvedValue({
      receiptImageId: 15,
      storeName: '상계동 분식',
      address: '대한민국 서울특별시 노원구 상계 8동',
      purchaseDate: null,
      purchaseTime: null,
      amount: null,
    });
    const { getByRole } = await render(<ReceiptCameraScreen />);

    await act(async () => {
      fireEvent.press(getByRole('button', { name: '영수증 촬영' }));
      await Promise.resolve();
      await jest.runAllTimersAsync();
    });

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/receipt-confirm',
      params: {
        uri: 'file://normalized.jpg',
        receiptImageId: '15',
      },
    });
  });

  it('Google Place 결과에서 도로명주소를 찾지 못하면 OCR 주소로 대체하지 않는다', async () => {
    const picture = { uri: 'file://captured.jpg', width: 3000, height: 4000 };
    mockTakePictureAsync.mockResolvedValue(picture);
    mockNormalizeReceiptImage.mockResolvedValue({ uri: 'file://normalized.jpg' });
    mockRecognizeReceipt.mockResolvedValue({
      receiptImageId: 15,
      storeName: '상계동 분식',
      address: '대한민국 서울특별시 노원구 상계 8동',
      purchaseDate: null,
      purchaseTime: null,
      amount: null,
      googlePlaceSearchResult: {
        googlePlaceId: 'ChIJ-sanggye',
        placeName: '상계동 분식',
        latitude: 37.665,
        longitude: 127.057,
      },
    });
    const { getByRole } = await render(<ReceiptCameraScreen />);

    await act(async () => {
      fireEvent.press(getByRole('button', { name: '영수증 촬영' }));
      await Promise.resolve();
      await jest.runAllTimersAsync();
    });

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/receipt-confirm',
      params: {
        uri: 'file://normalized.jpg',
        receiptImageId: '15',
      },
    });
  });

  it('OCR 응답에 receiptImageId가 없으면 라우트 파라미터에 포함하지 않는다', async () => {
    const picture = { uri: 'file://captured.jpg', width: 3000, height: 4000 };
    mockTakePictureAsync.mockResolvedValue(picture);
    mockNormalizeReceiptImage.mockResolvedValue({ uri: 'file://normalized.jpg' });
    mockRecognizeReceipt.mockResolvedValue({
      storeName: null,
      address: null,
      purchaseDate: null,
      purchaseTime: null,
      amount: null,
    });
    const { getByRole } = await render(<ReceiptCameraScreen />);

    await act(async () => {
      fireEvent.press(getByRole('button', { name: '영수증 촬영' }));
      await Promise.resolve();
      await jest.runAllTimersAsync();
    });

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/receipt-confirm',
      params: { uri: 'file://normalized.jpg' },
    });
  });

  it('X 버튼에서 나가기를 확인하면 기록 화면을 닫고 메인 WebView를 홈으로 이동시킨다', async () => {
    const { findByText, getByRole } = await render(<ReceiptCameraScreen />);

    await act(async () => {
      fireEvent.press(getByRole('button', { name: '기록 닫고 홈으로 이동' }));
    });

    await findByText('기록 작성을 그만둘까요?');
    expect(requestWebViewNavigation).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(getByRole('button', { name: '나가기' }));
    });

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
    expect(trackNativeAnalyticsEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.stepAttempted, {
      step_name: 'REC_ReceiptScan',
      screen_name: 'REC_ReceiptScan',
      screen_path: '/camera',
      input_method: 'photo_library',
      attempt_number: 1,
      retry_count: 0,
      is_retry: false,
    });
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/receipt-confirm',
      params: { uri: 'file://normalized-picked.jpg', receiptImageId: '15' },
    });
    expect(trackNativeAnalyticsEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.stepCompleted, {
      step_name: 'REC_ReceiptScan',
      screen_name: 'REC_ReceiptScan',
      screen_path: '/camera',
      completion_reason: 'ocr_succeeded',
      input_method: 'photo_library',
      attempt_number: 1,
    });
  });

  it('사진 보관함 선택을 취소하면 분석 시도 횟수를 증가시키지 않는다', async () => {
    mockPickReceiptImageFromLibrary.mockResolvedValue({ status: 'cancelled' });
    const { getByRole } = await render(<ReceiptCameraScreen />);

    await act(async () => {
      fireEvent.press(getByRole('button', { name: '사진 보관함에서 선택' }));
      await Promise.resolve();
    });

    expect(trackNativeAnalyticsEvent).not.toHaveBeenCalledWith(
      ANALYTICS_EVENTS.stepAttempted,
      expect.anything()
    );
    expect(mockNormalizeReceiptImage).not.toHaveBeenCalled();
    expect(trackTemporaryImage).not.toHaveBeenCalled();
    expect(getByRole('button', { name: '영수증 촬영' })).toBeEnabled();
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
    expect(releaseTemporaryImage).toHaveBeenCalledWith(picture.uri);
    expect(mockReplace).not.toHaveBeenCalled();
    expect(getByRole('button', { name: '영수증 촬영' })).toBeEnabled();
  });

  it('화면 이탈 후 도착한 촬영 원본은 처리하지 않고 정리한다', async () => {
    let resolvePhoto!: (photo: { uri: string; width: number; height: number }) => void;
    mockTakePictureAsync.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePhoto = resolve;
      })
    );
    const { getByRole, unmount } = await render(<ReceiptCameraScreen />);
    await act(async () => {
      fireEvent.press(getByRole('button', { name: '영수증 촬영' }));
    });
    await unmount();
    await act(async () => {
      resolvePhoto({ uri: 'file://late.jpg', width: 100, height: 100 });
    });
    expect(trackTemporaryImage).toHaveBeenCalledWith('file://late.jpg');
    expect(releaseTemporaryImage).toHaveBeenCalledWith('file://late.jpg');
    expect(mockNormalizeReceiptImage).not.toHaveBeenCalled();
  });

  it('OCR 도중 이탈하면 처리가 끝난 후 원본과 결과를 정리하고 화면을 이동하지 않는다', async () => {
    let resolveOcr!: (receipt: Awaited<ReturnType<typeof recognizeReceipt>>) => void;
    mockTakePictureAsync.mockResolvedValue({ uri: 'file://captured.jpg', width: 100, height: 100 });
    mockNormalizeReceiptImage.mockResolvedValue({ uri: 'file://normalized.jpg' });
    mockRecognizeReceipt.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveOcr = resolve;
      })
    );
    const { getByRole, unmount } = await render(<ReceiptCameraScreen />);
    await act(async () => {
      fireEvent.press(getByRole('button', { name: '영수증 촬영' }));
    });
    await unmount();
    expect(releaseTemporaryImage).not.toHaveBeenCalledWith('file://captured.jpg');
    await act(async () => {
      resolveOcr({ receiptImageId: 15 });
      await jest.runAllTimersAsync();
    });
    expect(releaseTemporaryImage).toHaveBeenCalledWith('file://captured.jpg');
    expect(releaseTemporaryImage).toHaveBeenCalledWith('file://normalized.jpg');
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('갤러리 OCR 중 요청이 만료되면 결과와 선택기 입력의 사용을 종료한다', async () => {
    mockScanId = 'expired-scan';
    mockPickReceiptImageFromLibrary.mockResolvedValue({
      status: 'picked',
      uri: 'file://gallery.jpg',
      width: 100,
      height: 100,
    });
    mockNormalizeReceiptImage.mockResolvedValue({ uri: 'file://normalized.jpg' });
    const { getByRole, unmount } = await render(<ReceiptCameraScreen />);
    await act(async () => {
      fireEvent.press(getByRole('button', { name: '사진 보관함에서 선택' }));
      await Promise.resolve();
      mockScanActive = false;
      await jest.runAllTimersAsync();
    });
    await unmount();
    expect(trackTemporaryImage).not.toHaveBeenCalledWith('file://gallery.jpg');
    expect(releaseTemporaryImage).toHaveBeenCalledWith('file://gallery.jpg');
    expect(releaseTemporaryImage).toHaveBeenCalledWith('file://normalized.jpg');
    expect(router.back).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('화면 이탈 후 선택기가 반환한 캐시 복사본도 정리한다', async () => {
    let resolvePick!: (picked: Awaited<ReturnType<typeof pickReceiptImageFromLibrary>>) => void;
    mockPickReceiptImageFromLibrary.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePick = resolve;
      })
    );
    const { getByRole, unmount } = await render(<ReceiptCameraScreen />);
    await act(async () => {
      fireEvent.press(getByRole('button', { name: '사진 보관함에서 선택' }));
    });
    await unmount();
    await act(async () => {
      resolvePick({ status: 'picked', uri: 'file:///cache/late.heic', width: 100, height: 100 });
    });
    expect(releaseTemporaryImage).toHaveBeenCalledWith('file:///cache/late.heic');
    expect(mockNormalizeReceiptImage).not.toHaveBeenCalled();
  });
});
