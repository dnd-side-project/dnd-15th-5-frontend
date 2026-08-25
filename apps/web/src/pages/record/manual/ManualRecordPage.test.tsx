import { getVisitPeriodForHour, getVisitPeriodLabel } from '@chapchap/shared/record';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import type { ShopSearchResult } from '@/features/shop';

import ManualRecordPage from './ManualRecordPage';

import type { VisitDateTimeValue } from '@chapchap/shared/record';

const selectedShop: ShopSearchResult = {
  id: 'place-01',
  name: '투썸플레이스 신논현점',
  address: '서울특별시 강남구 봉은사로 125 1층',
  photoUrl: null,
};

function ShopSearchTarget() {
  const location = useLocation();
  const state = location.state as { manualRecordVisitDateTime?: VisitDateTimeValue } | null;

  return (
    <p data-has-visit-date={String(Boolean(state?.manualRecordVisitDateTime))}>
      가게 검색 화면 {location.search}
    </p>
  );
}

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
        <Route path="/record/shop/search" element={<ShopSearchTarget />} />
      </Routes>
    </MemoryRouter>
  );

describe('<ManualRecordPage />', () => {
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

  it('지난달 기록에서 장소 선택을 마치면 해당 월 날짜 선택을 바로 연다', () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/record/manual',
            search: '?yearMonth=2025-07',
            state: { shop: selectedShop },
          },
        ]}
      >
        <Routes>
          <Route path="/record/manual" element={<ManualRecordPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('dialog', { name: '방문 일시 선택' })).toBeInTheDocument();
    expect(screen.getByText('2025년 7월')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2025년 7월 31일' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('지난달 기록의 장소를 변경한 뒤에는 날짜 선택을 다시 열지 않는다', () => {
    const visitDateTime: VisitDateTimeValue = {
      date: new Date(2025, 6, 15),
      period: 'night',
    };

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/record/manual',
            search: '?yearMonth=2025-07',
            state: { isShopChange: true, shop: selectedShop, visitDateTime },
          },
        ]}
      >
        <Routes>
          <Route path="/record/manual" element={<ManualRecordPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByRole('dialog', { name: '방문 일시 선택' })).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /방문 일시 변경, 7월 15일.*밤/ })
    ).toBeInTheDocument();
  });

  it('지난달 수기 기록을 직접 열어도 최초 장소 선택 시 연월을 유지한다', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/record/manual?yearMonth=2025-07']}>
        <Routes>
          <Route path="/record/manual" element={<ManualRecordPage />} />
          <Route path="/record/shop/search" element={<ShopSearchTarget />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: '가게를 선택해주세요' }));

    expect(screen.getByText('가게 검색 화면 ?yearMonth=2025-07')).toBeInTheDocument();
  });

  it('변경 버튼과 뒤로 가기 버튼으로 가게 검색 화면에 돌아간다', async () => {
    const user = userEvent.setup();
    const { unmount } = renderPage();

    await user.click(screen.getByRole('button', { name: '변경' }));
    expect(screen.getByText('가게 검색 화면')).toHaveAttribute('data-has-visit-date', 'true');

    unmount();
    renderPage();

    await user.click(screen.getByRole('button', { name: '뒤로 가기' }));
    expect(screen.getByText('가게 검색 화면')).toBeInTheDocument();
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
