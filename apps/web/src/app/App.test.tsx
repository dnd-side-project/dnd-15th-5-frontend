import { render, screen } from '@testing-library/react';

import QueryProvider from '@/app/providers/QueryProvider';
import { ToastProvider } from '@/shared/ui/toast';

import App from './App';

jest.mock('@/shared/assets/images/state', () => ({
  EmptyStateImage: 'img-empty.png',
  ErrorStateImage: 'img-error.png',
}));
jest.mock('@/shared/assets/images/logo-login.png', () => 'logo-login.png');
// NOTE: Worker 생성에 필요한 Vite의 import.meta는 jsdom의 앱 렌더링 검증에서 실행하지 않는다.
jest.mock('@/features/record/sticker/background-removal/removeStickerBackground', () => ({
  removeStickerBackground: jest.fn(),
  prepareStickerBackground: jest.fn(),
  disposeStickerBackground: jest.fn(),
}));

describe('App', () => {
  it('정상적으로 렌더링된다', () => {
    render(
      <QueryProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </QueryProvider>
    );

    expect(screen.getByRole('img', { name: 'ChapChap' })).toHaveAttribute('src', 'logo-login.png');
    expect(screen.getByRole('main')).toHaveClass('min-h-screen-safe-bottom');
    expect(screen.getByRole('button', { name: 'Kakao 로그인' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Google 로그인' })).toBeInTheDocument();
  });
});
