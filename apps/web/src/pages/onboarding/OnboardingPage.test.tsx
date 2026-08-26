import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import OnboardingPage from './OnboardingPage';

jest.mock(
  '@/shared/assets/images/onboarding/img-onboarding-receipt.png',
  () => 'img-onboarding-receipt.png'
);
jest.mock(
  '@/shared/assets/images/onboarding/img-onboarding-map.png',
  () => 'img-onboarding-map.png'
);
jest.mock(
  '@/shared/assets/images/onboarding/img-onboarding-report.png',
  () => 'img-onboarding-report.png'
);

const renderOnboardingPage = () =>
  render(
    <MemoryRouter initialEntries={['/onboarding']}>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/home" element={<p>홈 화면</p>} />
      </Routes>
    </MemoryRouter>
  );

describe('<OnboardingPage />', () => {
  it('다음과 이전 버튼으로 온보딩 단계를 이동한다', async () => {
    const user = userEvent.setup();
    renderOnboardingPage();

    expect(screen.getByRole('heading')).toHaveTextContent('영수증으로 간편하게 기록해요');
    expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('aria-current', 'step');

    await user.click(screen.getByRole('button', { name: '다음으로' }));

    expect(screen.getByRole('heading')).toHaveTextContent(
      '기록이 쌓이며 나만의 소비 지도를 만들어요'
    );
    expect(screen.getAllByRole('listitem')[1]).toHaveAttribute('aria-current', 'step');

    await user.click(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(screen.getByRole('heading')).toHaveTextContent('영수증으로 간편하게 기록해요');
  });

  it('마지막 단계의 시작하기 버튼으로 홈에 진입한다', async () => {
    const user = userEvent.setup();
    renderOnboardingPage();

    await user.click(screen.getByRole('button', { name: '다음으로' }));
    await user.click(screen.getByRole('button', { name: '다음으로' }));

    expect(screen.getByRole('heading')).toHaveTextContent(
      '매달 새로운 소비 취향 리포트를 받아보세요'
    );
    expect(screen.queryByRole('button', { name: '건너뛰기' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '시작하기' }));

    expect(screen.getByText('홈 화면')).toBeInTheDocument();
  });

  it('첫 단계에서 뒤로 가거나 건너뛰면 홈에 진입한다', async () => {
    const user = userEvent.setup();
    const { unmount } = renderOnboardingPage();

    await user.click(screen.getByRole('button', { name: '뒤로 가기' }));
    expect(screen.getByText('홈 화면')).toBeInTheDocument();

    unmount();
    renderOnboardingPage();

    await user.click(screen.getByRole('button', { name: '건너뛰기' }));
    expect(screen.getByText('홈 화면')).toBeInTheDocument();
  });
});
