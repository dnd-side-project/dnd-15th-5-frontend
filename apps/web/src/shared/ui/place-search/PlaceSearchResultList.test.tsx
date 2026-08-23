import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PlaceSearchResultList } from './PlaceSearchResultList';

const place = {
  id: 'place-1',
  name: '투썸플레이스',
  address: '서울특별시 강남구 봉은사로 125 1층',
};

describe('PlaceSearchResultList', () => {
  it('공통 장소 카드 결과를 누르면 선택한 장소를 전달한다', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(<PlaceSearchResultList places={[place]} hasKeyword onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: /투썸플레이스/ }));

    expect(onSelect).toHaveBeenCalledWith(place);
  });
});
