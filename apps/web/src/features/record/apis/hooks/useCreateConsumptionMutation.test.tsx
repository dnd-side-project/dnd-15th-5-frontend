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
let handleSuccess:
  | ((
      response: unknown,
      variables: { data: { placeName: string; latitude: number; longitude: number } }
    ) => Promise<void>)
  | undefined;
let handleError:
  ((error: { response?: { status?: number; data?: { message?: string } } }) => void) | undefined;

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

  it('등록에 성공하면 서버 상태를 갱신하고 등록한 장소 정보와 함께 지도 홈으로 이동한다', async () => {
    renderHook(() => useCreateConsumptionMutation());

    await act(async () => {
      await handleSuccess?.(undefined, {
        data: { placeName: '카페 차차', latitude: 37.5, longitude: 127 },
      });
    });

    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
    expect(mockShowToast).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTE_PATHS.home, {
      replace: true,
      state: {
        createdPlace: { placeName: '카페 차차', latitude: 37.5, longitude: 127 },
      },
    });

    const { predicate } = mockInvalidateQueries.mock.calls[0][0] as {
      predicate: (query: { queryKey: unknown[] }) => boolean;
    };

    expect(predicate({ queryKey: ['/v1/consumptions/visited-places'] })).toBe(true);
    expect(predicate({ queryKey: ['/v1/consumptions/places/rank'] })).toBe(true);
    expect(predicate({ queryKey: ['/v1/reports/current'] })).toBe(true);
    expect(predicate({ queryKey: ['/v1/reports/monthly'] })).toBe(false);
    expect(predicate({ queryKey: ['/v1/accounts/me'] })).toBe(false);
    expect(predicate({ queryKey: ['/v1/oauth/kakao/callback'] })).toBe(false);
  });

  it('등록에 실패하면 서버 오류 메시지를 보여준다', () => {
    renderHook(() => useCreateConsumptionMutation());

    act(() => {
      handleError?.({
        response: { status: 422, data: { message: '도로명주소를 확인해 주세요.' } },
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      message: '도로명주소를 확인해 주세요.',
    });
  });

  it('저장 중 화면을 떠나면 늦은 성공 응답은 캐시만 갱신하고 홈으로 이동하지 않는다', async () => {
    const { unmount } = renderHook(() => useCreateConsumptionMutation());
    unmount();
    await act(async () => {
      await handleSuccess?.(undefined, {
        data: { placeName: '카페 차차', latitude: 37.5, longitude: 127 },
      });
    });
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('저장 성공 후 캐시 갱신을 기다리다 화면을 떠나도 홈 이동을 막는다', async () => {
    let finish!: () => void;
    mockInvalidateQueries.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve;
      })
    );
    const { unmount } = renderHook(() => useCreateConsumptionMutation());
    const completed = handleSuccess?.(undefined, {
      data: { placeName: '카페 차차', latitude: 37.5, longitude: 127 },
    });
    unmount();
    await act(async () => {
      finish();
      await completed;
    });
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('화면을 떠난 뒤 도착한 저장 오류는 다른 화면에 토스트를 띄우지 않는다', () => {
    const { unmount } = renderHook(() => useCreateConsumptionMutation());
    unmount();
    act(() => {
      handleError?.({ response: { status: 502, data: { message: '늦은 오류' } } });
    });
    expect(mockShowToast).not.toHaveBeenCalled();
  });
});
