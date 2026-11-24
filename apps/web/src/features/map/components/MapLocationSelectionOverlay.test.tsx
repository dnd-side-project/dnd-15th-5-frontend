import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { geocodeMapLocation } from '@/features/map/apis/services/googleMapsGeocoding';
import { useMapSelectionAddress } from '@/features/map/hooks/useMapSelectionAddress';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';

import MapLocationSelectionOverlay from './MapLocationSelectionOverlay';

jest.mock('@/features/map/apis/services/googleMapsGeocoding');

beforeEach(() => {
  jest.mocked(geocodeMapLocation).mockReset();
  useLocationSelectionStore.setState(useLocationSelectionStore.getInitialState());
});

it('주소 조회 실패 시 확정을 막고 같은 위치의 재조회 성공 후에만 실제 주소를 전달한다', async () => {
  const user = userEvent.setup();
  const position = { lat: 37.51, lng: 127.03 };
  const address = '서울특별시 동대문구 답십리동';
  let resolveRetry!: (response: google.maps.GeocoderResponse) => void;
  const retryResponse = new Promise<google.maps.GeocoderResponse>((resolve) => {
    resolveRetry = resolve;
  });
  jest
    .mocked(geocodeMapLocation)
    .mockRejectedValueOnce(new Error('주소 조회 실패'))
    .mockReturnValueOnce(retryResponse);
  const onConfirm = jest.fn();
  render(
    <MapLocationSelectionOverlay isSaving={false} hasSaveError={false} onConfirm={onConfirm} />
  );
  const { result } = renderHook(useMapSelectionAddress);
  const confirmButton = screen.getByRole('button', { name: '이 동네로 가게 추천' });

  expect(confirmButton).toBeDisabled();
  await act(async () => result.current(position));

  expect(screen.getByText('주소를 확인하지 못했어요')).toBeInTheDocument();
  expect(confirmButton).toBeDisabled();
  await user.click(confirmButton);
  expect(onConfirm).not.toHaveBeenCalled();

  await user.click(screen.getByRole('button', { name: '주소 다시 확인하기' }));
  expect(screen.getByText('주소를 확인하고 있어요')).toBeInTheDocument();
  expect(confirmButton).toBeDisabled();
  await act(async () =>
    resolveRetry({
      results: [{ formatted_address: `대한민국 ${address}` } as google.maps.GeocoderResult],
    })
  );

  await waitFor(() => expect(confirmButton).toBeEnabled());
  expect(screen.getByText(address)).toBeInTheDocument();
  await user.click(confirmButton);
  expect(onConfirm).toHaveBeenCalledWith({ status: 'ready', position, address });
  expect(geocodeMapLocation).toHaveBeenCalledTimes(2);
});
