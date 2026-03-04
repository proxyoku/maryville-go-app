//(Roles 3 & 4: Search & Routing)

import React from 'react';

export default function NavPanel({ destination, isNavigating, setIsNavigating }) {
  if (!destination) return <div className="nav-panel">Select a destination to start</div>;

  return (
    <div className="nav-panel" style={{ borderTop: '2px solid #ccc', padding: '20px' }}>
      {!isNavigating ? (
        <button 
          className="go-button" 
          onClick={() => setIsNavigating(true)}
          style={{ backgroundColor: 'green', color: 'white', padding: '10px 20px' }}
        >
          GO!
        </button>
      ) : (
        <div className="directions-list">
          <h3>Directions to {destination.name}</h3>
          <ul>
            <li>Step 1: Walk straight for 50m</li>
            <li>Step 2: Turn left at the fountain</li>
          </ul>
          <button onClick={() => setIsNavigating(false)}>Stop Navigation</button>
        </div>
      )}
      <p><small>Role 5 & 6: Navigation prompts & lists</small></p>
    </div>
  );
}