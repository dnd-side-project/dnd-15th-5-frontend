import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  FrequentShopList,
  getFrequentShopPeriod,
  updateFrequentShopPeriodSearchParams,
} from '@/features/report';
import type { FrequentShopPeriod } from '@/features/report/types';
import { BackButton } from '@/shared/ui/back-button';

export default function FrequentShopListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const period = getFrequentShopPeriod(searchParams);

  const handlePeriodChange = (nextPeriod: FrequentShopPeriod) => {
    setSearchParams(
      (currentSearchParams) =>
        updateFrequentShopPeriodSearchParams(currentSearchParams, nextPeriod),
      { replace: true }
    );
  };

  return (
    <main className="mobile-frame pb-safe-bottom fixed inset-0 flex flex-col overflow-hidden bg-neutral-00 px-4">
      <FrequentShopList
        headerContent={<BackButton onClick={() => navigate(-1)} className="mt-0" />}
        onPeriodChange={handlePeriodChange}
        period={period}
      />
    </main>
  );
}
