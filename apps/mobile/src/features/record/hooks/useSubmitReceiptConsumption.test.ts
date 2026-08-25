import { act, renderHook } from '@testing-library/react-native';

import { createConsumption } from '@/features/record/apis/clients';

import { useSubmitReceiptConsumption } from './useSubmitReceiptConsumption';

const mockShowToast = jest.fn();

jest.mock('@/features/record/apis/clients', () => ({ createConsumption: jest.fn() }));
jest.mock('@/shared/ui/toast', () => ({
  useToast: () => ({ showToast: mockShowToast, closeToast: jest.fn() }),
}));

const receiptDraft = {
  receiptImageId: 15,
  shopId: 'place-01',
  shopName: '카페 차차',
  shopAddress: '서울특별시 마포구',
  shopPhotoUrl: null,
  latitude: 37.5,
  longitude: 127,
  visitDateTime: { date: new Date(2026, 7, 20, 11), period: 'afternoon' as const },
  amount: '12000',
  category: '카페' as const,
  receiptUri: 'file://receipt.jpg',
};

describe('useSubmitReceiptConsumption', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('확인한 영수증 기록을 저장하고 성공 콜백을 호출한다', async () => {
    jest.mocked(createConsumption).mockResolvedValue({ consumptionId: 31 });
    const onSuccess = jest.fn();
    const { result } = await renderHook(() => useSubmitReceiptConsumption({ onSuccess }));

    await act(async () => {
      await result.current.submitReceiptConsumption(receiptDraft);
    });

    expect(createConsumption).toHaveBeenCalledWith({
      receiptImageId: 15,
      googlePlaceId: 'place-01',
      placeName: '카페 차차',
      roadAddress: '서울특별시 마포구',
      latitude: 37.5,
      longitude: 127,
      purchaseDate: '2026-08-20',
      purchaseTime: '11:00:00',
      amount: 12000,
      category: '카페',
    });
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'success',
      message: '소비 기록이 저장되었어요.',
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('저장 실패 시 서버 메시지를 보여주고 성공 콜백은 호출하지 않는다', async () => {
    jest.mocked(createConsumption).mockRejectedValue(new Error('저장할 수 없습니다.'));
    const onSuccess = jest.fn();
    const { result } = await renderHook(() => useSubmitReceiptConsumption({ onSuccess }));

    await act(async () => {
      await result.current.submitReceiptConsumption(receiptDraft);
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: '저장할 수 없습니다.',
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
