import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { isNativeApp } from '@/shared/lib/bridge';

import RecordMethodPage from './RecordMethodPage';

jest.mock('@/shared/lib/bridge', () => ({ isNativeApp: jest.fn() }));

const mockIsNativeApp = jest.mocked(isNativeApp);

describe('<RecordMethodPage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsNativeApp.mockReturnValue(false);
  });

  it('소비 기록 방법과 각 입력 화면으로 이동하는 링크를 보여준다', () => {
    render(
      <MemoryRouter initialEntries={['/record']}>
        <RecordMethodPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '소비 기록 방법을 선택해주세요'
    );
    expect(screen.getByRole('link', { name: /영수증 인식/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('link', { name: /영수증 인식/ })).not.toHaveAttribute('href');
    expect(screen.getByRole('link', { name: /직접 작성/ })).toHaveAttribute(
      'href',
      '/record/shop/search'
    );
  });

  it('지난달 기록 진입이면 직접 작성 경로에 선택한 연월을 유지한다', () => {
    render(
      <MemoryRouter initialEntries={['/record?yearMonth=2026-07']}>
        <RecordMethodPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /직접 작성/ })).toHaveAttribute(
      'href',
      '/record/shop/search?yearMonth=2026-07'
    );
  });

  it('뒤로 가기 버튼을 누르면 이전 화면으로 이동한다', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/home', '/record']} initialIndex={1}>
        <Routes>
          <Route path="/record" element={<RecordMethodPage />} />
          <Route path="/home" element={<p>홈 화면</p>} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(screen.getByText('홈 화면')).toBeInTheDocument();
  });

  it('일반 웹에서는 영수증 인식 카드를 비활성 스타일로 표시하고 이동하지 않는다', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/record']}>
        <Routes>
          <Route path="/record" element={<RecordMethodPage />} />
          <Route path="/record/receipt/camera" element={<p>영수증 촬영</p>} />
        </Routes>
      </MemoryRouter>
    );

    const receiptMethod = screen.getByRole('link', { name: /영수증 인식/ });

    expect(receiptMethod).toHaveClass('cursor-not-allowed', 'bg-neutral-200', 'text-neutral-500');
    await user.click(receiptMethod);

    expect(screen.queryByText('영수증 촬영')).not.toBeInTheDocument();
  });

  it('앱 WebView에서 영수증 인식을 누르면 촬영 진입 경로로 이동한다', async () => {
    const user = userEvent.setup();
    mockIsNativeApp.mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/record']}>
        <Routes>
          <Route path="/record" element={<RecordMethodPage />} />
          <Route path="/record/receipt/camera" element={<p>영수증 촬영</p>} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('link', { name: /영수증 인식/ }));

    expect(screen.getByText('영수증 촬영')).toBeInTheDocument();
  });
});
