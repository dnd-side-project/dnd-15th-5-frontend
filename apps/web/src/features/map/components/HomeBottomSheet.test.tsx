import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import HomeBottomSheet from './HomeBottomSheet';

describe('HomeBottomSheet', () => {
  it('소비 기록 탭을 선택하면 페이지에서 전달한 소비내역을 표시한다', async () => {
    const user = userEvent.setup();
    render(
      <HomeBottomSheet
        renderSpendingHistory={(headerContent) => (
          <div>
            {headerContent}
            소비내역 콘텐츠
          </div>
        )}
      />
    );

    const historyPanel = screen.getByText('소비내역 콘텐츠').closest('[aria-hidden]');
    expect(historyPanel).toHaveAttribute('aria-hidden', 'true');

    await user.click(screen.getByRole('button', { name: '소비 기록' }));

    expect(historyPanel).toHaveAttribute('aria-hidden', 'false');
  });

  it('탭을 전환해도 소비내역 상태와 탭별 스크롤 위치를 유지한다', async () => {
    const user = userEvent.setup();
    render(
      <HomeBottomSheet
        renderSpendingHistory={(headerContent) => (
          <div>
            {headerContent}
            <input aria-label="선택한 월" defaultValue="7월" />
          </div>
        )}
      />
    );
    const sheet = screen.getByRole('button', { name: '바텀시트 높이 조절' })
      .parentElement as HTMLElement;
    const scrollContainer = sheet.lastElementChild as HTMLElement;

    await user.click(screen.getByRole('button', { name: '소비 기록' }));
    const selectedMonthInput = screen.getByRole('textbox', { name: '선택한 월' });
    await user.clear(selectedMonthInput);
    await user.type(selectedMonthInput, '6월');
    scrollContainer.scrollTop = 120;

    await user.click(screen.getByRole('button', { name: '자주 소비한 곳' }));
    scrollContainer.scrollTop = 40;
    await user.click(screen.getByRole('button', { name: '소비 기록' }));

    expect(screen.getByRole('textbox', { name: '선택한 월' })).toHaveValue('6월');
    expect(scrollContainer.scrollTop).toBe(120);
  });

  it('탭 전환 후 새로 렌더링된 활성 탭 버튼으로 포커스를 복원한다', async () => {
    const user = userEvent.setup();
    render(
      <HomeBottomSheet renderSpendingHistory={(headerContent) => <div>{headerContent}</div>} />
    );

    await user.click(screen.getByRole('button', { name: '소비 기록' }));
    expect(screen.getByRole('button', { name: '소비 기록' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: '자주 소비한 곳' }));
    expect(screen.getByRole('button', { name: '자주 소비한 곳' })).toHaveFocus();
  });
});
