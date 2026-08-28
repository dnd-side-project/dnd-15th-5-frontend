import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import TermsOfServicePage from './TermsOfServicePage';

describe('TermsOfServicePage', () => {
  it('서비스 이용약관 제목과 본문을 보여준다', () => {
    render(
      <MemoryRouter>
        <TermsOfServicePage />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: '뒤로 가기' })).toBeInTheDocument();
    expect(screen.getByText(/챱챱 서비스 이용약관/)).toBeInTheDocument();
    expect(screen.getByText(/가입과 계정/)).toBeInTheDocument();
  });
});
