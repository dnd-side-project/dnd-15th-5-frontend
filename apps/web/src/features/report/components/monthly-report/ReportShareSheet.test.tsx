import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import ReportShareSheet from './ReportShareSheet';

function ReportShareSheetHarness() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} type="button">
        공유 열기
      </button>
      <ReportShareSheet
        isDownloading={false}
        isKakaoShareReady
        isPreparingKakaoShare={false}
        isSharing={false}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onDownload={jest.fn()}
        onKakaoShare={jest.fn()}
      />
    </>
  );
}

describe('ReportShareSheet', () => {
  it('카카오 공유 데이터를 준비하는 동안 공유 버튼을 비활성화한다', () => {
    render(
      <ReportShareSheet
        isDownloading={false}
        isKakaoShareReady={false}
        isPreparingKakaoShare
        isSharing={false}
        isOpen
        onClose={jest.fn()}
        onDownload={jest.fn()}
        onKakaoShare={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: '카카오톡으로 공유하기' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('열릴 때 포커스와 스크롤을 제한하고 Escape로 닫은 뒤 포커스를 복원한다', async () => {
    const user = userEvent.setup();
    render(<ReportShareSheetHarness />);
    const openButton = screen.getByRole('button', { name: '공유 열기' });

    await user.click(openButton);

    expect(screen.getByRole('dialog', { name: '취향 카드 공유하기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '이미지 저장' })).toHaveFocus();
    expect(document.body).toHaveStyle({ overflow: 'hidden' });

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: '취향 카드 공유하기' })).not.toBeInTheDocument();
    expect(document.body).not.toHaveStyle({ overflow: 'hidden' });
    expect(openButton).toHaveFocus();
  });

  it('Tab 포커스가 열린 시트 내부를 순환한다', async () => {
    const user = userEvent.setup();
    render(<ReportShareSheetHarness />);

    await user.click(screen.getByRole('button', { name: '공유 열기' }));
    await user.tab();

    expect(screen.getByRole('button', { name: '카카오톡으로 공유하기' })).toHaveFocus();

    await user.tab();

    expect(screen.getByRole('button', { name: '바텀시트 높이 조절' })).toHaveFocus();
  });
});
