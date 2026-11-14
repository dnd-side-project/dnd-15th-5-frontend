import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import ConsumptionRecordActions from '@/features/record/components/ConsumptionRecordActions';
import RouteHistoryProvider from '@/shared/lib/route-history';

import EditRecordPage from './EditRecordPage';

jest.mock('@/features/record/components/EditConsumption', () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: () => void }) => <button onClick={onClose}>수정 닫기</button>,
}));
jest.mock('@/features/shop', () => ({ ShopSearch: () => null }));
jest.mock('@/features/record/apis/hooks/useDeleteConsumptionRecord', () => ({
  useDeleteConsumptionRecord: () => ({
    deleteRecord: jest.fn(),
    isDeleting: false,
    clearDeleteError: jest.fn(),
  }),
}));

function HistoryLayout() {
  const navigate = useNavigate();
  return (
    <RouteHistoryProvider>
      <button onClick={() => navigate(-1)}>브라우저 뒤로</button>
      <button onClick={() => navigate(1)}>브라우저 앞으로</button>
      <Outlet />
    </RouteHistoryProvider>
  );
}

function RecordList() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <ConsumptionRecordActions>
      {({ onEditRecord }) => (
        <>
          <p>목록 날짜:{location.state?.scrollToDate}</p>
          <button onClick={() => onEditRecord?.(196, '2026-11-01')}>목록에서 수정</button>
          <button onClick={() => onEditRecord?.(196)}>날짜 없이 수정</button>
          <button onClick={() => navigate(-1)}>목록에서 뒤로</button>
          <button onClick={() => navigate('/other', { replace: true })}>목록 항목 대체</button>
        </>
      )}
    </ConsumptionRecordActions>
  );
}

it.each([true, false])(
  '목록에서 열고 실제 닫기로 돌아온 뒤 뒤로 한 번에 목록 이전 화면으로 이동한다: %s',
  async (withDate) => {
    render(
      <MemoryRouter initialEntries={['/before', '/list?month=2026-11']}>
        <Routes>
          <Route element={<HistoryLayout />}>
            <Route path="/before" element={<p>목록 이전 화면</p>} />
            <Route path="/list" element={<RecordList />} />
            <Route path="/record/:consumptionId/edit" element={<EditRecordPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    fireEvent.click(
      screen.getByRole('button', { name: withDate ? '목록에서 수정' : '날짜 없이 수정' })
    );
    fireEvent.click(await screen.findByRole('button', { name: '수정 닫기' }));
    await screen.findByRole('button', { name: '목록에서 수정' });
    if (withDate) expect(screen.getByText('목록 날짜:2026-11-01')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '목록에서 뒤로' }));
    expect(await screen.findByText('목록 이전 화면')).toBeInTheDocument();
  }
);

it('실제 이전 항목이 returnTo와 다르면 명시적인 복귀 경로와 상태를 사용한다', async () => {
  const returnState = { scrollToDate: '2026-11-01', returnEntryKey: 'old-list' };
  render(
    <MemoryRouter
      initialEntries={[
        '/list',
        {
          pathname: '/record/196/edit',
          state: {
            returnTo: '/destination',
            returnState,
            returnEntryKey: 'old-list',
          },
        },
      ]}
    >
      <Routes>
        <Route element={<HistoryLayout />}>
          <Route path="/record/:consumptionId/edit" element={<EditRecordPage />} />
          <Route path="*" element={<ReturnDestination />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole('button', { name: '수정 닫기' }));
  await waitFor(() =>
    expect(
      screen.getByText(JSON.stringify({ path: '/destination', state: returnState }))
    ).toBeInTheDocument()
  );
});

it('편집 화면에서 브라우저 뒤로·앞으로 이동해도 선택 날짜와 중복 없는 복귀를 유지한다', async () => {
  render(
    <MemoryRouter initialEntries={['/before', '/list']}>
      <Routes>
        <Route element={<HistoryLayout />}>
          <Route path="/before" element={<p>목록 이전 화면</p>} />
          <Route path="/list" element={<RecordList />} />
          <Route path="/record/:consumptionId/edit" element={<EditRecordPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole('button', { name: '목록에서 수정' }));
  await screen.findByRole('button', { name: '수정 닫기' });
  fireEvent.click(screen.getByRole('button', { name: '브라우저 뒤로' }));
  expect(await screen.findByText('목록 날짜:2026-11-01')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '브라우저 앞으로' }));
  fireEvent.click(await screen.findByRole('button', { name: '수정 닫기' }));
  await screen.findByRole('button', { name: '목록에서 뒤로' });
  fireEvent.click(screen.getByRole('button', { name: '목록에서 뒤로' }));
  expect(await screen.findByText('목록 이전 화면')).toBeInTheDocument();
});

it('이전 목록 항목이 다른 경로로 대체된 뒤 앞으로 왔다면 returnTo로 명시적으로 복귀한다', async () => {
  render(
    <MemoryRouter initialEntries={['/before', '/list']}>
      <Routes>
        <Route element={<HistoryLayout />}>
          <Route path="/before" element={<p>목록 이전 화면</p>} />
          <Route path="/list" element={<RecordList />} />
          <Route path="/other" element={<p>대체된 이전 화면</p>} />
          <Route path="/record/:consumptionId/edit" element={<EditRecordPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole('button', { name: '목록에서 수정' }));
  await screen.findByRole('button', { name: '수정 닫기' });
  fireEvent.click(screen.getByRole('button', { name: '브라우저 뒤로' }));
  fireEvent.click(await screen.findByRole('button', { name: '목록 항목 대체' }));
  expect(await screen.findByText('대체된 이전 화면')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '브라우저 앞으로' }));
  fireEvent.click(await screen.findByRole('button', { name: '수정 닫기' }));
  expect(await screen.findByText('목록 날짜:2026-11-01')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '목록에서 뒤로' }));
  expect(await screen.findByText('대체된 이전 화면')).toBeInTheDocument();
});

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
