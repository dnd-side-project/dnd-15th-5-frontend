import { useEffect, useState } from 'react';

type Position = {
  lat: number;
  lng: number;
};

type UseCurrentPositionResult = {
  position: Position | null;
  isLoading: boolean;
  error: GeolocationPositionError | null;
};

export const useCurrentPosition = (): UseCurrentPositionResult => {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(navigator.geolocation));

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({ lat: result.coords.latitude, lng: result.coords.longitude });
        setIsLoading(false);
      },
      (geolocationError) => {
        setError(geolocationError);
        setIsLoading(false);
      }
    );
  }, []);

  return { position, isLoading, error };
};
