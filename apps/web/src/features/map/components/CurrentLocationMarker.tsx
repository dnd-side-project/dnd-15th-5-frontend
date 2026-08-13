import { AdvancedMarker } from '@vis.gl/react-google-maps';

import { useCurrentPosition } from '../hooks/useCurrentPosition';

export default function CurrentLocationMarker() {
  const { position } = useCurrentPosition();

  if (!position) {
    return null;
  }

  return (
    <AdvancedMarker position={position}>
      <div className="h-4 w-4 rounded-full border-2 border-neutral-00 bg-primary-600 shadow-rank" />
    </AdvancedMarker>
  );
}
