//(Roles 5 & 6: "Go!" & Instructions)
import React from 'react';
import SearchBar from './SearchBar';

export default function SearchView({ setDestination }) {
  // SearchView now delegates all input handling to the reusable
  // <SearchBar> component.  setDestination is passed straight through
  // so the parent can react when the user chooses a building.

  // Degrees -> Radians
  function toRadians(degrees) {
    return degrees * Math.PI / 180;
  };

  // Radians -> Degrees
  function toDegrees(radians) {
    return radians * 180 / Math.PI;
  };


  // Function to Calculate the Bearing
  function calculateBearing(startLat, startLng, destLat, destLng) {

    startLat = toRadians(startLat);
    startLng = toRadians(startLng);
    destLat = toRadians(destLat);
    destLng = toRadians(destLng);

    //Spherical Trigonometry Forumla for Compass Direction
    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x = Math.cos(startLat) * Math.sin(destLat) -
      Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);

    //Gets the Bearing
    let bearing = Math.atan2(y, x);
    bearing = toDegrees(bearing);

    //Ensures the Bearing is Between 0-359.99 Degrees
    return (bearing + 360) % 360;
  };

  // Function to use the Bearing to get directional Step
  function getDirection(bearing) {
    if (bearing > 0 && bearing < 180) {
      return "Turn Right";
    } else if (bearing > 180 && bearing < 360) {
      return "Turn Left";
    } else if (bearing == 180 || bearing == 0) {
      return "Go straight";
    }
  };

  // Temporary Values for Testing
  const pathStartLat = 10;
  const pathStartLong = 5;

  const pathEndLat = 25;
  const pathEndLong = 20;

  const bearing = calculateBearing(pathStartLat, pathStartLong, pathEndLat, pathEndLong);
  const direction = getDirection(bearing);

  // Output
  console.log(direction);

  return (
    //Role 3 & 4: Search Logic goes here
    //{/* the search bar component renders the input + suggestion dropdown */}
    <SearchBar onSelect={setDestination} />
    //</div>
  );
}
