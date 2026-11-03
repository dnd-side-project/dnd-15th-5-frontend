import { useNavigate } from 'react-router-dom';

import { NotificationFeed } from '@/features/notification';
import PageHeader from '@/shared/layout/PageHeader';

export default function NotificationPage() {
  const navigate = useNavigate();

  return (
    <main className="-mx-4 flex h-[calc(100dvh-env(safe-area-inset-bottom))] flex-col overflow-hidden bg-neutral-00">
      <PageHeader
        title="알림"
        onBack={() => navigate(-1)}
        backButtonLabel="이전 화면으로 돌아가기"
        className="mx-4 mb-4"
      />

      <div className="min-h-0 flex-1 overflow-y-auto pb-page-bottom">
        <NotificationFeed />
      </div>
    </main>
  );
}
