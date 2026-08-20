import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import ReceiptConfirmScreen from './ReceiptConfirmScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({
    uri: 'file://receipt.jpg',
    shopId: 'place-01',
    shopName: '카페 차차',
    shopAddress: '서울특별시 마포구',
    shopPhotoUrl: 'https://places.example.com/place-01.jpg',
    amount: '12000',
    category: '카페',
    visitedAt: String(new Date(2026, 7, 20).getTime()),
    visitPeriod: 'afternoon',
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 47, right: 0, bottom: 34, left: 0 }),
}));

describe('<ReceiptConfirmScreen />', () => {
  it('촬영 결과를 리뷰 폼에 표시한다', async () => {
    const { getByLabelText, getByRole, getByText } = await render(<ReceiptConfirmScreen />);

    getByText('정보가 정확하게\n인식되었나요?');
    expect(getByLabelText('가게 사진')).toHaveProp('source', {
      uri: 'https://places.example.com/place-01.jpg',
    });
    expect(getByLabelText('금액')).toHaveProp('value', '12,000');
    expect(getByRole('button', { name: '기록 기능 준비 중' })).toBeDisabled();
  });

  it('뒤로 가기를 누르면 재촬영할 수 있도록 카메라로 이동한다', async () => {
    const { getByRole } = await render(<ReceiptConfirmScreen />);

    fireEvent.press(getByRole('button', { name: '이전 화면으로 돌아가기' }));

    expect(router.replace).toHaveBeenCalledWith('/camera');
  });

  it('가게 변경을 누르면 현재 작성값과 함께 검색 화면으로 이동한다', async () => {
    const { getByRole } = await render(<ReceiptConfirmScreen />);

    fireEvent.press(getByRole('button', { name: '가게 정보 변경' }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/place-search',
      params: {
        uri: 'file://receipt.jpg',
        shopId: 'place-01',
        shopName: '카페 차차',
        shopAddress: '서울특별시 마포구',
        shopPhotoUrl: 'https://places.example.com/place-01.jpg',
        amount: '12000',
        visitedAt: String(new Date(2026, 7, 20).getTime()),
        visitPeriod: 'afternoon',
        category: '카페',
      },
    });
  });
});
