//(Roles 1 & 2: The Map & GPS)
import React, { useState, useEffect } from 'react';

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
      setLocationError(error.message); // e.g. "User denied Geolocation"
    },
    {
      enableHighAccuracy: true,  // Use GPS when available
      maximumAge: 10000,        // Cache for 10 seconds
      timeout: 5000,
    }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}, []);





  return (
    <div style={{ height: '70vh', background: '#e0e0e0' }}>
      <h2>Map Layer (Roles 1 & 2)</h2>
      {destination && <p>Heading to: {destination.name}</p>}
    </div>
  );
}








