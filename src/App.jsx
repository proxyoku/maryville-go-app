import React, { useState } from 'react';
import MapView from './components/MapView';
import SearchView from './components/SearchView';
import NavPanel from './components/NavPanel';
import './App.css';

function App() {
  // Global "State" - making sure everyones part can work together
  const [destination, setDestination] = useState(null); // Role 3 sets this
  const [isNavigating, setIsNavigating] = useState(false); // Role 5 toggles this

  const [route, setRoute] = useState(null);          // Role 4 → stored by Role 5
  const [directions, setDirections] = useState(null); // Role 6 → stored by Role 5

  const fetchRoute = async (destination) => {
    const response = await fetch(`/api/route?dest=${destination}`);
    return await response.json();
  };

  const fetchDirections = async (routeData) => {
    const response = await fetch(`/api/directions`, {
      method: "POST",
      body: JSON.stringify({ route: routeData }),
    });
    return await response.json();
  };

  const startGPSWatcher = () => {
    // This calls Role 2's GPS code
    navigator.geolocation.watchPosition((pos) => {
      console.log("GPS Update:", pos.coords);
    });
  };

   // Called when the user presses "Go!"
  const beginNavigation = () => {
    if (!destination) return; // safety check
    setIsNavigating(true);
    console.log("Navigation started!");

    const routeData = await fetchRoute(destination);
    setRoute(routeData);

    const directionsList = await fetchDirections(routeData);
    setDirections(directionsList);

    startGPSWatcher(); // Role 2
  };

  // Called when the user presses "Stop"
  const stopNavigation = () => {
    setIsNavigating(false);
    console.log("Navigation stopped.");

    setRoute(null);
    setDirections(null);
  };
  
  return (
    <div className="app-container">
      {/* Role 1 & 2's Territory */}
      <MapView destination={destination} isNavigating={isNavigating} route={route}/>

      {/* Role 3 & 4's Territory */}
      <SearchView setDestination={setDestination} />

      {/* Role 5 & 6's Territory */}
      <NavPanel 
        destination={destination} 
        isNavigating={isNavigating} 
        setIsNavigating={setIsNavigating} 

        //Passes function to NavPanel
        beginNavigation={beginNavigation}
        stopNavigation={stopNavigation}
        route={route}
        directions={directions}
      />
    </div>
  );
}

export default App;
