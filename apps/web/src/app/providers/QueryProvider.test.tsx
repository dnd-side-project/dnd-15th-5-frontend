import { render, screen } from '@testing-library/react';

import { isNativeApp } from '@/shared/lib/bridge';

import QueryProvider from './QueryProvider';

jest.mock('@/shared/lib/bridge', () => ({ isNativeApp: jest.fn() }));
jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => <div data-testid="query-devtools" />,
}));

const mockIsNativeApp = jest.mocked(isNativeApp);

describe('<QueryProvider />', () => {
  it('일반 브라우저 개발 환경에서는 Query Devtools를 표시한다', () => {
    mockIsNativeApp.mockReturnValue(false);

    render(
      <QueryProvider>
        <div>콘텐츠</div>
      </QueryProvider>
    );

    expect(screen.getByTestId('query-devtools')).toBeInTheDocument();
  });

  it('앱 WebView에서는 Query Devtools를 표시하지 않는다', () => {
    mockIsNativeApp.mockReturnValue(true);

    render(
      <QueryProvider>
        <div>콘텐츠</div>
      </QueryProvider>
    );

    expect(screen.queryByTestId('query-devtools')).not.toBeInTheDocument();
  });
});
