import { act, renderHook } from '@testing-library/react-native';

import { useWebViewNavigationState } from './useWebViewNavigationState';

describe('useWebViewNavigationState', () => {
  it('전체 문서 이동 경로가 지도 홈인지 추적한다', async () => {
    const { result } = await renderHook(() =>
      useWebViewNavigationState('https://chapchap.example.com/home')
    );

    expect(result.current.isMapHome).toBe(true);

    await act(async () => {
      result.current.handleNavigationStateChange('https://chapchap.example.com/report');
    });

    expect(result.current.isMapHome).toBe(false);
  });

  it('웹에서 전달한 SPA 경로를 반영한다', async () => {
    const { result } = await renderHook(() =>
      useWebViewNavigationState('https://chapchap.example.com')
    );

    await act(async () => {
      result.current.handleRouteChange('/home');
    });
    expect(result.current.isMapHome).toBe(true);

    await act(async () => {
      result.current.handleRouteChange('/my-page');
    });
    expect(result.current.isMapHome).toBe(false);
  });
});
