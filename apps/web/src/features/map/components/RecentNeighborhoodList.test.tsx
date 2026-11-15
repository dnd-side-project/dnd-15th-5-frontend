import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { RecentNeighborhood } from '@/features/map/apis/hooks/useRecentNeighborhoods';
import { useLocationSelectionStore } from '@/features/map/stores/locationSelectionStore';

import RecentNeighborhoodList from './RecentNeighborhoodList';

const neighborhoods: RecentNeighborhood[] = [
  { id: 1, address: '역삼동', position: { lat: 37.5, lng: 127.03 } },
  { id: 2, address: '성수동', position: { lat: 37.54, lng: 127.05 } },
];

const renderList = (onRemove = jest.fn()) =>
  render(
    <RecentNeighborhoodList
      neighborhoods={neighborhoods}
      isLoading={false}
      hasError={false}
      isSelecting={false}
      removingId={undefined}
      onSelect={jest.fn()}
      onRemove={onRemove}
    />
  );

beforeEach(() => useLocationSelectionStore.setState(useLocationSelectionStore.getInitialState()));

it('확정 동네가 없으면 최신순 서버 목록의 첫 동네에 배지를 표시한다', () => {
  renderList();
  expect(screen.getByText('현재 설정된 동네').closest('button')).toHaveTextContent('역삼동');
  expect(
    screen.queryByRole('button', { name: '역삼동 최근 동네에서 삭제' })
  ).not.toBeInTheDocument();
});

it('서버 ID가 달라도 확정 좌표와 주소가 일치하는 동네에 배지를 표시한다', () => {
  useLocationSelectionStore.getState().setConfirmedNeighborhood({ ...neighborhoods[0]!, id: 7 });
  renderList();
  expect(screen.getByText('현재 설정된 동네').closest('button')).toHaveTextContent('역삼동');
  expect(
    screen.queryByRole('button', { name: '역삼동 최근 동네에서 삭제' })
  ).not.toBeInTheDocument();
});

it('서버 좌표의 정밀도가 달라도 저장한 동네 ID가 같으면 배지를 표시한다', () => {
  useLocationSelectionStore.getState().setConfirmedNeighborhood({
    ...neighborhoods[1]!,
    position: { lat: 37.5400001, lng: 127.0500001 },
  });
  renderList();
  expect(screen.getByText('현재 설정된 동네').closest('button')).toHaveTextContent('성수동');
  expect(
    screen.queryByRole('button', { name: '성수동 최근 동네에서 삭제' })
  ).not.toBeInTheDocument();
});

it('현재 설정된 동네 이외의 항목은 삭제할 수 있다', async () => {
  const onRemove = jest.fn();
  useLocationSelectionStore.getState().setConfirmedNeighborhood(neighborhoods[1]!);
  renderList(onRemove);

  await userEvent.click(screen.getByRole('button', { name: '역삼동 최근 동네에서 삭제' }));

  expect(onRemove).toHaveBeenCalledTimes(1);
  expect(onRemove).toHaveBeenCalledWith(neighborhoods[0]!.id);
  expect(screen.getByText('현재 설정된 동네').closest('button')).toHaveTextContent('성수동');
});

it('확정 좌표만 같고 주소가 다르면 다른 동네에 배지를 표시하지 않는다', () => {
  useLocationSelectionStore.getState().setConfirmedNeighborhood({
    position: neighborhoods[0]!.position,
    address: '다른 주소',
  });
  renderList();
  expect(screen.queryByText('현재 설정된 동네')).not.toBeInTheDocument();
});
