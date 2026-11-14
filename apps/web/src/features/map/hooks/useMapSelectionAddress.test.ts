import { act, renderHook } from '@testing-library/react';

import { geocodeMapLocation } from '@/features/map/apis/services/googleMapsGeocoding';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';

import { useMapSelectionAddress } from './useMapSelectionAddress';

jest.mock('@/features/map/apis/services/googleMapsGeocoding');

it('이전에 선택한 위치의 주소 응답이 늦게 도착해도 현재 주소를 유지한다', async () => {
  const firstPosition = { lat: 37.51, lng: 127.03 };
  const secondPosition = { lat: 37.55, lng: 127.05 };
  const addressResponse = (address: string): google.maps.GeocoderResponse => ({
    results: [{ formatted_address: address } as google.maps.GeocoderResult],
  });
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
