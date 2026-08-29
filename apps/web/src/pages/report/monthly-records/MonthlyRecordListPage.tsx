import { useNavigate } from 'react-router-dom';

import { MonthlyStickerRecordList } from '@/features/report';
import { BackButton } from '@/shared/ui/back-button';

export default function MonthlyRecordListPage() {
  const navigate = useNavigate();

  return (
    <main className="mobile-frame pb-safe-bottom fixed inset-0 flex flex-col overflow-hidden bg-neutral-00 px-4">
      <MonthlyStickerRecordList
        headerContent={<BackButton className="mt-0" onClick={() => navigate(-1)} />}
      />
    </main>
  );
}
