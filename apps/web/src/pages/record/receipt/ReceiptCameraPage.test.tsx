import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useOpenReceiptCamera } from '@/features/record';

import ReceiptCameraPage from './ReceiptCameraPage';

jest.mock('@/features/record', () => ({
  useOpenReceiptCamera: jest.fn(),
}));

const mockUseOpenReceiptCamera = jest.mocked(useOpenReceiptCamera);

describe('<ReceiptCameraPage />', () => {
  it('앱에서 카메라가 열리면 WebView를 기록 방법 선택 화면으로 되돌린다', async () => {
    mockUseOpenReceiptCamera.mockReturnValue({
      state: { status: 'opened' },
      retry: jest.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/record', '/record/receipt/camera']} initialIndex={1}>
        <Routes>
          <Route path="/record" element={<p>기록 방법 선택</p>} />
          <Route path="/record/receipt/camera" element={<ReceiptCameraPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('기록 방법 선택')).toBeInTheDocument());
  });

  it('일반 웹에서는 앱 전용 안내를 보여준다', () => {
    mockUseOpenReceiptCamera.mockReturnValue({
      state: { status: 'error', message: '앱에서만 영수증을 촬영할 수 있습니다' },
      retry: jest.fn(),
    });

    render(
      <MemoryRouter>
        <ReceiptCameraPage />
      </MemoryRouter>
    );

    expect(screen.getByText('앱에서만 영수증을 촬영할 수 있습니다')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });
});
