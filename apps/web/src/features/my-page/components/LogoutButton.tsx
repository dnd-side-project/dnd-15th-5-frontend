import { Button } from '@/shared/ui/button';

import { useLogout } from '../hooks/useLogout';

export default function LogoutButton() {
  const { isLoading, logout } = useLogout();

  return (
    <Button variant="secondary" isLoading={isLoading} onClick={logout}>
      로그아웃
    </Button>
  );
}
