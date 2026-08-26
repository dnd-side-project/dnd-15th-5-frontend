import { NATIVE_APP_ACTIVE_EVENT } from '@chapchap/shared/bridge';
import { QueryClient } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';

import QueryProvider from './QueryProvider';

jest.mock('@/shared/lib/bridge', () => ({ isNativeApp: () => true }));
jest.mock('@/shared/lib/env', () => ({ IS_DEVELOPMENT: false }));

describe('QueryProvider', () => {
  it('네이티브 앱이 활성화되면 소비와 리포트 캐시를 무효화한다', () => {
    const invalidateQueries = jest
      .spyOn(QueryClient.prototype, 'invalidateQueries')
      .mockResolvedValue(undefined);
    const { unmount } = render(
      <QueryProvider>
        <div />
      </QueryProvider>
    );

    act(() => window.dispatchEvent(new Event(NATIVE_APP_ACTIVE_EVENT)));

    expect(invalidateQueries).toHaveBeenCalledTimes(1);
    const { predicate } = invalidateQueries.mock.calls[0][0] ?? {};

    expect(predicate?.({ queryKey: ['/consumptions', 'infinite'] } as never)).toBe(true);
    expect(predicate?.({ queryKey: ['/reports/current'] } as never)).toBe(true);
    expect(predicate?.({ queryKey: ['/accounts/me'] } as never)).toBe(false);

    unmount();
    invalidateQueries.mockRestore();
  });
});
