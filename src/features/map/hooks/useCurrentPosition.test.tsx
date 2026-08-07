import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useCurrentPosition } from './useCurrentPosition';

jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: jest.fn(),
  },
}));

jest.mock('@capacitor/geolocation', () => ({
  Geolocation: {
    checkPermissions: jest.fn(),
    getCurrentPosition: jest.fn(),
    requestPermissions: jest.fn(),
  },
}));

const mockIsNativePlatform = jest.mocked(Capacitor.isNativePlatform);
const mockCheckPermissions = jest.mocked(Geolocation.checkPermissions);
const mockGetCurrentPosition = jest.mocked(Geolocation.getCurrentPosition);
const mockRequestPermissions = jest.mocked(Geolocation.requestPermissions);

describe('useCurrentPosition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentPosition.mockResolvedValue({
      coords: {
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        course: null,
        heading: null,
        headingAccuracy: null,
        latitude: 37.5665,
        longitude: 126.978,
        magneticHeading: null,
        speed: null,
        trueHeading: null,
      },
      timestamp: Date.now(),
    });
  });

  it('네이티브에서 위치 권한을 요청한 뒤 현재 위치를 반환한다', async () => {
    mockIsNativePlatform.mockReturnValue(true);
    mockCheckPermissions.mockResolvedValue({ location: 'prompt', coarseLocation: 'prompt' });
    mockRequestPermissions.mockResolvedValue({ location: 'granted', coarseLocation: 'granted' });

    const { result } = renderHook(() => useCurrentPosition());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockRequestPermissions).toHaveBeenCalledWith({ permissions: ['location'] });
    expect(mockGetCurrentPosition).toHaveBeenCalledWith({
      enableHighAccuracy: true,
      maximumAge: 30_000,
      timeout: 10_000,
    });
    expect(result.current.position).toEqual({ lat: 37.5665, lng: 126.978 });
    expect(result.current.error).toBeNull();
  });

  it('웹에서는 네이티브 권한 API를 호출하지 않는다', async () => {
    mockIsNativePlatform.mockReturnValue(false);

    const { result } = renderHook(() => useCurrentPosition());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockCheckPermissions).not.toHaveBeenCalled();
    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(result.current.position).toEqual({ lat: 37.5665, lng: 126.978 });
  });

  it('현재 위치를 다시 요청한다', async () => {
    mockIsNativePlatform.mockReturnValue(false);

    const { result } = renderHook(() => useCurrentPosition());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockGetCurrentPosition.mockResolvedValueOnce({
      coords: {
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        course: null,
        heading: null,
        headingAccuracy: null,
        latitude: 37.5001,
        longitude: 127.0365,
        magneticHeading: null,
        speed: null,
        trueHeading: null,
      },
      timestamp: Date.now(),
    });

    await act(async () => {
      await result.current.refreshPosition();
    });

    expect(mockGetCurrentPosition).toHaveBeenCalledTimes(2);
    expect(result.current.position).toEqual({ lat: 37.5001, lng: 127.0365 });
  });
});
