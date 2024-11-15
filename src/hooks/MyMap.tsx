// src/hooks/MyMap.tsx
import { GoogleMap } from '@capacitor/google-maps';
import { useEffect, useRef } from 'react';
import { mapsApiKey } from '../mapApiKeys';

interface MyMapProps {
  lat: number;
  lng: number;
  onMapClick: (e: { latitude: number; longitude: number }) => void;
  onMarkerClick: (e: { markerId: string; latitude: number; longitude: number }) => void;
}

// Extindem interfața GoogleMap pentru a include metodele necesare
interface ExtendedGoogleMap extends GoogleMap {
  destroy: () => Promise<void>;
  removeMarker: (markerId: string) => Promise<void>;
}

const MyMap: React.FC<MyMapProps> = ({ lat, lng, onMapClick, onMarkerClick }) => {
  const mapRef = useRef<HTMLElement>(null);
  const googleMapRef = useRef<ExtendedGoogleMap | null>(null);
  const markerRef = useRef<string | null>(null); // Pentru a gestiona markerul

  // Crearea hărții la montare
  useEffect(() => {
    createMap();
    return () => {
      if (googleMapRef.current) {
        googleMapRef.current.removeAllMapListeners().catch(err => console.error('Error removing map listeners:', err));
        googleMapRef.current.destroy().catch(err => console.error('Error destroying map:', err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Actualizarea markerului atunci când latitudinea sau longitudinea se schimbă
  useEffect(() => {
    if (googleMapRef.current) {
      // Eliminarea markerului existent dacă există
      if (markerRef.current) {
        googleMapRef.current.removeMarker(markerRef.current)
          .then(() => {
            console.log(`Marker ${markerRef.current} removed`);
            markerRef.current = null;
          })
          .catch(err => console.error('Error removing marker:', err));
      }

      // Adăugarea unui nou marker la locația specificată
      googleMapRef.current.addMarker({
        coordinate: { lat, lng },
        title: 'Product Location',
      })
        .then(markerId => {
          markerRef.current = markerId;
          console.log(`Marker ${markerId} added at coordinates: (${lat}, ${lng})`);
        })
        .catch(err => console.error('Error adding marker:', err));

      // Actualizarea camerei hărții
      googleMapRef.current.setCamera({
        coordinate: { lat, lng },
        zoom: 14,
      })
        .then(() => {
          console.log('Camera updated to coordinates:', lat, lng);
        })
        .catch(err => console.error('Error setting camera:', err));
    }
  }, [lat, lng]);

  return (
    <div className="component-wrapper">
      <capacitor-google-map
        ref={mapRef}
        style={{ display: 'block', width: '100%', height: '400px' }}
      ></capacitor-google-map>
    </div>
  );

  function createMap() {
    if (!mapRef.current) {
      console.error('mapRef is null');
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
    })
      .then((map: GoogleMap) => {
        googleMapRef.current = map as ExtendedGoogleMap;
        console.log('Google Map created');

        // Adăugăm un marker inițial
        map.addMarker({
          coordinate: { lat, lng },
          title: 'Product Location',
        })
          .then(markerId => {
            markerRef.current = markerId;
            console.log(`Initial marker ${markerId} added at coordinates: (${lat}, ${lng})`);
          })
          .catch(err => console.error('Error adding initial marker:', err));

        // Setăm ascultători pentru evenimente
        map.setOnMapClickListener(({ latitude, longitude }) => {
          console.log(`Map clicked at coordinates: (${latitude}, ${longitude})`);
          onMapClick({ latitude, longitude });
        });

        map.setOnMarkerClickListener(({ markerId, latitude, longitude }) => {
          console.log(`Marker ${markerId} clicked at coordinates: (${latitude}, ${longitude})`);
          onMarkerClick({ markerId, latitude, longitude });
        });
      })
      .catch((error) => {
        console.error('Error creating map:', error);
      });
  }
};

export default MyMap;
