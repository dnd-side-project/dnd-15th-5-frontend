import { render, screen } from '@testing-library/react';

import { ToastProvider } from '@/shared/ui/toast';

import App from './App';

jest.mock('@/shared/assets/images/state', () => ({
  EmptyStateImage: 'img-empty.png',
  ErrorStateImage: 'img-error.png',
}));

describe('App', () => {
  it('정상적으로 렌더링된다', () => {
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );

    expect(screen.getByRole('button', { name: 'Kakao 로그인' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Google 로그인' })).toBeInTheDocument();
  });
});
