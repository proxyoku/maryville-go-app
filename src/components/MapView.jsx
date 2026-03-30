//(Roles 1 & 2: The Map & GPS)
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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

export default function MapView({ destination, isNavigating }) {
// Initial GPS logic : using the browsers built-in GPS functionality (api: navigator.geolocation)
  const [userLocation, setUserLocation] = useState(null); // this is where the GPS data is stored (get the user location: latitude and longitude)
  const [locationError, setLocationError] = useState(null); // this is where the error message is stored (if the user denies the request, or the browser doesn't support GPS)

// useEffect hook to watch the user's location
useEffect(() => {
  if (!navigator.geolocation) {
    setLocationError("Geolocation not supported"); // if the browser doesn't support GPS, set the error message
    return;
  }

  // watch the user's location: latitude and longitude
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
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
}, []);


// Default campus location if GPS hasn't loaded yet
  const defaultCenter = [38.6462, -90.5037]; 

  return (
    <div style={{ height: '70vh', width: '100%', position: 'relative' }}>
      {locationError && <div style={{color: 'red', position: 'absolute', zIndex: 1000}}>{locationError}</div>}
      
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
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* 4. The Destination Marker */}
        {destination && (
          <Marker position={[destination.lat, destination.lng]}>
            <Popup>Destination: {destination.name}</Popup>
          </Marker>
        )}

        {/* Auto-recenter the map if we are in "Navigating" mode */}
        {isNavigating && userLocation && <RecenterMap location={userLocation} />}
      </MapContainer>
    </div>
  );
}







