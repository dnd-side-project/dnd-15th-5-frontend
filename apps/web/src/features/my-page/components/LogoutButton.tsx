import { useLogout } from '@/features/my-page/hooks/useLogout';
import { LogoutIcon } from '@/shared/assets/icons';

import MyPageMenuItem from './MyPageMenuItem';

export default function LogoutButton() {
  const { isLoading, logout } = useLogout();

  return (
    <MyPageMenuItem
      icon={LogoutIcon}
      label={isLoading ? '로그아웃 중' : '로그아웃'}
      isLoading={isLoading}
      onClick={logout}
    />
  );
}
