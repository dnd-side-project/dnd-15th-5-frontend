import { useLocation, useNavigate, useParams } from 'react-router-dom';

import EditConsumption from '@/features/record/components/EditConsumption';
import { ShopSearch } from '@/features/shop';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { getConsumptionReturnPath } from '@/shared/utils/consumptionNavigation';

export default function EditRecordPage() {
  const { consumptionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const handleClose = () => {
    const returnTo = getConsumptionReturnPath(location.state);
    if (returnTo && window.history.state?.idx > 0) navigate(-1);
    else navigate(ROUTE_PATHS.home, { replace: true });
  };
  return (
    <EditConsumption
      consumptionId={Number(consumptionId)}
      onClose={handleClose}
      renderShopSearch={(onSelect) => <ShopSearch onSelectShop={onSelect} />}
    />
  );
}
