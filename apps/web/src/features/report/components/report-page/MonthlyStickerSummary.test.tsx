import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import MonthlyStickerSummary from './MonthlyStickerSummary';

const renderSummary = (additionalCount: number, stickers: readonly string[] = ['sticker.png']) => {
  render(
    <MemoryRouter>
      <MonthlyStickerSummary
        additionalCount={additionalCount}
        emptyActionPath="/record"
        stickers={stickers}
      />
    </MemoryRouter>
  );
};

describe('MonthlyStickerSummary', () => {
  it('추가 스티커가 없으면 개수 배지를 표시하지 않는다', () => {
    renderSummary(0);

    expect(screen.queryByText('+0')).not.toBeInTheDocument();
  });

  it('추가 스티커가 있으면 월별 쌓인 기록 링크를 표시한다', () => {
    renderSummary(2);

    expect(screen.getByRole('link', { name: '추가 스티커 2개 모두 보기' })).toHaveAttribute(
      'href',
      '/report/monthly-records'
    );
  });

  it('소비 기록 수와 관계없이 받은 스티커가 없으면 빈 상태를 표시한다', () => {
    renderSummary(0, []);

    expect(screen.getByText('아직 받은 스티커가 없어요')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '소비 기록 작성하러가기' })).toHaveAttribute(
      'href',
      '/record'
    );
  });
});
