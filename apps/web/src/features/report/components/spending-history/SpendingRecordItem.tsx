import type { SpendingRecord } from '@/features/report/types';
import { CardThumbnail, CardTitle } from '@/shared/ui/card';

type SpendingRecordItemProps = {
  record: SpendingRecord;
};

const formatAmount = (amount: number) => `${amount.toLocaleString('ko-KR')} 원`;

/** 가게명, 결제 정보와 금액을 표시하는 소비내역 목록 항목입니다. */
export default function SpendingRecordItem({ record }: SpendingRecordItemProps) {
  return (
    <li className="flex items-center gap-3">
      <CardThumbnail src={null} />
      <div className="min-w-0 flex-1">
        <CardTitle weight="semibold">{record.shopName}</CardTitle>
        <p className="mt-1 truncate text-caption-01-regular text-neutral-500">
          {record.paidAtLabel} · {record.category}
        </p>
      </div>
      <strong className="shrink-0 text-body-01-semibold text-neutral-900">
        {formatAmount(record.amount)}
      </strong>
    </li>
  );
}
