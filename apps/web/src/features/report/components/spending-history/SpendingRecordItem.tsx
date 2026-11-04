import { Link, useLocation, useNavigate } from 'react-router-dom';

import type { ConsumptionResponse } from '@/features/report/apis/dto';
import { formatPurchaseDateTimeLabel } from '@/features/report/utils/consumptions';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import type { ConsumptionActions } from '@/shared/types/consumptionActions';
import { CardTitle } from '@/shared/ui/card';
import SwipeActions from '@/shared/ui/swipe-actions/SwipeActions';
import { isPositiveSafeInteger } from '@/shared/utils/isPositiveSafeInteger';

import type { MouseEvent, ReactNode } from 'react';

type SpendingRecordItemProps = ConsumptionActions & {
  consumption: ConsumptionResponse;
  renderRecordSticker: (consumptionId: number) => ReactNode;
};

const formatAmount = (amount?: number) => `${(amount ?? 0).toLocaleString('ko-KR')} 원`;

/** 가게명, 결제 정보와 금액을 표시하는 소비내역 목록 항목입니다. */
export default function SpendingRecordItem({
  consumption,
  onEditRecord,
  onDeleteRecord,
  renderRecordSticker,
}: SpendingRecordItemProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const handleShopClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    const returnTo = `${location.pathname}${location.search}`;
    const returnState = {
      ...(location.state && typeof location.state === 'object' ? location.state : {}),
      scrollToDate: consumption.purchaseDate,
      scrollToConsumptionId: consumption.id,
      returnEntryKey: location.key,
    };
    await navigate(returnTo, { replace: true, state: returnState });
    navigate(ROUTE_PATHS.shopDetail(String(consumption.placeId)), {
      state: { consumptionListReturn: { returnTo, returnState, returnEntryKey: location.key } },
    });
  };

  const content = (
    <>
      {isPositiveSafeInteger(consumption.id) ? (
        renderRecordSticker(consumption.id)
      ) : (
        <span className="size-13 shrink-0" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1" data-mp-mask="">
        <CardTitle weight="semibold">
          {consumption.placeName?.trim() || '알 수 없는 장소'}
        </CardTitle>
        <p className="mt-1 truncate text-caption-01-regular text-neutral-500">
          {formatPurchaseDateTimeLabel(consumption.purchaseDate, consumption.purchaseTime)} ·{' '}
          {consumption.category?.trim() || '기타'}
        </p>
      </div>
      <strong className="shrink-0 text-body-01-semibold text-neutral-900" data-mp-mask="">
        {formatAmount(consumption.amount)}
      </strong>
    </>
  );

  const row = !isPositiveSafeInteger(consumption.placeId) ? (
    <div className="flex items-center gap-3">{content}</div>
  ) : (
    <Link
      className="flex items-center gap-3 rounded-08 outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
      to={ROUTE_PATHS.shopDetail(String(consumption.placeId))}
      onClick={(event) => void handleShopClick(event)}
    >
      {content}
    </Link>
  );
  const id = consumption.id;
  return (
    <li data-consumption-id={id}>
      {isPositiveSafeInteger(id) && onEditRecord && onDeleteRecord ? (
        <SwipeActions
          label={consumption.placeName?.trim() || '알 수 없는 장소'}
          onEdit={() => onEditRecord(id, consumption.purchaseDate)}
          onDelete={() => onDeleteRecord(id)}
        >
          {row}
        </SwipeActions>
      ) : (
        row
      )}
    </li>
  );
}
