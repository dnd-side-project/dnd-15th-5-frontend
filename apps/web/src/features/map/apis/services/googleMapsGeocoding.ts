/** Google Maps SDK에서 주소 또는 좌표에 해당하는 위치를 조회합니다. */
export const geocodeMapLocation = async (request: google.maps.GeocoderRequest) => {
  const { Geocoder } = (await google.maps.importLibrary(
    'geocoding'
  )) as google.maps.GeocodingLibrary;

  return new Geocoder().geocode(request);
};
