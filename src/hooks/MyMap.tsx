import { GoogleMap } from '@capacitor/google-maps';
import { useEffect, useRef } from 'react';
import { mapsApiKey } from '../mapApiKeys';

interface MyMapProps {
  lat: number;
  lng: number;
  onMapClick: (e: any) => void;
  onMarkerClick: (e: any) => void;
}

const MyMap: React.FC<MyMapProps> = ({ lat, lng, onMapClick, onMarkerClick }) => {
  const mapRef = useRef<HTMLElement>(null);
  const googleMapRef = useRef<GoogleMap | null>(null);
  const markerRef = useRef<string | null>(null); // Pentru a gestiona markerul

  useEffect(() => {
    createMap();
    return () => {
      googleMapRef.current?.removeAllMapListeners();
      googleMapRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapRef.current]);

  useEffect(() => {
    if (googleMapRef.current) {
      // Dacă există deja un marker, îl eliminăm
      if (markerRef.current) {
        googleMapRef.current.removeMarker(markerRef.current);
      }
      // Adăugăm un nou marker la locația specificată
      googleMapRef.current.addMarker({
        coordinate: { lat, lng },
        title: 'Locația produsului',
      }).then((markerId) => {
        markerRef.current = markerId;
      });
      // Actualizăm centrul hărții
      googleMapRef.current.setCamera({
        coordinate: { lat, lng },
        zoom: 14,
      });
    }
  }, [lat, lng]);

  return (
    <div className="component-wrapper">
      <capacitor-google-map ref={mapRef} style={{ display: 'block', width: '100%', height: '400px' }}></capacitor-google-map>
    </div>
  );

  function createMap() {
    if (!mapRef.current) {
      return;
    }
    GoogleMap.create({
      id: 'my-cool-map',
      element: mapRef.current,
      apiKey: mapsApiKey,
      config: {
        center: { lat, lng },
        zoom: 8,
      },
    }).then((map) => {
      googleMapRef.current = map;
      console.log('Google Map creat');

      // Adăugăm un marker inițial
      map.addMarker({
        coordinate: { lat, lng },
        title: 'Locația produsului',
      }).then((markerId) => {
        markerRef.current = markerId;
      });

      // Setăm ascultători pentru evenimente
      map.setOnMapClickListener(({ latitude, longitude }) => {
        onMapClick({ latitude, longitude });
      });

      map.setOnMarkerClickListener(({ markerId, latitude, longitude }) => {
        onMarkerClick({ markerId, latitude, longitude });
      });
    }).catch((error) => {
      console.error('Eroare la crearea hărții:', error);
    });
  }
};

export default MyMap;
