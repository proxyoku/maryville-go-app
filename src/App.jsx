import React, { useState } from 'react';
import MapView from './components/MapView';
import SearchView from './components/SearchView';
import NavPanel from './components/NavPanel';
import './App.css';
import { getWalkingRoute } from './services/getWalkingRoute';

function App() {
  // Global "State" - making sure everyones part can work together
  const [destination, setDestination] = useState(null); // Role 3 sets this
  const [isNavigating, setIsNavigating] = useState(false); // Role 5 toggles this
  const [userLocation, setUserLocation] = useState(null);

  const [route, setRoute] = useState(null); // array of [lat, lng]
  const [directions, setDirections] = useState(null); // array of strings
  const [navError, setNavError] = useState(null);

   // Called when the user presses "Go!"
  const beginNavigation = async () => {
    if (!destination) return; // safety check
    if (!userLocation) {
      setNavError("Waiting for GPS location…");
      return;
    }

    setNavError(null);
    setIsNavigating(true);
    console.log("Navigation started!");

    try {
      const { coordinates, steps } = await getWalkingRoute(
        userLocation,
        destination
      );
      setRoute(coordinates);
      setDirections(steps);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setNavError(message);
      setRoute(null);
      setDirections(null);
      setIsNavigating(false);
    }
  };

  // Called when the user presses "Stop"
  const stopNavigation = () => {
    setIsNavigating(false);
    console.log("Navigation stopped.");

    setRoute(null);
    setDirections(null);
    setNavError(null);
  };
  
  return (
    
  <div className="app-container">
    <div className="map-view-wrapper">
      <MapView
        destination={destination}
        isNavigating={isNavigating}
        route={route}
        onUserLocation={setUserLocation}
      />
    </div>

    <div className ="search-view-floating">
      <SearchView setDestination={setDestination} />
    </div>

      <NavPanel 
        destination={destination} 
        isNavigating={isNavigating} 
        beginNavigation={beginNavigation}
        stopNavigation={stopNavigation}
        route={route}
        directions={directions}
        error={navError}
      />
    </div>
  );
}

export default App;
