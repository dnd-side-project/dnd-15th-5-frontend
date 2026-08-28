import {
  formatVisitDateTime,
  formatVisitDateTimeConfirmLabel,
  getVisitPeriodForHour,
  getVisitPeriodLabel,
} from '@chapchap/shared/record';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import type { ShopSearchResult } from '@/features/shop';

import ManualRecordPage from './ManualRecordPage';

import type { VisitDateTimeValue } from '@chapchap/shared/record';

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

function ShopSearchTarget() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    manualRecordVisitDateTime?: VisitDateTimeValue;
    manualRecordAmount?: string;
    manualRecordCategory?: string;
  } | null;

  return (
    <div>
      <p
        data-has-visit-date={String(Boolean(state?.manualRecordVisitDateTime))}
        data-amount={state?.manualRecordAmount}
        data-category={state?.manualRecordCategory}
      >
        가게 검색 화면 {location.search}
      </p>
      <button type="button" onClick={() => navigate(-1)}>
        검색에서 뒤로 가기
      </button>
    </div>
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

  it('매장 상세에서 전달한 카테고리를 처음부터 선택한다', () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/record/manual',
            state: { shop: selectedShop, category: '음식점' },
          },
        ]}
      >
        <Routes>
          <Route path="/record/manual" element={<ManualRecordPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: '음식점' })).toHaveAttribute('aria-pressed', 'true');
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
      screen.getByRole('button', { name: /방문 일시 변경, 2025년 7월 15일.*밤/ })
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
    expect(screen.getByText('가게 검색 화면')).toHaveAttribute('data-has-visit-date', 'true');

    unmount();
    renderPage();

    await user.click(screen.getByRole('button', { name: '뒤로 가기' }));
    expect(screen.getByText('가게 검색 화면')).toBeInTheDocument();
  });

  it('가게 변경으로 이동할 때 입력해둔 금액과 카테고리를 함께 전달한다', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByRole('textbox', { name: '금액' }), '7000');
    await user.click(screen.getByRole('button', { name: '음식점' }));
    await user.click(screen.getByRole('button', { name: '변경' }));

    const shopSearchScreen = screen.getByText('가게 검색 화면');
    expect(shopSearchScreen).toHaveAttribute('data-amount', '7000');
    expect(shopSearchScreen).toHaveAttribute('data-category', '음식점');
  });

  it('가게 변경을 취소해도 이전 수기 입력 화면의 초안을 복원한다', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByRole('textbox', { name: '금액' }), '7000');
    await user.click(screen.getByRole('button', { name: '음식점' }));
    await user.click(screen.getByRole('button', { name: '변경' }));
    await user.click(screen.getByRole('button', { name: '검색에서 뒤로 가기' }));

    expect(screen.getByRole('textbox', { name: '금액' })).toHaveValue('7,000');
    expect(screen.getByRole('button', { name: '음식점' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('가게 검색에서 돌아왔을 때 전달받은 초안을 복원하고 변경사항으로 유지한다', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/record/manual',
            state: {
              isShopChange: true,
              shop: selectedShop,
              amount: '9000',
              category: '음식점',
            },
          },
        ]}
      >
        <Routes>
          <Route path="/record/manual" element={<ManualRecordPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('textbox', { name: '금액' })).toHaveValue('9,000');
    expect(screen.getByRole('button', { name: '음식점' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: '기록 닫고 홈으로 이동' }));
    expect(screen.getByRole('dialog', { name: '기록 작성을 그만둘까요?' })).toBeInTheDocument();
  });

  it('입력한 내용이 없으면 확인 없이 바로 지도 홈으로 이동한다', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: '기록 닫고 홈으로 이동' }));

    expect(
      screen.queryByRole('dialog', { name: '기록 작성을 그만둘까요?' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('홈 화면')).toBeInTheDocument();
  });

  it('입력한 내용이 있으면 닫기 확인 후 나가기를 선택해야 지도 홈으로 이동한다', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByRole('textbox', { name: '금액' }), '5000');
    await user.click(screen.getByRole('button', { name: '기록 닫고 홈으로 이동' }));

    expect(screen.getByRole('dialog', { name: '기록 작성을 그만둘까요?' })).toBeInTheDocument();
    expect(screen.queryByText('홈 화면')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '나가기' })).toHaveClass(
      'w-0',
      'flex-1',
      'text-body-01-medium'
    );
    expect(screen.getByRole('button', { name: '계속 작성하기' })).toHaveClass(
      'w-0',
      'flex-1',
      'text-body-01-medium'
    );

    await user.click(screen.getByRole('button', { name: '계속 작성하기' }));
    expect(
      screen.queryByRole('dialog', { name: '기록 작성을 그만둘까요?' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '소비 정보를 입력해주세요' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '기록 닫고 홈으로 이동' }));
    await user.click(screen.getByRole('button', { name: '나가기' }));

    expect(screen.getByText('홈 화면')).toBeInTheDocument();
  });

  it('입력한 내용이 있으면 뒤로 가기도 확인 후 이동한다', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByRole('textbox', { name: '금액' }), '5000');
    await user.click(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(screen.getByRole('dialog', { name: '기록 작성을 그만둘까요?' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '나가기' }));

    expect(screen.getByText('가게 검색 화면')).toBeInTheDocument();
  });

  it('금액을 잘못 입력하면 필드 오류 안내를 보여준다', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByRole('textbox', { name: '금액' }), '0');

    const amountInput = screen.getByRole('textbox', { name: '금액' });
    const errorMessage = screen.getByRole('alert');

    expect(errorMessage).toHaveTextContent('1원 이상');
    expect(amountInput).toHaveAttribute('aria-invalid', 'true');
    expect(amountInput).toHaveAttribute('aria-describedby', errorMessage.id);
  });

  it('위치 정보가 없는 가게는 변경 버튼과 연결된 필드 오류를 보여준다', () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/record/manual',
            state: { shop: { ...selectedShop, latitude: Number.NaN } },
          },
        ]}
      >
        <Routes>
          <Route path="/record/manual" element={<ManualRecordPage />} />
        </Routes>
      </MemoryRouter>
    );

    const errorMessage = screen.getByRole('alert');

    expect(errorMessage).toHaveTextContent('위치 정보가 없어 기록할 수 없어요');
    expect(screen.getByRole('button', { name: '변경' })).toHaveAttribute(
      'aria-describedby',
      errorMessage.id
    );
    expect(screen.getByRole('button', { name: '기록하기' })).toBeDisabled();
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
    const nextVisitDateTime: VisitDateTimeValue = { date: previousDate, period: nextPeriod };
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
      name: formatVisitDateTimeConfirmLabel(nextVisitDateTime, now),
    });
    expect(confirmButton).toBeInTheDocument();

    await user.click(confirmButton);

    const dialog = screen.getByRole('dialog', { name: '방문 일시 선택' });
    const sheet = dialog.parentElement?.parentElement;
    expect(sheet).toHaveClass('translate-y-full');

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: `방문 일시 변경, ${formatVisitDateTime(nextVisitDateTime, now)}`,
        })
      ).toBeInTheDocument();
      expect(screen.queryByRole('dialog', { name: '방문 일시 선택' })).not.toBeInTheDocument();
    });
  });
});
