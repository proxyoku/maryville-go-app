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

// Haversine formula for calculating distance 
function calculateDistance(startLat, startLng, destLat, destLng) {
  const difLat = (destLat - startLat) * (Math.PI / 180);
  const difLng = (destLng - startLng) * (Math.PI / 180);
  const r = 6371;
  const a =
    Math.sin(difLat / 2) * Math.sin(difLat / 2) +
    Math.cos(toRadians(startLat)) * Math.cos(toRadians(destLat)) *
    Math.sin(difLng / 2) * Math.sin(difLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = r * c;

  return String(distance.toFixed(2)) + 'km';
}
// Function to use the bearing and previous bearing to get directional step
function getDirection(bearing, previousBearing) {
  console.log(previousBearing, bearing);

  if (previousBearing == null) return "Start";

  let diff = bearing - previousBearing;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  if (Math.abs(diff) < 25) return "Continue straight";
  if (diff > 0) return "Turn Right";
  return "Turn Left";
};

// Function that gets and returns directions with km
export function displayDirections(nodes) {
  const steps = [];
  let previousBearing = null;
  for (let i = 0; i < nodes.length - 1; i++) {
    const pathStartLat = nodes[i][0];
    const pathStartLong = nodes[i][1];
    const pathEndLat = nodes[i + 1][0];
    const pathEndLong = nodes[i + 1][1];
    var distance = calculateDistance(pathStartLat, pathStartLong, pathEndLat, pathEndLong);
    const bearing = calculateBearing(pathStartLat, pathStartLong, pathEndLat, pathEndLong);
    const direction = getDirection(bearing, previousBearing);
    previousBearing = bearing;
    steps.push(`${direction} - ${distance}`)
  }
  return steps;
}
