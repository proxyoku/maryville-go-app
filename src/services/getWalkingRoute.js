/**
 * Walking directions via the public OSRM demo (no API key).
 * @see https://github.com/Project-OSRM/osrm-backend/wiki/Api-usage-policy
 *
 * @param {{ lat: number, lng: number }} from
 * @param {{ lat: number, lng: number }} to
 * @returns {Promise<{ coordinates: [number, number][], steps: string[] }>}
 */
const OSRM_BASE = "https://router.project-osrm.org/route/v1/foot";

function formatOsrmStep(step) {
  const { maneuver, name, distance } = step;
  const d =
    distance >= 1000
      ? `${(distance / 1000).toFixed(1)} km`
      : `${Math.round(distance)} m`;
  const street = name ? ` on ${name}` : "";
  const mod = maneuver.modifier || "";

  switch (maneuver.type) {
    case "depart":
      return `Start${street} — ${d}`;
    case "arrive":
      return "Arrive at destination";
    case "turn":
      return `Turn ${mod}${street} — ${d}`;
    case "new name":
    case "continue":
      return `Continue${street} — ${d}`;
    case "end of road":
      return `At end of road, turn ${mod}${street} — ${d}`;
    case "roundabout":
    case "rotary":
      return `Enter roundabout (${mod})${street} — ${d}`;
    case "exit roundabout":
    case "exit rotary":
      return `Exit roundabout${street} — ${d}`;
    default:
      return `${maneuver.type}${street} — ${d}`;
  }
}

export async function getWalkingRoute(from, to) {
  const coordPath = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const params = new URLSearchParams({
    overview: "full",
    geometries: "geojson",
    steps: "true",
  });
  const url = `${OSRM_BASE}/${coordPath}?${params.toString()}`;

  const res = await fetch(url);
  const rawText = await res.text();
  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`Routing failed (${res.status}): invalid JSON response`);
  }

  if (!res.ok || data.code !== "Ok") {
    const detail = data?.message || rawText.slice(0, 240);
    throw new Error(`Routing failed (${res.status}): ${detail}`);
  }

  const route = data?.routes?.[0];
  const line = route?.geometry?.coordinates;
  if (!Array.isArray(line) || line.length < 2) {
    throw new Error("No pedestrian route returned for these points.");
  }

  /** @type {[number, number][]} Leaflet [lat, lng] */
  const coordinates = line.map(([lng, lat]) => [lat, lng]);

  const steps = [];
  for (const leg of route.legs ?? []) {
    for (const step of leg.steps ?? []) {
      steps.push(formatOsrmStep(step));
    }
  }

  return { coordinates, steps };
}
