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

  it('입력하거나 지운 뒤 시간이 지나도 제출 전에는 검색하지 않는다', () => {
    jest.useFakeTimers();
    const onSearch = jest.fn();
    render(<PlaceSearchInput onSearch={onSearch} />);

    fireEvent.change(screen.getByPlaceholderText('장소를 검색해주세요'), {
      target: { value: '투썸' },
    });
    act(() => {
      jest.advanceTimersByTime(2_000);
    });
    expect(onSearch).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    act(() => jest.advanceTimersByTime(2_000));
    expect(onSearch).not.toHaveBeenCalled();
    fireEvent.submit(screen.getByRole('search'));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('appliedKeyword가 바뀌면 입력만 채우고 제출 전에는 검색하지 않는다', () => {
    const onSearch = jest.fn();
    const { rerender } = render(<PlaceSearchInput onSearch={onSearch} />);

    rerender(<PlaceSearchInput onSearch={onSearch} appliedKeyword={{ keyword: '투썸' }} />);

    expect(screen.getByPlaceholderText('장소를 검색해주세요')).toHaveValue('투썸');
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('appliedKeyword 참조가 그대로 유지되면 다시 검색하지 않는다', () => {
    const onSearch = jest.fn();
    const appliedKeyword = { keyword: '투썸' };
    const { rerender } = render(
      <PlaceSearchInput onSearch={onSearch} appliedKeyword={appliedKeyword} />
    );
    onSearch.mockClear();

    rerender(<PlaceSearchInput onSearch={onSearch} appliedKeyword={appliedKeyword} />);

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('같은 검색어를 다시 선택해도 제출할 때만 검색한다', () => {
    const onSearch = jest.fn();
    const { rerender } = render(
      <PlaceSearchInput onSearch={onSearch} appliedKeyword={{ keyword: '투썸' }} />
    );
    onSearch.mockClear();
    expect(screen.getByRole('textbox')).toHaveValue('투썸');

    rerender(<PlaceSearchInput onSearch={onSearch} appliedKeyword={{ keyword: '투썸' }} />);

    expect(onSearch).not.toHaveBeenCalled();
    fireEvent.submit(screen.getByRole('search'));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('투썸');
  });

  it('Enter로 검색하고 키보드를 닫으며 같은 검색어도 다시 제출할 수 있다', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    render(<PlaceSearchInput onSearch={onSearch} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('enterkeyhint', 'search');
    await user.type(input, '성수{Enter}');
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenLastCalledWith('성수');
    expect(input).not.toHaveFocus();
    await user.click(input);
    await user.keyboard('{Enter}');
    expect(onSearch).toHaveBeenCalledTimes(2);
  });

  it('한글 조합 중 Enter는 막고 조합이 끝난 뒤 명시적으로 제출하면 검색한다', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    render(<PlaceSearchInput onSearch={onSearch} />);
    const input = screen.getByRole('textbox');
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: '성수' } });
    expect(fireEvent.keyDown(input, { key: 'Enter', isComposing: true })).toBe(false);
    fireEvent.submit(screen.getByRole('search'));
    expect(onSearch).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input);
    expect(fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 })).toBe(false);
    expect(onSearch).not.toHaveBeenCalled();
    await user.click(input);
    await user.keyboard('{Enter}');
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('성수');
  });
});
