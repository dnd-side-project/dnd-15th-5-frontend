import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PlaceSearchInput } from './PlaceSearchInput';

describe('PlaceSearchInput', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('검색 입력의 목적을 접근 가능한 이름으로 제공한다', () => {
    render(<PlaceSearchInput onSearch={jest.fn()} />);

    expect(screen.getByRole('textbox', { name: '장소 검색어' })).toBeInTheDocument();
  });

  it('검색 버튼으로 현재 검색어를 즉시 전달한다', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    render(<PlaceSearchInput onSearch={onSearch} />);

    await user.type(screen.getByPlaceholderText('장소를 검색해주세요'), '투썸');
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('투썸');
  });

  it('즉시 제출한 검색어를 debounce 종료 후 중복 전달하지 않는다', () => {
    jest.useFakeTimers();
    const onSearch = jest.fn();
    render(<PlaceSearchInput onSearch={onSearch} />);

    fireEvent.change(screen.getByPlaceholderText('장소를 검색해주세요'), {
      target: { value: '투썸' },
    });
    fireEvent.click(screen.getByRole('button', { name: '검색' }));

    expect(onSearch).toHaveBeenCalledTimes(1);
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('appliedKeyword가 바뀌면 검색어를 채우고 즉시 검색을 실행한다', () => {
    const onSearch = jest.fn();
    const { rerender } = render(<PlaceSearchInput onSearch={onSearch} />);

    rerender(<PlaceSearchInput onSearch={onSearch} appliedKeyword="투썸" />);

    expect(screen.getByPlaceholderText('장소를 검색해주세요')).toHaveValue('투썸');
    expect(onSearch).toHaveBeenCalledWith('투썸');
  });

  it('appliedKeyword가 같은 값으로 유지되면 다시 검색하지 않는다', () => {
    const onSearch = jest.fn();
    const { rerender } = render(<PlaceSearchInput onSearch={onSearch} appliedKeyword="투썸" />);
    onSearch.mockClear();

    rerender(<PlaceSearchInput onSearch={onSearch} appliedKeyword="투썸" />);

    expect(onSearch).not.toHaveBeenCalled();
  });
});
