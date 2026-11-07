import { useEffect, useRef, useState } from 'react';

import { geocodeMapLocation } from '@/features/map/apis/services/googleMapsGeocoding';
import type { MapPosition } from '@/features/map/types';

const MAX_NEIGHBORHOOD_RESULTS = 8;
const REGION_COMPONENT_TYPES = [
  'administrative_area_level_1',
  'administrative_area_level_2',
  'administrative_area_level_3',
  'locality',
  'sublocality',
  'sublocality_level_1',
  'neighborhood',
];

export type NeighborhoodResult = {
  address: string;
  id: string;
  position: MapPosition;
};

export type NeighborhoodSearchState =
  { status: 'idle' | 'loading' | 'error' } | { status: 'success'; results: NeighborhoodResult[] };

const getNeighborhoodAddress = (result: google.maps.GeocoderResult) => {
  const regionParts = result.address_components
    .filter((component) => component.types.some((type) => REGION_COMPONENT_TYPES.includes(type)))
    .map((component) => component.long_name)
    .filter((part, index, parts) => parts.indexOf(part) === index);

  return regionParts.length > 0 ? regionParts.join(' ') : result.formatted_address;
};

/** 동네를 검색하고 이전 검색의 응답이 현재 결과를 덮지 않도록 관리합니다. */
export const useNeighborhoodSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchState, setSearchState] = useState<NeighborhoodSearchState>({ status: 'idle' });
  const requestIdRef = useRef(0);

  useEffect(
    () => () => {
      requestIdRef.current += 1;
    },
    []
  );

  const handleSearch = (keyword: string) => {
    const normalizedKeyword = keyword.trim();
    const requestId = ++requestIdRef.current;
    setSearchTerm(normalizedKeyword);

    if (!normalizedKeyword) {
      setSearchState({ status: 'idle' });
      return;
    }

    setSearchState({ status: 'loading' });

    const searchNeighborhoods = async () => {
      try {
        const response = await geocodeMapLocation({
          address: normalizedKeyword,
          componentRestrictions: { country: 'KR' },
          region: 'KR',
        });

        if (requestIdRef.current !== requestId) {
          return;
        }

        const regionResults = response.results.filter((result) =>
          result.types.some((type) => REGION_COMPONENT_TYPES.includes(type))
        );
        const matchedResults = regionResults.length > 0 ? regionResults : response.results;
        setSearchState({
          status: 'success',
          results: matchedResults.slice(0, MAX_NEIGHBORHOOD_RESULTS).map((result) => ({
            id: result.place_id,
            address: getNeighborhoodAddress(result),
            position: {
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng(),
            },
          })),
        });
      } catch {
        if (requestIdRef.current === requestId) {
          setSearchState({ status: 'error' });
        }
      }
    };

    void searchNeighborhoods();
  };

  return {
    searchTerm,
    searchState,
    searchNeighborhoods: handleSearch,
  };
};
