import React, { useState } from 'react';
import MapView from './components/MapView';
import SearchView from './components/SearchView';
import NavPanel from './components/NavPanel';
import './App.css';

function App() {
  // Global "State" - making sure everyones part can work together
  const [destination, setDestination] = useState(null); // Role 3 sets this
  const [isNavigating, setIsNavigating] = useState(false); // Role 5 toggles this

  return (
    <div className="app-container">
      {/* Role 1 & 2's Territory */}
      <MapView destination={destination} isNavigating={isNavigating} />

      {/* Role 3 & 4's Territory */}
      <SearchView setDestination={setDestination} />

      {/* Role 5 & 6's Territory */}
      <NavPanel 
        destination={destination} 
        isNavigating={isNavigating} 
        setIsNavigating={setIsNavigating} 
      />
    </div>
  );
}

export default App;