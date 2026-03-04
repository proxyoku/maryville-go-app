//(Roles 1 & 2: The Map & GPS)

export default function MapView({ destination, isNavigating }) {
  return (
    <div style={{ height: '70vh', background: '#e0e0e0' }}>
      <h2>Map Layer (Roles 1 & 2)</h2>
      {destination && <p>Heading to: {destination.name}</p>}
    </div>
  );
}