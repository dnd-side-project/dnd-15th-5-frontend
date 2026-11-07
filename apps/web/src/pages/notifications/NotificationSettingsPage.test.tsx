import { fireEvent, render, screen } from '@testing-library/react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useNativeNotificationPermission, useNotificationSettings } from '@/features/notification';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

import NotificationSettingsPage from './NotificationSettingsPage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('@/features/notification', () => ({
  NotificationToggle: ({
    checked,
    disabled,
    id,
    label,
  }: {
    checked: boolean;
    disabled: boolean;
    id: string;
    label: string;
  }) =>
    jest.requireActual('react').createElement('button', {
      id,
      type: 'button',
      role: 'switch',
      'aria-label': label,
      'aria-checked': checked,
      disabled,
    }),
  useNativeNotificationPermission: jest.fn(),
  useNotificationSettings: jest.fn(),
}));

const mockUseLocation = jest.mocked(useLocation);
const mockUseNavigate = jest.mocked(useNavigate);
const mockUseNativeNotificationPermission = jest.mocked(useNativeNotificationPermission);
const mockUseNotificationSettings = jest.mocked(useNotificationSettings);
const historyStateSpy = jest.spyOn(window.history, 'state', 'get');

describe('<NotificationSettingsPage />', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(navigate);
    mockUseNativeNotificationPermission.mockReturnValue({
      isInNativeApp: false,
      isNotificationPermissionKnown: false,
      hasNotificationPermission: false,
      openNotificationSettings: jest.fn(),
    });
    mockUseNotificationSettings.mockReturnValue({
      settingsQuery: {
        data: { data: { consumptionReminderEnabled: false, monthlyReportEnabled: true } },
        isError: false,
        isPending: false,
        refetch: jest.fn(),
      } as never,
      isSaving: false,
      toggleSetting: jest.fn(),
    });
  });

  afterAll(() => historyStateSpy.mockRestore());

  it('마이페이지에서 진입하면 이전 이력으로 돌아간다', () => {
    mockUseLocation.mockReturnValue({ state: { fromMyPage: true } } as ReturnType<
      typeof useLocation
    >);
    historyStateSpy.mockReturnValue({ idx: 1 } as History['state']);

    render(<NotificationSettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: '이전 화면으로 돌아가기' }));

    expect(navigate).toHaveBeenCalledWith(-1);
  });

  it('직접 진입했으면 마이페이지로 이동한다', () => {
    mockUseLocation.mockReturnValue({ state: null } as ReturnType<typeof useLocation>);
    historyStateSpy.mockReturnValue({ idx: 0 } as History['state']);

    render(<NotificationSettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: '이전 화면으로 돌아가기' }));

    expect(navigate).toHaveBeenCalledWith(ROUTE_PATHS.myPage, { replace: true });
  });

  it('저장 중에는 두 알림 토글을 비활성화한다', () => {
    mockUseLocation.mockReturnValue({ state: null } as ReturnType<typeof useLocation>);
    mockUseNotificationSettings.mockReturnValue({
      settingsQuery: {
        data: { data: { consumptionReminderEnabled: false, monthlyReportEnabled: true } },
        isError: false,
        isPending: false,
        refetch: jest.fn(),
      } as never,
      isSaving: true,
      toggleSetting: jest.fn(),
    });

    render(<NotificationSettingsPage />);

    expect(screen.getByRole('switch', { name: '소비 기록 알림' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: '월간 리포트 알림' })).toBeDisabled();
  });
});
