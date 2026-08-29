import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import PrivacyPolicyPage from './PrivacyPolicyPage';

describe('PrivacyPolicyPage', () => {
  it('개인정보 처리방침 제목과 처리 목적 표를 보여준다', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicyPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: '뒤로 가기' })).toBeInTheDocument();
    expect(screen.getByText(/챱챱 개인정보 처리방침/)).toBeInTheDocument();
    expect(screen.getByText(/처리 목적/)).toBeInTheDocument();
  });
});
