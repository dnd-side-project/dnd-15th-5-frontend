import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import SpendingRecordItem from './SpendingRecordItem';

const consumption = {
  amount: 18_000,
  category: '카페',
  id: 1,
  placeId: 42,
  placeName: '챱챱 카페',
  purchaseDate: '2026-08-29',
  purchaseTime: '14:30:00',
};

describe('SpendingRecordItem', () => {
  it('항목을 누르면 해당 가게 상세 경로로 이동한다', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/report/history']}>
        <Routes>
          <Route
            path="/report/history"
            element={
              <ul>
                <SpendingRecordItem consumption={consumption} />
              </ul>
            }
          />
          <Route path="/home/shop/:shopId" element={<p>가게 상세 화면</p>} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('link', { name: /챱챱 카페/ }));

    expect(screen.getByText('가게 상세 화면')).toBeInTheDocument();
  });

  it('가게 식별자가 없으면 링크 없이 기록만 표시한다', () => {
    render(
      <MemoryRouter>
        <ul>
          <SpendingRecordItem consumption={{ ...consumption, placeId: undefined }} />
        </ul>
      </MemoryRouter>
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('챱챱 카페')).toBeInTheDocument();
  });
});
