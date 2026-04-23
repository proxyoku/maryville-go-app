//(Roles 1 & 2: The Map & GPS)
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import muMarkerIcon from '../assets/marker-icon-mu.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

//changes the default icon image to a red one
const RedIcon = L.icon({
    iconUrl: muMarkerIcon,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Helper to auto-center the map when the user moves
function RecenterMap({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng]);
    }
  }, [location, map]);
  return null;
}

export default function MapView({
  destination,
  isNavigating,
  route,
  onUserLocation,
}) {
// Initial GPS logic : using the browsers built-in GPS functionality (api: navigator.geolocation)
  const [userLocation, setUserLocation] = useState(null); // this is where the GPS data is stored (get the user location: latitude and longitude)
  const [locationError, setLocationError] = useState(null); // this is where the error message is stored (if the user denies the request, or the browser doesn't support GPS)
  //debug code for testers
  const [isMocked, setIsMocked] = useState(false);
  
  const UNIVERSITY_COORDS = { lat: 38.6462, lng: -90.5037 };
  //end of debug code

// useEffect hook to watch the user's location
useEffect(() => {
  if (!navigator.geolocation) {
    setLocationError("Geolocation not supported"); // if the browser doesn't support GPS, set the error message
    return;
  }

  // watch the user's location: latitude and longitude
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const next = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      //debug code for testers 
      if (!isMocked) {
        setUserLocation(next);
        onUserLocation?.(next);
      }
//end of debug code 

    },
    (error) => {
      setLocationError(error.message); // "User denied location"
    },
    {
      enableHighAccuracy: true,  // Use GPS when available
      maximumAge: 10000,        // Cache for 10 seconds
      timeout: 5000,
    }
  );

  return () => navigator.geolocation.clearWatch(watchId);

  //debug code for testers
}, [onUserLocation, isMocked]);

  const handleToggleMock = () => {
    const nextMockState = !isMocked;
    setIsMocked(nextMockState);
    if (nextMockState) {
      setUserLocation(UNIVERSITY_COORDS);
      onUserLocation?.(UNIVERSITY_COORDS);
    }
  };
//end of debug code

// Default campus location if GPS hasn't loaded yet
  const defaultCenter = [38.6462, -90.5037]; 

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {locationError && <div style={{color: 'red', position: 'absolute', zIndex: 1000, left: '50%', transform: 'translateX(-50%)'}}>{locationError}</div>}

     {/*debug code for testers*/}
      <button 
        className="debug-mock-toggle" 
        onClick={handleToggleMock}
      >
        {isMocked ? "REAL GPS" : "MOCK UNI"}
      </button>
    {/*end of debug code*/}
    
      <MapContainer 
        center={defaultCenter} 
        zoom={17} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* 3. The "Blue Dot" (User Location) */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={RedIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* 4. The Destination Marker */}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={RedIcon}>
            <Popup>Destination: {destination.name}</Popup>
          </Marker>
        )}

        {/* 5. The Route Line */}
        {Array.isArray(route) && route.length > 1 && (
          <Polyline positions={route} pathOptions={{ color: '#D00000', weight: 5 }} />
        )}

        {/* Auto-recenter the map if we are in "Navigating" mode */}
        {isNavigating && userLocation && <RecenterMap location={userLocation} />}
      </MapContainer>
    </div>
  );
}
