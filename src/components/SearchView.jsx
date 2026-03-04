//(Roles 5 & 6: "Go!" & Instructions)
import React from 'react';
import SearchBar from './SearchBar';

export default function SearchView({ setDestination }) {
  // SearchView now delegates all input handling to the reusable
  // <SearchBar> component.  setDestination is passed straight through
  // so the parent can react when the user chooses a building.
  return (
      //Role 3 & 4: Search Logic goes here
      //{/* the search bar component renders the input + suggestion dropdown */}
      <SearchBar onSelect={setDestination} />
    //</div>
  );
}