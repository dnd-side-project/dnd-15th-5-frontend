import { useNavigate } from 'react-router-dom';

import { NotificationFeed } from '@/features/notification';
import PageHeader from '@/shared/layout/PageHeader';

export default function NotificationPage() {
  const navigate = useNavigate();

  return (
    <main className="mobile-frame pb-safe-bottom fixed inset-0 flex flex-col overflow-hidden bg-neutral-00">
      <PageHeader
        title="알림"
        onBack={() => navigate(-1)}
        backButtonLabel="이전 화면으로 돌아가기"
        className="mb-4"
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <NotificationFeed />
      </div>
    </main>
  );
}
