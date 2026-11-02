import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import EditRecordPage from './EditRecordPage';

jest.mock('@/features/record/components/EditConsumption', () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: () => void }) => <button onClick={onClose}>수정 닫기</button>,
}));
jest.mock('@/features/shop', () => ({ ShopSearch: () => null }));

function ReturnDestination() {
  const location = useLocation();
  return (
    <p>{JSON.stringify({ path: location.pathname + location.search, state: location.state })}</p>
  );
}

it('직전 경로가 달라도 지정한 복귀 경로로 이동하고 가게·스크롤 상태를 유지한다', () => {
  const returnState = {
    recordShop: { id: 'google-cafe' },
    scrollToDate: '2026-11-01',
    scrollToConsumptionId: 196,
  };
  render(
    <MemoryRouter
      initialEntries={[
        '/home',
        {
          pathname: '/record/196/edit',
          state: { returnTo: '/home/shop/101?view=visits', returnState },
        },
      ]}
    >
      <Routes>
        <Route path="/record/:consumptionId/edit" element={<EditRecordPage />} />
        <Route path="*" element={<ReturnDestination />} />
      </Routes>
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole('button', { name: '수정 닫기' }));
  expect(
    screen.getByText(JSON.stringify({ path: '/home/shop/101?view=visits', state: returnState }))
  ).toBeInTheDocument();
});

it.each([undefined, { returnTo: 'https://example.com' }, { returnTo: '//example.com' }])(
  '유효한 복귀 정보가 없으면 홈으로 이동한다: %p',
  (state) => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/record/196/edit', state }]}>
        <Routes>
          <Route path="/record/:consumptionId/edit" element={<EditRecordPage />} />
          <Route path="*" element={<ReturnDestination />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: '수정 닫기' }));
    expect(screen.getByText('{"path":"/home","state":null}')).toBeInTheDocument();
  }
);
