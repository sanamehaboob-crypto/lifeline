import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      // Fallback to Delhi center
      setLocation({ lat: 28.6139, lng: 77.2090 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setError('Unable to detect location. Using default (Delhi).');
        // Fallback to Delhi center
        setLocation({ lat: 28.6139, lng: 77.2090 });
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  };

  const setManualLocation = (lat, lng) => {
    setLocation({ lat, lng });
    setError(null);
  };

  return (
    <LocationContext.Provider value={{
      location,
      error,
      loading,
      detectLocation,
      setManualLocation,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
};
