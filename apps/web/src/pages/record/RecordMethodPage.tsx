import { useNavigate } from 'react-router-dom';

import { RecordMethodLink } from '@/features/record';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { BackButton } from '@/shared/ui/back-button';

export default function RecordMethodPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-full flex-col">
      <BackButton onClick={() => navigate(-1)} />

      <h1 className="mt-8.5 text-heading-01-bold text-neutral-700">
        소비 기록 방법을 <br />
        선택해주세요
      </h1>

      <div className="mt-10 flex flex-col gap-4">
        <RecordMethodLink
          title="영수증 인식"
          description="영수증을 찍어 간편 기록해요"
          to={ROUTE_PATHS.receiptCamera}
          variant="primary"
        />
        <RecordMethodLink
          title="직접 작성"
          description="영수증이 없다면 직접 기록해요"
          to={ROUTE_PATHS.recordShopSearch}
          variant="secondary"
        />
      </div>
    </main>
  );
}
