import { useNavigate } from 'react-router-dom';

import { MonthlyStickerRecordList } from '@/features/report';
import { BackButton } from '@/shared/ui/back-button';

export default function MonthlyRecordListPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen-safe-bottom flex flex-col">
      <MonthlyStickerRecordList
        headerContent={<BackButton className="mt-0" onClick={() => navigate(-1)} />}
      />
    </main>
  );
}
