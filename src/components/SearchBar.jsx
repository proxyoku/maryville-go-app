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
    <div className="search-bar-container">
      {/* magnifying glass Icon */}
      <svg 
        className="search-icon-svg"
        xmlns="http://www.w3.org/2000/svg" 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="#888" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>

      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search for a building..."
        className='search-bar-input'
      />
      {suggestions.length > 0 && (
        <ul
          className="search-results"
        >
          {suggestions.map((name, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(name)}
              className="result-item"
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}