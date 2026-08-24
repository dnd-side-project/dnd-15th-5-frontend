import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import MonthlyStickerSummary from './MonthlyStickerSummary';

const renderSummary = (additionalCount: number) => {
  render(
    <MemoryRouter>
      <MonthlyStickerSummary
        additionalCount={additionalCount}
        emptyActionPath="/record"
        recordCount={1}
        stickers={['sticker.png']}
      />
    </MemoryRouter>
  );
};

describe('MonthlyStickerSummary', () => {
  it('추가 스티커가 없으면 개수 배지를 표시하지 않는다', () => {
    renderSummary(0);

    expect(screen.queryByText('+0')).not.toBeInTheDocument();
  });

  it('추가 스티커가 있으면 개수 배지를 표시한다', () => {
    renderSummary(2);

    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});
