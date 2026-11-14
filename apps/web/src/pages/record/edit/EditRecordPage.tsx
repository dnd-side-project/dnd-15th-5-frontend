import { useContext } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import EditConsumption from '@/features/record/components/EditConsumption';
import { ShopSearch } from '@/features/shop';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { RouteHistoryContext } from '@/shared/lib/route-history';
import {
  getConsumptionReturnPath,
  getConsumptionReturnEntryKey,
  getConsumptionReturnState,
} from '@/shared/utils/consumptionNavigation';

export default function EditRecordPage() {
  const { consumptionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const previousLocation = useContext(RouteHistoryContext);
  const handleClose = () => {
    const returnTo = getConsumptionReturnPath(location.state);
    const returnEntryKey = getConsumptionReturnEntryKey(location.state);
    if (
      returnTo &&
      returnEntryKey &&
      previousLocation &&
      `${previousLocation.pathname}${previousLocation.search}` === returnTo &&
      (previousLocation.key === returnEntryKey ||
        getConsumptionReturnEntryKey(previousLocation.state) === returnEntryKey)
    ) {
      navigate(-1);
      return;
    }
    navigate(returnTo ?? ROUTE_PATHS.home, {
      replace: true,
      state: returnTo ? getConsumptionReturnState(location.state) : undefined,
    });
  };
  return (
    <EditConsumption
      consumptionId={Number(consumptionId)}
      onClose={handleClose}
      renderShopSearch={(onSelect) => <ShopSearch onSelectShop={onSelect} />}
    />
  );
}
