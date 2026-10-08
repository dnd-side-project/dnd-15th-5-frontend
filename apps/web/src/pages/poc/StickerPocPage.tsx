import { useNavigate } from 'react-router-dom';

import StickerPoc from '@/features/record/sticker/StickerPoc';

export default function StickerPocPage() {
  const navigate = useNavigate();

  return <StickerPoc onClose={() => navigate(-1)} />;
}
