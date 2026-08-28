import { Link } from 'react-router-dom';

import type { ConsumptionResponse } from '@/features/report/apis/dto';
import { formatPurchaseDateTimeLabel } from '@/features/report/utils/consumptions';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { CardThumbnail, CardTitle } from '@/shared/ui/card';

type SpendingRecordItemProps = {
  consumption: ConsumptionResponse;
};

const formatAmount = (amount?: number) => `${(amount ?? 0).toLocaleString('ko-KR')} 원`;

/** 가게명, 결제 정보와 금액을 표시하는 소비내역 목록 항목입니다. */
export default function SpendingRecordItem({ consumption }: SpendingRecordItemProps) {
  const content = (
    <>
      <CardThumbnail src={consumption.thumbnailUrl ?? null} />
      <div className="min-w-0 flex-1">
        <CardTitle weight="semibold">
          {consumption.placeName?.trim() || '알 수 없는 장소'}
        </CardTitle>
        <p className="mt-1 truncate text-caption-01-regular text-neutral-500">
          {formatPurchaseDateTimeLabel(consumption.purchaseDate, consumption.purchaseTime)} ·{' '}
          {consumption.category?.trim() || '기타'}
        </p>
      </div>
      <strong className="shrink-0 text-body-01-semibold text-neutral-900">
        {formatAmount(consumption.amount)}
      </strong>
    </>
  );

  if (consumption.placeId === undefined) {
    return <li className="flex items-center gap-3">{content}</li>;
  }

  return (
    <li>
      <Link
        className="flex items-center gap-3 rounded-08 outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
        to={ROUTE_PATHS.shopDetail(String(consumption.placeId))}
      >
        {content}
      </Link>
    </li>
  );
}
