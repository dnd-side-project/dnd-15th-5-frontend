import { renderHook, waitFor } from '@testing-library/react-native';
import { createElement, StrictMode } from 'react';

import { useForegroundLocationPermission } from './useForegroundLocationPermission';

import type { PropsWithChildren } from 'react';

const mockRequestForegroundPermissionsAsync = jest.fn();

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: () => mockRequestForegroundPermissionsAsync(),
}));

describe('useForegroundLocationPermission', () => {
  beforeEach(() => {
    mockRequestForegroundPermissionsAsync.mockReset();
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
  });

  it('활성화되면 위치 권한을 요청하고 완료 상태를 반환한다', async () => {
    const { result } = await renderHook(() => useForegroundLocationPermission(true));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
    expect(mockRequestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('권한 요청이 실패해도 완료 상태를 반환한다', async () => {
    mockRequestForegroundPermissionsAsync.mockRejectedValue(new Error('권한 요청 실패'));

    const { result } = await renderHook(() => useForegroundLocationPermission(true));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('위치 권한이 거부돼도 완료 상태를 반환한다', async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const { result } = await renderHook(() => useForegroundLocationPermission(true));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('비활성화 상태에서는 위치 권한을 요청하지 않는다', async () => {
    const { result } = await renderHook(() => useForegroundLocationPermission(false));

    expect(result.current).toBe(false);
    expect(mockRequestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('StrictMode에서도 위치 권한을 한 번만 요청한다', async () => {
    function Wrapper({ children }: PropsWithChildren) {
      return createElement(StrictMode, null, children);
    }

    await renderHook(() => useForegroundLocationPermission(true), { wrapper: Wrapper });

    expect(mockRequestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
  });
});
