import { useNavigate } from 'react-router-dom';

import ManualRecordForm from '@/features/record/components/manual/ManualRecordForm';

export default function ManualRecordPage() {
  const navigate = useNavigate();

  const handlePageBack = () => navigate(-1);
  const handleRecordSubmit = () => undefined;

  return (
    <main className="-mx-4 h-full overflow-hidden bg-white">
      <ManualRecordForm onBack={handlePageBack} onSubmit={handleRecordSubmit} />
    </main>
  );
}
