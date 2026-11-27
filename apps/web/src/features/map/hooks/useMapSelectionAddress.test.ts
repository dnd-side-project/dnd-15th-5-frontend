import { act, renderHook } from '@testing-library/react';

import { geocodeMapLocation } from '@/features/map/apis/services/googleMapsGeocoding';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';

import { useMapSelectionAddress } from './useMapSelectionAddress';

jest.mock('@/features/map/apis/services/googleMapsGeocoding');

const addressResponse = (address: string): google.maps.GeocoderResponse => ({
  results: [{ formatted_address: address } as google.maps.GeocoderResult],
});

beforeEach(() => {
  jest.mocked(geocodeMapLocation).mockReset();
  useLocationSelectionStore.setState(useLocationSelectionStore.getInitialState());
});

it('이전에 선택한 위치의 주소 응답이 늦게 도착해도 현재 주소를 유지한다', async () => {
  const firstPosition = { lat: 37.51, lng: 127.03 };
  const secondPosition = { lat: 37.55, lng: 127.05 };
  let resolveFirst!: (response: google.maps.GeocoderResponse) => void;
  const firstResponse = new Promise<google.maps.GeocoderResponse>((resolve) => {
    resolveFirst = resolve;
  });
  jest
    .mocked(geocodeMapLocation)
    .mockReturnValueOnce(firstResponse)
    .mockResolvedValueOnce(addressResponse('성수동'));
  useLocationSelectionStore.setState({ draftSelection: null });
  const { result } = renderHook(useMapSelectionAddress);

  act(() => result.current(firstPosition));
  await act(async () => {
    useLocationSelectionStore.getState().clearDraftSelection();
    result.current(secondPosition);
  });
  await act(async () => resolveFirst(addressResponse('논현동')));

  expect(useLocationSelectionStore.getState().draftSelection).toEqual({
    status: 'ready',
    position: secondPosition,
    address: '성수동',
  });
});

it.each(['', '   ', '대한민국'])(
  '주소가 유효하지 않으면(%s) 선택을 오류 상태로 유지한다',
  async (address) => {
    const position = { lat: 37.51, lng: 127.03 };
    jest.mocked(geocodeMapLocation).mockResolvedValueOnce(addressResponse(address));
    const { result } = renderHook(useMapSelectionAddress);

    await act(async () => result.current(position));

    expect(useLocationSelectionStore.getState().draftSelection).toEqual({
      status: 'error',
      position,
    });
  }
);

it('주소 조회 결과가 없으면 좌표 안내 문구를 저장하지 않는다', async () => {
  const position = { lat: 37.51, lng: 127.03 };
  jest.mocked(geocodeMapLocation).mockResolvedValueOnce({ results: [] });
  const { result } = renderHook(useMapSelectionAddress);

  await act(async () => result.current(position));

  expect(useLocationSelectionStore.getState().draftSelection).toEqual({
    status: 'error',
    position,
  });
});

it('주소 조회 실패 후 같은 좌표로 재시도해 실제 주소를 확정한다', async () => {
  const position = { lat: 37.51, lng: 127.03 };
  jest
    .mocked(geocodeMapLocation)
    .mockRejectedValueOnce(new Error('주소 조회 실패'))
    .mockResolvedValueOnce(addressResponse('대한민국 서울특별시 동대문구 답십리동'));
  const { result } = renderHook(useMapSelectionAddress);

  await act(async () => result.current(position));
  expect(useLocationSelectionStore.getState().draftSelection?.status).toBe('error');

  await act(async () => result.current(position));

  expect(geocodeMapLocation).toHaveBeenCalledTimes(2);
  expect(useLocationSelectionStore.getState().draftSelection).toEqual({
    status: 'ready',
    position,
    address: '서울특별시 동대문구 답십리동',
  });
});

it('이전 좌표의 조회 실패가 늦게 도착해도 새 좌표의 정상 주소를 유지한다', async () => {
  const firstPosition = { lat: 37.51, lng: 127.03 };
  const secondPosition = { lat: 37.55, lng: 127.05 };
  let rejectFirst!: (error: Error) => void;
  const firstResponse = new Promise<google.maps.GeocoderResponse>((_resolve, reject) => {
    rejectFirst = reject;
  });
  jest
    .mocked(geocodeMapLocation)
    .mockReturnValueOnce(firstResponse)
    .mockResolvedValueOnce(addressResponse('성수동'));
  const { result } = renderHook(useMapSelectionAddress);

  act(() => result.current(firstPosition));
  await act(async () => result.current(secondPosition));
  await act(async () => rejectFirst(new Error('이전 주소 조회 실패')));

  expect(useLocationSelectionStore.getState().draftSelection).toEqual({
    status: 'ready',
    position: secondPosition,
    address: '성수동',
  });
});
