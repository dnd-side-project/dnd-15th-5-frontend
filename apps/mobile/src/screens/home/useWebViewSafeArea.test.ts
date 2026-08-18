import { act, renderHook } from '@testing-library/react-native';

import { useWebViewSafeArea } from './useWebViewSafeArea';

const SAFE_AREA_EDGES = ['top', 'right', 'bottom', 'left'];

describe('useWebViewSafeArea', () => {
  it('/home에서만 Safe Area를 제거한다', async () => {
    const { result } = await renderHook(() =>
      useWebViewSafeArea('https://chapchap.example.com/home')
    );

    expect(result.current.edges).toEqual([]);
    expect(result.current.isMapHome).toBe(true);

    await act(async () => {
      result.current.handleNavigationStateChange('https://chapchap.example.com/report');
    });

    expect(result.current.edges).toEqual(SAFE_AREA_EDGES);
    expect(result.current.isMapHome).toBe(false);
  });

  it('웹에서 전달한 SPA 경로에 맞춰 Safe Area를 변경한다', async () => {
    const { result } = await renderHook(() => useWebViewSafeArea('https://chapchap.example.com'));

    await act(async () => {
      result.current.handleRouteChange('/home');
    });

    expect(result.current.edges).toEqual([]);

    await act(async () => {
      result.current.handleRouteChange('/my-page');
    });

    expect(result.current.edges).toEqual(SAFE_AREA_EDGES);
  });
});
