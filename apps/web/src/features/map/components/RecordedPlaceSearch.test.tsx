import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MOCK_MAP_STICKERS } from '../mockData';
import { useMapFocusStore } from '../stores/mapFocusStore';

import RecordedPlaceSearch from './RecordedPlaceSearch';

describe('RecordedPlaceSearch', () => {
  beforeEach(() => {
    useMapFocusStore.setState({ focusPosition: null });
  });

  it('스티커 라벨이 아니라 소비 기록 매장의 이름과 주소로 검색한다', async () => {
    const user = userEvent.setup();
    render(<RecordedPlaceSearch onSelectPlace={jest.fn()} />);

    await user.type(screen.getByPlaceholderText('검색어를 입력해주세요'), '투썸플레이스');
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(screen.getByText('투썸플레이스')).toBeInTheDocument();
    expect(screen.getByText('서울특별시 강남구 봉은사로 125 1층')).toBeInTheDocument();
    expect(screen.queryByText('방문 3회')).not.toBeInTheDocument();
  });

  it('검색 결과를 선택하면 해당 소비 기록 장소의 지도 좌표를 전달한다', async () => {
    const user = userEvent.setup();
    const onSelectPlace = jest.fn();
    const sticker = MOCK_MAP_STICKERS[0];
    render(<RecordedPlaceSearch onSelectPlace={onSelectPlace} />);

    await user.type(screen.getByPlaceholderText('검색어를 입력해주세요'), sticker.place.name);
    await user.click(screen.getByRole('button', { name: '검색' }));
    await user.click(screen.getByRole('button', { name: new RegExp(sticker.place.name) }));

    expect(useMapFocusStore.getState().focusPosition).toEqual(sticker.position);
    expect(onSelectPlace).toHaveBeenCalledWith(sticker);
  });

  it('소비 기록 장소에 없는 검색어에는 전용 빈 결과 문구를 표시한다', async () => {
    const user = userEvent.setup();
    render(<RecordedPlaceSearch onSelectPlace={jest.fn()} />);

    await user.type(screen.getByPlaceholderText('검색어를 입력해주세요'), '기록하지 않은 매장');
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(screen.getByText('기록한 장소 중에 검색 결과가 없습니다')).toBeInTheDocument();
  });
});
