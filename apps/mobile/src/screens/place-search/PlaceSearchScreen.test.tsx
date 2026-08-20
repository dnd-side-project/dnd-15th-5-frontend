import { act, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import PlaceSearchScreen from './PlaceSearchScreen';

const reviewParams = {
  uri: 'file://receipt.jpg',
  shopName: '기존 가게',
  shopAddress: '기존 주소',
  amount: '12000',
  category: '카페',
  visitedAt: '1787151600000',
  visitPeriod: 'afternoon',
};

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), dismissTo: jest.fn() },
  useLocalSearchParams: () => reviewParams,
}));

describe('<PlaceSearchScreen />', () => {
  const originalWebUrl = process.env.EXPO_PUBLIC_WEB_URL;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_WEB_URL = 'http://192.168.0.2:5173/record/receipt/camera';
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_WEB_URL = originalWebUrl;
  });

  it('웹의 가게 검색 경로를 실제 WebView로 연다', async () => {
    const { getByTestId } = await render(<PlaceSearchScreen />);

    expect(getByTestId('place-search-safe-area')).toHaveStyle({ flex: 1 });
    expect(getByTestId('place-search-safe-area')).toHaveProp('edges', {
      top: 'additive',
      right: 'additive',
      bottom: 'additive',
      left: 'additive',
    });
    expect(getByTestId('place-search-webview')).toHaveProp('source', {
      uri: 'http://192.168.0.2:5173/record/shop/search?source=receipt-native',
    });
  });

  it('웹에서 선택한 가게와 기존 작성값을 리뷰 화면으로 돌려준다', async () => {
    const { getByTestId } = await render(<PlaceSearchScreen />);

    await act(async () => {
      getByTestId('place-search-webview').props.onMessage({
        nativeEvent: {
          url: 'http://192.168.0.2:5173/record/shop/search?source=receipt-native',
          data: JSON.stringify({
            kind: 'event',
            type: 'receiptShopSelected',
            payload: {
              shop: {
                id: 'place-01',
                name: '투썸플레이스 신논현점',
                address: '서울특별시 강남구 봉은사로 125',
                photoUrl: 'https://places.example.com/place-01.jpg',
              },
            },
          }),
        },
      });
    });

    expect(router.dismissTo).toHaveBeenCalledWith({
      pathname: '/receipt-confirm',
      params: {
        ...reviewParams,
        shopId: 'place-01',
        shopName: '투썸플레이스 신논현점',
        shopAddress: '서울특별시 강남구 봉은사로 125',
        shopPhotoUrl: 'https://places.example.com/place-01.jpg',
      },
    });
  });

  it('웹 검색에서 뒤로 가기를 누르면 기존 리뷰 화면으로 돌아간다', async () => {
    const { getByTestId } = await render(<PlaceSearchScreen />);

    await act(async () => {
      getByTestId('place-search-webview').props.onMessage({
        nativeEvent: {
          url: 'http://192.168.0.2:5173/record/shop/search?source=receipt-native',
          data: JSON.stringify({
            kind: 'event',
            type: 'receiptShopSearchCancelled',
            payload: {},
          }),
        },
      });
    });

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
