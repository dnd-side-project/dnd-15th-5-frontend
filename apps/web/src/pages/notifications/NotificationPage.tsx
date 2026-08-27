import { useNavigate } from 'react-router-dom';

import { NotificationFeed } from '@/features/notification';
import { BackButton } from '@/shared/ui/back-button';

export default function NotificationPage() {
  const navigate = useNavigate();

  return (
    <main className="-mx-4 min-h-screen-safe-bottom bg-neutral-00">
      <header className="relative mb-7.5 flex h-11 items-start justify-center px-4 pt-4">
        <BackButton
          className="absolute top-4 left-4 mt-0"
          onClick={() => navigate(-1)}
          aria-label="이전 화면으로 돌아가기"
        />
        <h1 className="text-title-02-bold tracking-[-0.02em] text-neutral-700">알림</h1>
      </header>

      <NotificationFeed />
    </main>
  );
}
