//(Roles 3 & 4: Search & Routing)

import React from 'react';

export default function NavPanel({
  destination,
  isNavigating,
  beginNavigation,
  stopNavigation,
  directions,
  error,
}) {
  if (!destination) return <div className="nav-panel">Select a destination to start</div>;

  return (
    <div className="nav-panel" style={{ borderTop: '2px solid #ccc', padding: '20px' }}>
      {!isNavigating ? (
        <button 
          className="go-button" 
          onClick={beginNavigation}
          style={{ color: 'white', padding: '10px 20px' }}
        >
          GO!
        </button>
      ) : (
        <div className="directions-list">
          <h3>Directions to {destination.name}</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <ul>
            {(directions && directions.length > 0) ? (
              directions.slice(0, 12).map((step, idx) => (
                <li key={idx}>{step}</li>
              ))
            ) : (
              <li>Calculating walking route…</li>
            )}
          </ul>
          <button onClick={stopNavigation}>Stop Navigation</button>
        </div>
      )}
    </div>
  );
}