import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import RecordMethodPage from './RecordMethodPage';

describe('<RecordMethodPage />', () => {
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
      'href',
      '/record/receipt/camera'
    );
    expect(screen.getByRole('link', { name: /직접 작성/ })).toHaveAttribute(
      'href',
      '/record/shop/search'
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
});
