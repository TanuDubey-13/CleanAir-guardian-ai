import { useState, useCallback } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export const useGeolocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);

  // Reverse Geocoding using Nominatim OpenStreetMap API
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'CleanAir-Guardian-AI' // Nominatim usage policy recommends setting a User-Agent
          }
        }
      );
      if (!response.ok) throw new Error('Failed to resolve coordinates');
      const data = await response.json();
      return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch (err) {
      console.warn("Reverse geocoding failed, using coordinates as address:", err);
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  }, []);

  const detectLocation = useCallback(async (): Promise<LocationData | null> => {
    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        setLoading(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          const resolvedAddress = await reverseGeocode(lat, lng);
          const locData: LocationData = {
            latitude: lat,
            longitude: lng,
            address: resolvedAddress,
          };
          
          setLocation(locData);
          setLoading(false);
          resolve(locData);
        },
        (err) => {
          console.error("GPS detection error:", err);
          let errorMsg = 'Failed to acquire location.';
          if (err.code === err.PERMISSION_DENIED) {
            errorMsg = 'Location access denied. Please enable GPS permissions or select manually.';
          }
          setError(errorMsg);
          setLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  }, [reverseGeocode]);

  return {
    detectLocation,
    reverseGeocode,
    location,
    setLocation,
    loading,
    error,
    setError
  };
};
