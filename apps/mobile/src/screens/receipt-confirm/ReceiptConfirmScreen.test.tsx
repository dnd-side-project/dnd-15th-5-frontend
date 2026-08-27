import { act, fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { requestWebViewNavigation } from '@/bridge/webViewNavigation';
import { createConsumption } from '@/features/record/apis/clients';

import ReceiptConfirmScreen from './ReceiptConfirmScreen';

const mockShowToast = jest.fn();

jest.mock('expo-router', () => ({
  router: { dismissTo: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({
    uri: 'file://receipt.jpg',
    receiptImageId: '15',
    shopId: 'place-01',
    shopName: '카페 차차',
    shopAddress: '서울특별시 마포구',
    shopPhotoUrl: 'https://places.example.com/place-01.jpg',
    latitude: '37.506481',
    longitude: '127.024551',
    amount: '12000',
    category: '카페',
    visitedAt: String(new Date(2026, 7, 20).getTime()),
    visitPeriod: 'afternoon',
  }),
}));

jest.mock('@/features/record/apis/clients', () => ({ createConsumption: jest.fn() }));
jest.mock('@/bridge/webViewNavigation', () => ({ requestWebViewNavigation: jest.fn() }));
jest.mock('@/shared/ui/toast', () => ({
  useToast: () => ({ showToast: mockShowToast, closeToast: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 47, right: 0, bottom: 34, left: 0 }),
}));

describe('<ReceiptConfirmScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('촬영 결과를 리뷰 폼에 표시한다', async () => {
    const { getByLabelText, getByRole, getByText } = await render(<ReceiptConfirmScreen />);

    getByText('정보가 정확하게\n인식되었나요?');
    expect(getByLabelText('가게 사진')).toHaveProp('source', {
      uri: 'https://places.example.com/place-01.jpg',
    });
    expect(getByLabelText('금액')).toHaveProp('value', '12,000');
    expect(getByRole('button', { name: '기록하기' })).toBeEnabled();
  });

  it('뒤로 가기를 누르면 재촬영할 수 있도록 카메라로 이동한다', async () => {
    const { getByRole } = await render(<ReceiptConfirmScreen />);

    fireEvent.press(getByRole('button', { name: '이전 화면으로 돌아가기' }));

    expect(router.replace).toHaveBeenCalledWith('/camera');
  });

  it('닫기 확인 후 나가기를 누르면 메인 WebView의 지도 홈으로 돌아간다', async () => {
    const { findByText, getByRole } = await render(<ReceiptConfirmScreen />);

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

  it('가게 변경을 누르면 현재 작성값과 함께 검색 화면으로 이동한다', async () => {
    const { getByRole } = await render(<ReceiptConfirmScreen />);

    fireEvent.press(getByRole('button', { name: '가게 정보 변경' }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/place-search',
      params: {
        uri: 'file://receipt.jpg',
        receiptImageId: '15',
        shopId: 'place-01',
        shopName: '카페 차차',
        shopAddress: '서울특별시 마포구',
        shopPhotoUrl: 'https://places.example.com/place-01.jpg',
        latitude: '37.506481',
        longitude: '127.024551',
        amount: '12000',
        visitedAt: String(new Date(2026, 7, 20).getTime()),
        visitPeriod: 'afternoon',
        category: '카페',
      },
    });
  });

  it('확인한 영수증 소비를 저장하고 메인 WebView의 지도 홈으로 돌아간다', async () => {
    jest.mocked(createConsumption).mockResolvedValue({ consumptionId: 31 });
    const { getByRole } = await render(<ReceiptConfirmScreen />);

    await act(async () => {
      fireEvent.press(getByRole('button', { name: '기록하기' }));
    });

    expect(createConsumption).toHaveBeenCalledWith({
      receiptImageId: 15,
      googlePlaceId: 'place-01',
      placeName: '카페 차차',
      roadAddress: '서울특별시 마포구',
      latitude: 37.506481,
      longitude: 127.024551,
      purchaseDate: '2026-08-20',
      purchaseTime: '11:00:00',
      amount: 12000,
      category: '카페',
    });
    expect(requestWebViewNavigation).toHaveBeenCalledWith(
      '/home?createdPlaceName=%EC%B9%B4%ED%8E%98+%EC%B0%A8%EC%B0%A8&createdPlaceLat=37.506481&createdPlaceLng=127.024551'
    );
    expect(mockShowToast).not.toHaveBeenCalled();
    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });
});
