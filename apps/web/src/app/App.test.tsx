import { render, screen } from '@testing-library/react';

import { ToastProvider } from '@/shared/ui/toast';

import App from './App';

jest.mock('@/shared/assets/images/state', () => ({
  EmptyStateImage: 'img-empty.png',
  ErrorStateImage: 'img-error.png',
}));
jest.mock('@/shared/assets/images/logo-login.png', () => 'logo-login.png');

describe('App', () => {
  it('정상적으로 렌더링된다', () => {
    render(
      <ToastProvider>
        <App />
      </ToastProvider>
    );

    expect(screen.getByRole('img', { name: 'ChapChap' })).toHaveAttribute('src', 'logo-login.png');
    expect(screen.getByRole('main')).toHaveClass('min-h-screen-safe-bottom');
    expect(screen.getByRole('button', { name: 'Kakao 로그인' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Google 로그인' })).toBeInTheDocument();
  });
});
