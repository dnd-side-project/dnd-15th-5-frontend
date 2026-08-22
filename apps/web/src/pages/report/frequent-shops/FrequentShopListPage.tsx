import { useNavigate } from 'react-router-dom';

import { FrequentShopList } from '@/features/report';
import { BackButton } from '@/shared/ui/back-button';

export default function FrequentShopListPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-dvh flex-col">
      <FrequentShopList
        headerContent={<BackButton onClick={() => navigate(-1)} className="mt-0" />}
      />
    </main>
  );
}
