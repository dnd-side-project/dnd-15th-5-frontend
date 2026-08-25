import { getVisitPeriodForHour, getVisitPeriodLabel } from '@chapchap/shared/record';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { ShopSearchResult } from '@/features/shop';

import ManualRecordPage from './ManualRecordPage';

const mockCreateConsumption = jest.fn();

jest.mock('@/features/record/apis/hooks/useCreateConsumptionMutation', () => ({
  useCreateConsumptionMutation: () => ({
    createConsumption: mockCreateConsumption,
    isCreatingConsumption: false,
  }),
}));

const selectedShop: ShopSearchResult = {
  id: 'place-01',
  name: '투썸플레이스 신논현점',
  address: '서울특별시 강남구 봉은사로 125 1층',
  photoUrl: null,
  latitude: 37.506481,
  longitude: 127.024551,
};

const renderPage = () =>
  render(
    <MemoryRouter
      initialEntries={[
        '/record/shop/search',
        { pathname: '/record/manual', state: { shop: selectedShop } },
      ]}
      initialIndex={1}
    >
      <Routes>
        <Route path="/record/manual" element={<ManualRecordPage />} />
        <Route path="/record/shop/search" element={<p>가게 검색 화면</p>} />
        <Route path="/home" element={<p>홈 화면</p>} />
      </Routes>
    </MemoryRouter>
  );

describe('<ManualRecordPage />', () => {
  beforeEach(() => {
    mockCreateConsumption.mockClear();
  });

  it('선택한 가게와 소비 정보 입력 폼을 보여준다', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByRole('heading', { name: '소비 정보를 입력해주세요' })).toBeInTheDocument();
    expect(screen.getByText(selectedShop.name)).toBeInTheDocument();
    expect(screen.getByText(selectedShop.address)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '카페' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '기록하기' })).toBeDisabled();

    await user.type(screen.getByRole('textbox', { name: '금액' }), '0');

    expect(screen.getByRole('button', { name: '기록하기' })).toBeDisabled();

    await user.clear(screen.getByRole('textbox', { name: '금액' }));
    await user.type(screen.getByRole('textbox', { name: '금액' }), '12abc-000');

    expect(screen.getByRole('textbox', { name: '금액' })).toHaveValue('12,000');
    expect(screen.getByRole('textbox', { name: '금액' })).toBeValid();
    expect(screen.getByRole('button', { name: '기록하기' })).toBeEnabled();
  });

  it('기록하기를 누르면 선택한 장소와 소비 정보를 등록한다', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByRole('textbox', { name: '금액' }), '33000');
    await user.click(screen.getByRole('button', { name: '기록하기' }));

    expect(mockCreateConsumption).toHaveBeenCalledWith(
      expect.objectContaining({
        googlePlaceId: selectedShop.id,
        placeName: selectedShop.name,
        roadAddress: selectedShop.address,
        latitude: selectedShop.latitude,
        longitude: selectedShop.longitude,
        amount: 33000,
        category: '카페',
      })
    );
  });

  it('변경 버튼과 뒤로 가기 버튼으로 가게 검색 화면에 돌아간다', async () => {
    const user = userEvent.setup();
    const { unmount } = renderPage();

    await user.click(screen.getByRole('button', { name: '변경' }));
    expect(screen.getByText('가게 검색 화면')).toBeInTheDocument();

    unmount();
    renderPage();

    await user.click(screen.getByRole('button', { name: '뒤로 가기' }));
    expect(screen.getByText('가게 검색 화면')).toBeInTheDocument();
  });

  it('닫기 버튼을 누르면 지도 홈으로 이동한다', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: '기록 닫고 홈으로 이동' }));

    expect(screen.getByText('홈 화면')).toBeInTheDocument();
  });

  it('방문 일시 선택값을 CTA에 표시하고 확인하면 폼에 반영한다', async () => {
    const user = userEvent.setup();
    const now = new Date();
    const initialPeriod = getVisitPeriodForHour(now.getHours());
    const nextPeriod = initialPeriod === 'morning' ? 'night' : 'morning';
    const nextPeriodLabel = getVisitPeriodLabel(nextPeriod);
    const nextPeriodRange = nextPeriod === 'morning' ? '05–11시' : '21–05시';
    const previousDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    renderPage();

    await user.click(screen.getByRole('button', { name: /방문 일시 변경/ }));

    const openDialog = screen.getByRole('dialog', { name: '방문 일시 선택' });
    const openSheet = openDialog.parentElement?.parentElement;

    await waitFor(() => {
      expect(openSheet).toHaveClass('translate-y-0');
    });
    expect(screen.getByRole('button', { name: '이전 달' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '다음 달' })).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: `${now.getMonth() + 1}월 ${now.getDate()}일 ${getVisitPeriodLabel(initialPeriod)}`,
      })
    ).toBeInTheDocument();
    if (tomorrow.getMonth() === now.getMonth()) {
      expect(
        screen.getByRole('button', {
          name: `${tomorrow.getFullYear()}년 ${tomorrow.getMonth() + 1}월 ${tomorrow.getDate()}일`,
        })
      ).toBeDisabled();
    }

    await user.click(screen.getByRole('button', { name: '이전 달' }));
    expect(screen.getByRole('button', { name: '이전 달' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '다음 달' })).toBeEnabled();

    if (previousDate.getMonth() !== now.getMonth()) {
      await user.click(
        screen.getByRole('button', {
          name: `${previousDate.getFullYear()}년 ${previousDate.getMonth() + 1}월 ${previousDate.getDate()}일`,
        })
      );
    }

    await user.click(screen.getByRole('button', { name: '다음 달' }));

    if (previousDate.getMonth() === now.getMonth()) {
      await user.click(
        screen.getByRole('button', {
          name: `${previousDate.getFullYear()}년 ${previousDate.getMonth() + 1}월 ${previousDate.getDate()}일`,
        })
      );
    }

    await user.click(screen.getByRole('button', { name: `${nextPeriodLabel} ${nextPeriodRange}` }));

    const confirmButton = screen.getByRole('button', {
      name: `${previousDate.getMonth() + 1}월 ${previousDate.getDate()}일 ${nextPeriodLabel}`,
    });
    expect(confirmButton).toBeInTheDocument();

    await user.click(confirmButton);

    const dialog = screen.getByRole('dialog', { name: '방문 일시 선택' });
    const sheet = dialog.parentElement?.parentElement;
    expect(sheet).toHaveClass('translate-y-full');

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: new RegExp(
            `방문 일시 변경, ${previousDate.getMonth() + 1}월 ${previousDate.getDate()}일.*${nextPeriodLabel}`
          ),
        })
      ).toBeInTheDocument();
      expect(screen.queryByRole('dialog', { name: '방문 일시 선택' })).not.toBeInTheDocument();
    });
  });
});
