import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { useHomeBottomSheetStore } from '../stores/homeBottomSheetStore';
import { useMapCategoryFilterStore } from '../stores/mapCategoryFilterStore';
import { useMapFocusStore } from '../stores/mapFocusStore';

import { useOpenLikedPlaceFromLocation } from './useOpenLikedPlaceFromLocation';

function NavigationProbe() {
  useOpenLikedPlaceFromLocation();
  const location = useLocation();
  return <p>{JSON.stringify(location.state)}</p>;
}

describe('useOpenLikedPlaceFromLocation', () => {
  it('지도 이동 시 이전 필터를 초기화하고 일회성 이동 정보만 제거한다', () => {
    useMapCategoryFilterStore.setState({ selectedCategory: '카페' });
    useHomeBottomSheetStore.setState({ activeSheet: { type: 'home' } });
    useMapFocusStore.getState().clearFocusPosition();
    const position = { lat: 37.5, lng: 127 };

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/home',
            state: { openLikedPlace: { placeId: '101', position }, retained: true },
          },
        ]}
      >
        <NavigationProbe />
      </MemoryRouter>
    );

    expect(useMapCategoryFilterStore.getState().selectedCategory).toBeNull();
    expect(useHomeBottomSheetStore.getState().activeSheet).toEqual({
      type: 'likedRecommendation',
      recommendationId: '101',
    });
    expect(useMapFocusStore.getState().focusPosition).toEqual(position);
    expect(screen.getByText('{"retained":true}')).toBeInTheDocument();
  });
});
