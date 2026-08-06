import { useNavigate } from 'react-router-dom';

import ReceiptCamera from '@/features/record/components/receipt/ReceiptCamera';

export default function ReceiptCameraPage() {
  const navigate = useNavigate();

  const handleCameraClose = () => navigate(-1);

  return (
    <main className="h-dvh bg-black">
      <ReceiptCamera onClose={handleCameraClose} />
    </main>
  );
}
