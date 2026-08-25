import { fireEvent, render, userEvent } from '@testing-library/react-native';
import { Animated } from 'react-native';

import ReceiptReviewForm from './ReceiptReviewForm';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 47, right: 0, bottom: 34, left: 0 }),
}));

beforeAll(() => {
  jest.spyOn(Animated, 'timing').mockImplementation(
    (value, config) =>
      ({
        start: (callback) => {
          (value as Animated.Value).setValue(config.toValue as number);
          callback?.({ finished: true });
        },
        stop: jest.fn(),
        reset: jest.fn(),
      }) as Animated.CompositeAnimation
  );
});

afterAll(() => jest.restoreAllMocks());

describe('<ReceiptReviewForm />', () => {
  it('X 버튼에서 계속 작성을 선택하면 폼을 유지한다', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    const { findByText, getByRole, queryByText } = await render(
      <ReceiptReviewForm receiptUri="file://receipt.jpg" onBack={jest.fn()} onClose={onClose} />
    );

    await user.press(getByRole('button', { name: '기록 닫고 홈으로 이동' }));
    await findByText('기록 작성을 그만둘까요?');
    expect(await findByText('나가기')).toHaveProp(
      'className',
      expect.stringContaining('font-pretendard-medium text-body-01-medium')
    );
    expect(await findByText('계속 작성하기')).toHaveProp(
      'className',
      expect.stringContaining('font-pretendard-medium text-body-01-medium')
    );

    await user.press(getByRole('button', { name: '계속 작성하기' }));

    expect(queryByText('기록 작성을 그만둘까요?')).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('촬영 이미지와 OCR 초기값을 폼에 표시하고 제출한다', async () => {
    const onSubmit = jest.fn();
    const visitDateTime = { date: new Date(2026, 7, 20), period: 'afternoon' as const };
    const { getByLabelText, getByRole, getByTestId } = await render(
      <ReceiptReviewForm
        receiptUri="file://receipt.jpg"
        initialReceiptImageId={15}
        initialShopId="place-01"
        initialShopName="투썸플레이스 신논현점"
        initialShopAddress="서울특별시 강남구 봉은사로 125"
        initialShopPhotoUrl="https://places.example.com/place-01.jpg"
        initialLatitude={37.506481}
        initialLongitude={127.024551}
        initialVisitDateTime={visitDateTime}
        initialAmount="54000"
        initialCategory="카페"
        onBack={jest.fn()}
        onClose={jest.fn()}
        onSubmit={onSubmit}
      />
    );

    expect(getByLabelText('가게 사진')).toHaveProp('source', {
      uri: 'https://places.example.com/place-01.jpg',
    });
    expect(getByLabelText('가게 이름')).toHaveTextContent('투썸플레이스 신논현점');
    expect(getByLabelText('가게 주소')).toHaveTextContent('서울특별시 강남구 봉은사로 125');
    expect(getByLabelText('금액')).toHaveProp('value', '54,000');
    expect(getByTestId('receipt-review-content')).toHaveStyle({ paddingTop: 65 });
    expect(getByRole('button', { name: '카페' })).toHaveProp('accessibilityState', {
      selected: true,
    });

    fireEvent.press(getByRole('button', { name: '기록하기' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        receiptImageId: 15,
        shopId: 'place-01',
        shopName: '투썸플레이스 신논현점',
        shopAddress: '서울특별시 강남구 봉은사로 125',
        shopPhotoUrl: 'https://places.example.com/place-01.jpg',
        latitude: 37.506481,
        longitude: 127.024551,
        visitDateTime,
        amount: '54000',
        category: '카페',
        receiptUri: 'file://receipt.jpg',
      })
    );
  });

  it('방문 일시 영역을 누르면 날짜 선택 바텀시트를 연다', async () => {
    const user = userEvent.setup();
    const visitDateTime = { date: new Date(2026, 7, 20), period: 'afternoon' as const };
    const { getByRole, getByText } = await render(
      <ReceiptReviewForm
        receiptUri="file://receipt.jpg"
        initialVisitDateTime={visitDateTime}
        onBack={jest.fn()}
        onClose={jest.fn()}
      />
    );

    await user.press(getByRole('button', { name: /방문 일시 변경/ }));

    getByText('2026년 8월');
    expect(getByRole('button', { name: '2026년 8월 20일' })).toHaveProp('accessibilityState', {
      selected: true,
      disabled: false,
    });
  });

  it('인식된 카테고리가 없으면 카페를 기본 선택한다', async () => {
    const { getByRole } = await render(
      <ReceiptReviewForm receiptUri="file://receipt.jpg" onBack={jest.fn()} onClose={jest.fn()} />
    );

    expect(getByRole('button', { name: '카페' })).toHaveProp('accessibilityState', {
      selected: true,
    });
  });

  it('가게 변경을 누르면 현재 작성값을 검색 플로우에 전달한다', async () => {
    const onChangeShop = jest.fn();
    const visitDateTime = { date: new Date(2026, 7, 20), period: 'afternoon' as const };
    const { getByRole } = await render(
      <ReceiptReviewForm
        receiptUri="file://receipt.jpg"
        initialReceiptImageId={15}
        initialShopId="place-02"
        initialShopName="카페 차차"
        initialShopAddress="서울특별시 마포구"
        initialShopPhotoUrl="https://places.example.com/place-02.jpg"
        initialLatitude={37.5}
        initialLongitude={127.02}
        initialVisitDateTime={visitDateTime}
        initialAmount="12000"
        initialCategory="카페"
        onBack={jest.fn()}
        onClose={jest.fn()}
        onChangeShop={onChangeShop}
      />
    );

    fireEvent.press(getByRole('button', { name: '가게 정보 변경' }));

    expect(onChangeShop).toHaveBeenCalledWith({
      receiptImageId: 15,
      shopId: 'place-02',
      shopName: '카페 차차',
      shopAddress: '서울특별시 마포구',
      shopPhotoUrl: 'https://places.example.com/place-02.jpg',
      latitude: 37.5,
      longitude: 127.02,
      visitDateTime,
      amount: '12000',
      category: '카페',
      receiptUri: 'file://receipt.jpg',
    });
  });

  it('필수 값을 모두 입력하기 전에는 기록할 수 없다', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    const { getByLabelText, getByRole, getByTestId, getByText, queryByText } = await render(
      <ReceiptReviewForm
        receiptUri="file://receipt.jpg"
        initialReceiptImageId={15}
        initialShopId="place-01"
        initialShopName="카페 차차"
        initialLatitude={37.5}
        initialLongitude={127.02}
        onBack={jest.fn()}
        onClose={jest.fn()}
        onSubmit={onSubmit}
      />
    );
    const submitButton = getByRole('button', { name: '기록하기' });

    expect(submitButton).toBeEnabled();
    expect(getByTestId('amount-field')).toHaveProp(
      'className',
      expect.stringContaining('border-neutral-300')
    );
    expect(getByLabelText('금액')).toHaveProp('aria-invalid', false);
    expect(queryByText('필수항목을 작성해주세요')).toBeNull();

    await user.press(submitButton);

    expect(getByTestId('amount-field')).toHaveProp(
      'className',
      expect.stringContaining('border-notification')
    );
    expect(getByLabelText('금액')).toHaveProp('aria-invalid', true);
    getByText('필수항목을 작성해주세요');

    await user.type(getByLabelText('금액'), '0');
    expect(getByLabelText('금액')).toHaveProp('aria-invalid', true);

    await user.clear(getByLabelText('금액'));
    await user.type(getByLabelText('금액'), '12000');
    expect(getByRole('button', { name: '기록하기' })).toBeEnabled();
    expect(getByTestId('amount-field')).toHaveProp(
      'className',
      expect.stringContaining('border-neutral-300')
    );
    expect(getByLabelText('금액')).toHaveProp('aria-invalid', false);
    expect(queryByText('필수항목을 작성해주세요')).toBeNull();
  });

  it('가게가 비어 있으면 제출 시 가게 영역과 필수 항목 안내를 표시한다', async () => {
    const user = userEvent.setup();
    const { getByRole, getByTestId, getByText } = await render(
      <ReceiptReviewForm
        receiptUri="file://receipt.jpg"
        initialAmount="12000"
        onBack={jest.fn()}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    await user.press(getByRole('button', { name: '기록하기' }));

    expect(getByTestId('shop-field')).toHaveProp(
      'className',
      expect.stringContaining('border-notification')
    );
    getByText('필수항목을 작성해주세요');
  });

  it('저장 동작이 연결되지 않은 유효한 폼은 완료 버튼을 활성화하지 않는다', async () => {
    const { getByRole } = await render(
      <ReceiptReviewForm
        receiptUri="file://receipt.jpg"
        initialReceiptImageId={15}
        initialShopId="place-01"
        initialShopName="카페 차차"
        initialLatitude={37.5}
        initialLongitude={127.02}
        initialAmount="12000"
        onBack={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(getByRole('button', { name: '기록 기능 준비 중' })).toBeDisabled();
  });
});
