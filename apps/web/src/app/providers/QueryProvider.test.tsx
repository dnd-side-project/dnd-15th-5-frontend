import { NATIVE_APP_ACTIVE_EVENT } from '@chapchap/shared/bridge';
import { QueryClient } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';

import QueryProvider from './QueryProvider';

jest.mock('@/shared/lib/bridge', () => ({ isNativeApp: () => true }));
jest.mock('@/shared/lib/env', () => ({ IS_DEVELOPMENT: false }));

describe('QueryProvider', () => {
  it('네이티브 앱이 활성화되면 사용 중인 stale 소비·리포트 쿼리만 다시 조회한다', () => {
    const refetchQueries = jest
      .spyOn(QueryClient.prototype, 'refetchQueries')
      .mockResolvedValue(undefined);
    const { unmount } = render(
      <QueryProvider>
        <div />
      </QueryProvider>
    );

    act(() => window.dispatchEvent(new Event(NATIVE_APP_ACTIVE_EVENT)));

    expect(refetchQueries).toHaveBeenCalledTimes(1);
    const { predicate, type } = refetchQueries.mock.calls[0][0] ?? {};

    expect(type).toBe('active');
    expect(
      predicate?.({ queryKey: ['/consumptions', 'infinite'], isStale: () => true } as never)
    ).toBe(true);
    expect(predicate?.({ queryKey: ['/reports/current'], isStale: () => true } as never)).toBe(
      true
    );
    expect(
      predicate?.({ queryKey: ['/consumptions', 'infinite'], isStale: () => false } as never)
    ).toBe(false);
    expect(predicate?.({ queryKey: ['/accounts/me'], isStale: () => true } as never)).toBe(false);

    unmount();
    refetchQueries.mockRestore();
  });
});
