import { render } from '@testing-library/react';

import App from './App';

jest.mock('@/shared/assets/images/state', () => ({
  EmptyStateImage: 'img-empty.png',
  ErrorStateImage: 'img-error.png',
}));

describe('App', () => {
  it('정상적으로 렌더링된다', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
