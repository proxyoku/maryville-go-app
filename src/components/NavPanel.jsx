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
    <div className="nav-panel">
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
          <div className="directions-scroll-area">
            <ul className="apple-style-list">
            {directions === null && !error ? (
              <li className="direction-step">Calculating walking route…</li>
            ) : (directions && directions.length > 0) ? (
              directions.map((step, idx) => {
                // Regex handles both hyphens and em-dashes (—)
                const parts = step.split(/ [—-ー-] /);
                const instruction = parts[0];
                const dist = parts[1];
                return (
                  <li key={idx} className="direction-step">
                    <span className="instruction-text">{instruction}</span>
                    {dist && <span className="distance-badge">{dist}</span>}
                  </li>
                );
              })
            ) : (
              <li className="direction-step">No detailed steps found for this route.</li>
            )}
            </ul>
          </div>
          <button className="stop-button" onClick={stopNavigation}>End Route</button>
        </div>
      )}

    </div>
  );
}