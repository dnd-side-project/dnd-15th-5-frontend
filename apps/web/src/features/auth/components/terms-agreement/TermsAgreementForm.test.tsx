import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { ROUTE_PATHS } from '@/shared/constants/routePaths';

import TermsAgreementForm from './TermsAgreementForm';

describe('TermsAgreementForm', () => {
  it('필수 약관에 모두 동의하기 전에는 다음 버튼을 비활성화한다', () => {
    render(
      <MemoryRouter>
        <TermsAgreementForm onSubmit={jest.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: '다음으로' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('필수 항목에 동의해 주세요');
  });

  it('개인정보 처리방침은 체크박스 없이 열람만 할 수 있고, 누르면 상세 화면으로 이동한다', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/agreement']}>
        <Routes>
          <Route path="/agreement" element={<TermsAgreementForm onSubmit={jest.fn()} />} />
          <Route
            path={ROUTE_PATHS.agreementPrivacyPolicy}
            element={<div>개인정보 처리방침 화면</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByRole('checkbox', { name: '개인정보 처리방침' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '개인정보 처리방침' }));

    expect(screen.getByText('개인정보 처리방침 화면')).toBeInTheDocument();
  });

  it('서비스 이용약관 동의 항목의 화살표를 누르면 서비스 이용약관 화면으로 이동한다', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/agreement']}>
        <Routes>
          <Route path="/agreement" element={<TermsAgreementForm onSubmit={jest.fn()} />} />
          <Route
            path={ROUTE_PATHS.agreementTermsOfService}
            element={<div>서비스 이용약관 화면</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '[필수] 서비스 이용약관 동의 내용 보기' }));

    expect(screen.getByText('서비스 이용약관 화면')).toBeInTheDocument();
  });

  it('전체 동의를 선택하면 필수 항목을 모두 선택하고 제출한다', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    render(
      <MemoryRouter>
        <TermsAgreementForm onSubmit={handleSubmit} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('checkbox', { name: '전체 동의' }));

    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    screen.getAllByRole('checkbox').forEach((checkbox) => expect(checkbox).toBeChecked());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '다음으로' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      ageConfirmed: true,
      serviceTermsAgreed: true,
    });
  });

  it('두 필수 항목에 개별로 동의하면 제출할 수 있다', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    render(
      <MemoryRouter>
        <TermsAgreementForm onSubmit={handleSubmit} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('checkbox', { name: '[필수] 만 14세 이상입니다.' }));
    await user.click(screen.getByRole('checkbox', { name: '[필수] 서비스 이용약관 동의' }));
    await user.click(screen.getByRole('button', { name: '다음으로' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      ageConfirmed: true,
      serviceTermsAgreed: true,
    });
  });

  it('약관 제출 중에는 다음 버튼을 로딩 상태로 비활성화한다', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TermsAgreementForm isLoading onSubmit={jest.fn()} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('checkbox', { name: '전체 동의' }));

    expect(screen.getByRole('button', { name: '다음으로' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('button', { name: '다음으로' })).toHaveAttribute('aria-busy', 'true');
  });
});
