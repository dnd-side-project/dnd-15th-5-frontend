import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { useEffect, useState } from 'react';

type Position = {
  lat: number;
  lng: number;
};

type UseCurrentPositionResult = {
  position: Position | null;
  isLoading: boolean;
  error: Error | null;
};

const getLocationPermission = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  let permissionStatus = await Geolocation.checkPermissions();
  const hasLocationPermission =
    permissionStatus.location === 'granted' || permissionStatus.coarseLocation === 'granted';

  if (!hasLocationPermission) {
    permissionStatus = await Geolocation.requestPermissions({ permissions: ['location'] });
  }

  const isPermissionGranted =
    permissionStatus.location === 'granted' || permissionStatus.coarseLocation === 'granted';

  if (!isPermissionGranted) {
    throw new Error('현재 위치를 확인하려면 위치 권한이 필요해요.');
  }
};

const normalizeLocationError = (error: unknown) =>
  error instanceof Error ? error : new Error('현재 위치를 불러오지 못했어요.');

export const useCurrentPosition = (): UseCurrentPositionResult => {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadCurrentPosition = async () => {
      try {
        await getLocationPermission();
        const result = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          maximumAge: 30_000,
          timeout: 10_000,
        });

        if (!isActive) {
          return;
        }

        setPosition({ lat: result.coords.latitude, lng: result.coords.longitude });
        setError(null);
      } catch (locationError) {
        if (isActive) {
          setError(normalizeLocationError(locationError));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadCurrentPosition();

    return () => {
      isActive = false;
    };
  }, []);

  return { position, isLoading, error };
};
