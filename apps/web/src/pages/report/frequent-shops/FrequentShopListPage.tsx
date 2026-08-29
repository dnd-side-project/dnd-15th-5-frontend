import { useNavigate } from 'react-router-dom';

import { FrequentShopList } from '@/features/report';
import { BackButton } from '@/shared/ui/back-button';

export default function FrequentShopListPage() {
  const navigate = useNavigate();

  return (
    <main className="mobile-frame pb-safe-bottom fixed inset-0 flex flex-col overflow-hidden bg-neutral-00 px-4">
      <FrequentShopList
        headerContent={<BackButton onClick={() => navigate(-1)} className="mt-0" />}
      />
    </main>
  );
}
