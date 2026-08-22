import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TermsAgreementForm from './TermsAgreementForm';

describe('TermsAgreementForm', () => {
  it('필수 약관에 모두 동의하기 전에는 다음 버튼을 비활성화한다', () => {
    render(<TermsAgreementForm onSubmit={jest.fn()} />);

    expect(screen.getByRole('button', { name: '다음으로' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('필수 항목에 동의해 주세요');
  });

  it('전체 동의를 선택하면 모든 항목을 선택하고 제출한다', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    render(<TermsAgreementForm onSubmit={handleSubmit} />);

    await user.click(screen.getByRole('checkbox', { name: '전체 동의' }));

    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    screen.getAllByRole('checkbox').forEach((checkbox) => expect(checkbox).toBeChecked());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '다음으로' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      serviceTermsAgreed: true,
      privacyPolicyAgreed: true,
      locationTermsAgreed: true,
    });
  });

  it('선택 약관에 동의하지 않아도 필수 약관만 동의하면 제출할 수 있다', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    render(<TermsAgreementForm onSubmit={handleSubmit} />);

    await user.click(screen.getByRole('checkbox', { name: '[필수] 서비스 이용약관 동의' }));
    await user.click(screen.getByRole('checkbox', { name: '[필수] 개인정보 수집 · 이용 동의' }));
    await user.click(screen.getByRole('button', { name: '다음으로' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      serviceTermsAgreed: true,
      privacyPolicyAgreed: true,
      locationTermsAgreed: false,
    });
  });
});
