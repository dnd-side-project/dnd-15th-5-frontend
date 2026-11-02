import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';

import { deleteConsumption } from '@/features/record/apis/clients';

import ConsumptionRecordActions from './ConsumptionRecordActions';

const mockToast = jest.fn();
jest.mock('@/features/record/apis/clients', () => ({ deleteConsumption: jest.fn() }));
jest.mock('@/shared/ui/toast', () => ({ useToast: () => ({ showToast: mockToast }) }));

function LocationProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <p>{location.pathname}</p>
      <p>{location.state?.scrollToDate}</p>
      <p data-testid="return-state">{JSON.stringify(location.state?.returnState)}</p>
      <button onClick={() => navigate(-1)}>돌아가기</button>
    </>
  );
}
const setup = () => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/report/history']}>
        <ConsumptionRecordActions>
          {({ onEditRecord, onDeleteRecord }) => (
            <>
              <button onClick={() => onEditRecord?.(196, '2020-06-01')}>수정</button>
              <button onClick={() => onDeleteRecord?.(196)}>삭제</button>
            </>
          )}
        </ConsumptionRecordActions>
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>
  );
  return client;
};
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(deleteConsumption).mockResolvedValue({});
});

it('수정 화면에 진입하고 돌아오면 선택한 기록 날짜를 복원한다', async () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: '수정' }));
  expect(await screen.findByText('/record/196/edit')).toBeInTheDocument();
  expect(JSON.parse(screen.getByTestId('return-state').textContent!)).toMatchObject({
    scrollToConsumptionId: 196,
    scrollToDate: '2020-06-01',
    returnEntryKey: expect.any(String),
  });
  fireEvent.click(screen.getByRole('button', { name: '돌아가기' }));
  expect(await screen.findByText('2020-06-01')).toBeInTheDocument();
});

it('취소하면 삭제하지 않고, 확정하면 해당 ID를 삭제하고 관련 쿼리를 갱신한다', async () => {
  const client = setup();
  client.setQueryData(['/v1/consumptions'], {});
  client.setQueryData(['/v1/consumptions/196'], {});
  fireEvent.click(screen.getByRole('button', { name: '삭제' }));
  expect(screen.getByRole('dialog', { name: '기록을 삭제할까요?' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '취소하기' }));
  expect(deleteConsumption).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '삭제' }));
  fireEvent.click(screen.getByRole('button', { name: '삭제하기' }));
  await waitFor(() =>
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }))
  );
  expect(deleteConsumption).toHaveBeenCalledWith(196, undefined);
  expect(client.getQueryData(['/v1/consumptions/196'])).toBeUndefined();
  expect(client.getQueryState(['/v1/consumptions'])?.isInvalidated).toBe(true);
});

it('삭제 실패 시 확인창에서 다시 시도할 수 있다', async () => {
  jest.mocked(deleteConsumption).mockRejectedValueOnce(new Error('실패'));
  setup();
  fireEvent.click(screen.getByRole('button', { name: '삭제' }));
  fireEvent.click(screen.getByRole('button', { name: '삭제하기' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('다시 시도');
  expect(mockToast).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '삭제하기' }));
  await waitFor(() => expect(mockToast).toHaveBeenCalledTimes(1));
});

it('삭제 요청 중에는 중복 삭제와 취소를 막는다', async () => {
  let complete!: (value: object) => void;
  jest.mocked(deleteConsumption).mockReturnValueOnce(
    new Promise((resolve) => {
      complete = resolve;
    })
  );
  setup();
  fireEvent.click(screen.getByRole('button', { name: '삭제' }));
  const button = screen.getByRole('button', { name: '삭제하기' });
  fireEvent.click(button);
  fireEvent.click(button);
  await waitFor(() => expect(screen.getByRole('button', { name: '취소하기' })).toBeDisabled());
  await waitFor(() => expect(deleteConsumption).toHaveBeenCalledTimes(1));
  await act(async () => {
    complete({});
  });
  await waitFor(() => expect(mockToast).toHaveBeenCalledTimes(1));
});
