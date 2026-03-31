import React, { useState, useEffect } from 'react';
import { CAMPUS_BUILDINGS } from '../data/buildings';

// Simple search bar component with transparent white background and
// auto‑suggest dropdown.  This is a reusable component so the rest of the
// app can remain clean; the parent just passes an `onSelect` callback that
// receives a building object when the user picks one of the suggested names.

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // whenever the input changes, update the list of matching building names
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const lower = query.toLowerCase();
    const matches = CAMPUS_BUILDINGS
      .map((b) => b.name)
      .filter((name) => name.toLowerCase().includes(lower));

    // limit to 2 recommended items so the dropdown stays within the viewport
    const limited = matches.slice(0, 2);

    // if the current query exactly equals one building name, we don't need
    // to show a dropdown – treat it as "selected" and clear suggestions.
    if (limited.length === 1 && limited[0].toLowerCase() === lower) {
      setSuggestions([]);
    } else {
      setSuggestions(limited);
    }
  }, [query]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSelect = (name) => {
    const building = CAMPUS_BUILDINGS.find((b) => b.name === name);
    if (building) {
      // debug output: log building id when chosen
      console.log('SearchBar selected id:', building.id);
      onSelect(building);
      setQuery(name); // reflect selection in input
      setSuggestions([]); // hide dropdown immediately
    }
  };

  return (
    <div style={{ position: 'relative' /* container for dropdown */ }}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search for a building..."
        style={{
          // bar size
          width: '250px',
          maxWidth: '100%',
          padding: '6px 8px',
          fontSize: '0.9rem',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
      {suggestions.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: '4px 0',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            position: 'absolute',
            width: '100%',
            maxHeight: '150px',
            overflowY: 'auto',
            zIndex: 1000,
            bottom: '100%',
            marginBottom: '1px',
          }}
        >
          {suggestions.map((name, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(name)}
              style={{
                padding: '4px 8px',
                cursor: 'pointer',
                color: '#000',       // Recommendations Text Color
                background: '#fff',  // White Background For Recommendations
              }}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}