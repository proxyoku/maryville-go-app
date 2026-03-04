//(Roles 5 & 6: "Go!" & Instructions)
import React from 'react';

export default function SearchView({ setDestination }) {
  // Temporary mock data for testing
  const handleSearch = () => {
    setDestination({ name: "Library", lat: 34.05, lng: -118.24 });
    console.log("Destination set to Library");
  };

  return (
    <div className="search-container" style={{ padding: '10px', background: '#f4f4f4' }}>
      <input type="text" placeholder="Search for a building..." />
      <button onClick={handleSearch}>Select Library</button>
      <p><small>Role 3 & 4: Search Logic goes here</small></p>
    </div>
  );
}