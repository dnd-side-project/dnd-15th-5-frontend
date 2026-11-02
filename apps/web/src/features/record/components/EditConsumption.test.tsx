import { runInThisContext } from 'node:vm';

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { createMemoryRouter, RouterProvider, useNavigate } from 'react-router-dom';

import { useGetConsumption } from '@/features/record/apis/queries';
import { TEST_CONSUMPTION_DETAIL } from '@/features/record/testFixtures';

import EditConsumption from './EditConsumption';

// NOTE: jsdom에 없는 Fetch Request는 실행 중인 Node의 표준 구현을 사용합니다.
const originalRequest = globalThis.Request;
beforeAll(() => {
  globalThis.Request = runInThisContext('Request') as typeof Request;
});
afterAll(() => {
  globalThis.Request = originalRequest;
});

const mockSubmit = jest.fn();
jest.mock('@/features/record/apis/queries', () => ({ useGetConsumption: jest.fn() }));
jest.mock('@/features/record/apis/hooks/useUpdateConsumptionRecord', () => ({
  useUpdateConsumptionRecord: () => ({ submit: mockSubmit, isSubmitting: false, submitError: '' }),
}));
jest.mock('@/features/record/hooks/useScanReceipt', () => ({
  useScanReceipt: () => ({ scanReceipt: jest.fn(), isOpeningReceipt: false, receiptError: '' }),
}));
jest.mock('@/features/record/sticker/background-removal/removeStickerBackground', () => ({
  prepareStickerBackground: jest.fn(),
  disposeStickerBackground: jest.fn(),
}));
jest.mock('@/shared/lib/bridge', () => ({ isNativeApp: () => false }));

function Editor() {
  const navigate = useNavigate();
  return (
    <EditConsumption
      consumptionId={196}
      onClose={() => navigate('/list')}
      renderShopSearch={(onSelect) => (
        <button
          onClick={() =>
            onSelect({
              id: 'new-shop',
              name: '변경 가게',
              address: '서울',
              latitude: 37.6,
              longitude: 127.1,
              photoUrl: null,
            })
          }
        >
          가게 선택
        </button>
      )}
    />
  );
}
const setup = () => {
  const router = createMemoryRouter(
    [
      { path: '/edit', element: <Editor /> },
      { path: '/list', element: <p>기록 목록</p> },
    ],
    { initialEntries: ['/list', '/edit'] }
  );
  render(<RouterProvider router={router} />);
  return router;
};
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useGetConsumption).mockReturnValue({
    data: { data: TEST_CONSUMPTION_DETAIL },
    isPending: false,
    isError: false,
    refetch: jest.fn(),
  } as unknown as ReturnType<typeof useGetConsumption>);
});

it('기존 입력값을 복원하고 값이 바뀐 경우에만 저장할 수 있다', async () => {
  setup();
  const submit = screen.getByRole('button', { name: '수정완료' });
  expect(screen.getByRole('textbox', { name: '금액' })).toHaveValue('5,500');
  expect(screen.getByRole('textbox', { name: '메모' })).toHaveValue('기존 메모');
  expect(screen.getByAltText('기록에 적용한 스티커')).toHaveAttribute(
    'src',
    TEST_CONSUMPTION_DETAIL.imageUrl
  );
  expect(submit).toBeDisabled();
  fireEvent.change(screen.getByRole('textbox', { name: '메모' }), {
    target: { value: '변경 메모' },
  });
  expect(submit).toBeEnabled();
  fireEvent.click(submit);
  expect(mockSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ source: 'saved', imageId: 42 }),
    expect.objectContaining({ memo: '변경 메모', purchaseTime: '11:20:15' })
  );
  fireEvent.change(screen.getByRole('textbox', { name: '메모' }), {
    target: { value: '기존 메모' },
  });
  expect(submit).toBeDisabled();
});

it('백그라운드 재조회가 실패해도 작성 중인 입력과 변경 확인을 유지한다', async () => {
  let failRefetch = () => {};
  jest.mocked(useGetConsumption).mockImplementation(() => {
    const [isError, setIsError] = useState(false);
    failRefetch = () => setIsError(true);
    return {
      data: { data: TEST_CONSUMPTION_DETAIL },
      isPending: false,
      isError,
      isFetchedAfterMount: true,
      isFetching: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useGetConsumption>;
  });
  setup();
  const memo = screen.getByRole('textbox', { name: '메모' });
  fireEvent.change(memo, { target: { value: '유실되면 안 되는 메모' } });
  act(() => failRefetch());
  expect(screen.getByRole('textbox', { name: '메모' })).toBe(memo);
  expect(memo).toHaveValue('유실되면 안 되는 메모');
  fireEvent.click(screen.getByRole('button', { name: '기록 닫고 홈으로 이동' }));
  expect(await screen.findByRole('dialog', { name: '수정을 그만할까요?' })).toBeInTheDocument();
});

it('변경 후 닫으면 확인창에서 계속 수정하거나 변경을 버리고 나간다', async () => {
  setup();
  fireEvent.change(screen.getByRole('textbox', { name: '메모' }), { target: { value: '수정 중' } });
  fireEvent.click(screen.getByRole('button', { name: '기록 닫고 홈으로 이동' }));
  expect(await screen.findByRole('dialog', { name: '수정을 그만할까요?' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '계속 수정하기' }));
  expect(screen.getByRole('textbox', { name: '메모' })).toHaveValue('수정 중');
  fireEvent.click(screen.getByRole('button', { name: '기록 닫고 홈으로 이동' }));
  fireEvent.click(await screen.findByRole('button', { name: '그만하기' }));
  await waitFor(() => expect(screen.getByText('기록 목록')).toBeInTheDocument());
});

it('가게 검색을 오가도 이미지와 입력값을 유지한다', () => {
  setup();
  fireEvent.change(screen.getByRole('textbox', { name: '메모' }), {
    target: { value: '유지할 메모' },
  });
  fireEvent.click(screen.getByRole('button', { name: '가게 정보 검색' }));
  fireEvent.click(screen.getByRole('button', { name: '가게 선택' }));
  expect(screen.getByRole('textbox', { name: '메모' })).toHaveValue('유지할 메모');
  expect(screen.getByText('변경 가게')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '가게 정보 검색' })).toHaveTextContent('변경');
  fireEvent.click(screen.getByRole('button', { name: '수정완료' }));
  expect(mockSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ imageId: 42 }),
    expect.objectContaining({ shop: expect.objectContaining({ id: 'new-shop' }) })
  );
});

it('브라우저 뒤로 가기로 나갈 때도 변경 사항을 확인한다', async () => {
  const router = setup();
  fireEvent.change(screen.getByRole('textbox', { name: '메모' }), { target: { value: '수정 중' } });
  await act(async () => {
    await router.navigate(-1);
  });
  expect(await screen.findByRole('dialog', { name: '수정을 그만할까요?' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '계속 수정하기' }));
  expect(screen.getByRole('textbox', { name: '메모' })).toHaveValue('수정 중');
});

it('캐시된 사진 URL을 갱신하는 동안 기존 URL로 수정 폼을 초기화하지 않는다', () => {
  jest.mocked(useGetConsumption).mockReturnValue({
    data: { data: TEST_CONSUMPTION_DETAIL },
    isPending: false,
    isError: false,
    isFetchedAfterMount: false,
    isFetching: true,
  } as unknown as ReturnType<typeof useGetConsumption>);
  setup();
  expect(screen.getByRole('status', { name: '기록 불러오는 중' })).toBeInTheDocument();
  expect(screen.queryByAltText('기록에 적용한 스티커')).not.toBeInTheDocument();
});
