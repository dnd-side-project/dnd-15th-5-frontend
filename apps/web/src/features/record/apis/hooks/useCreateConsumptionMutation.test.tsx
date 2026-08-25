import { act, renderHook } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';

import { useCreateConsumption } from '@/features/record/apis/mutations';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { useToast } from '@/shared/ui/toast';

import { useCreateConsumptionMutation } from './useCreateConsumptionMutation';

const mockInvalidateQueries = jest.fn();
const mockMutate = jest.fn();
const mockNavigate = jest.fn();
const mockShowToast = jest.fn();
let handleSuccess: (() => Promise<void>) | undefined;
let handleError: ((error: { response?: { data?: { message?: string } } }) => void) | undefined;

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));
jest.mock('react-router-dom', () => ({ useNavigate: jest.fn() }));
jest.mock('@/features/record/apis/mutations', () => ({ useCreateConsumption: jest.fn() }));
jest.mock('@/shared/ui/toast', () => ({ useToast: jest.fn() }));

const mockUseNavigate = jest.mocked(useNavigate);
const mockUseCreateConsumption = jest.mocked(useCreateConsumption);
const mockUseToast = jest.mocked(useToast);

describe('useCreateConsumptionMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvalidateQueries.mockResolvedValue(undefined);
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseToast.mockReturnValue({ showToast: mockShowToast, closeToast: jest.fn() });
    mockUseCreateConsumption.mockImplementation((options) => {
      handleSuccess = options?.mutation?.onSuccess as typeof handleSuccess;
      handleError = options?.mutation?.onError as typeof handleError;

      return { mutate: mockMutate, isPending: false } as never;
    });
  });

  it('소비 등록 요청을 mutation에 전달한다', () => {
    const request = {
      googlePlaceId: 'place-01',
      placeName: '카페 차차',
      roadAddress: '서울특별시 마포구',
      latitude: 37.5,
      longitude: 127,
      purchaseDate: '2026-07-25',
      purchaseTime: '11:00:00',
      amount: 33000,
      category: '카페',
    };
    const { result } = renderHook(() => useCreateConsumptionMutation());

    result.current.createConsumption(request);

    expect(mockMutate).toHaveBeenCalledWith({ data: request });
  });

  it('등록에 성공하면 서버 상태를 갱신하고 지도 홈으로 이동한다', async () => {
    renderHook(() => useCreateConsumptionMutation());

    await act(async () => {
      await handleSuccess?.();
    });

    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'success',
      message: '소비 기록이 저장되었어요.',
    });
    expect(mockNavigate).toHaveBeenCalledWith(ROUTE_PATHS.home, { replace: true });
  });

  it('등록에 실패하면 서버 오류 메시지를 보여준다', () => {
    renderHook(() => useCreateConsumptionMutation());

    act(() => {
      handleError?.({ response: { data: { message: '도로명주소를 확인해 주세요.' } } });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: '도로명주소를 확인해 주세요.',
    });
  });
});
