/**
 * Pedestrian routing. Primary: BRouter "shortest" (foot) — it tends to use campus
 * footpaths/sidewalks in OSM more than the public OSRM "foot" graph, which can
 * stick to the ring road. Fallback: OSRM foot (no API key).
 *
 * BRouter: https://brouter.de — public instance, fair-use.
 * OSRM: https://github.com/Project-OSRM/osrm-backend/wiki/Api-usage-policy
 */
const BROUTER_BASE = "https://brouter.de/brouter";
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

/**
 * BRouter "messages" rows: see GeoJSON feature properties; row[3] = segment distance (m), row[9] way tags, row[10] node tags.
 */
function describeBrouterSegment(wayTags, nodeTags) {
  const w = (wayTags || "").replace("reversedirection=yes", "").trim();
  const t = `${w} ${nodeTags || ""}`.toLowerCase();

  if (t.includes("highway=steps") || t.includes("highway=steps ")) {
    return "Stairs or steps";
  }
  if (t.includes("footway")) {
    return "Footpath or sidewalk";
  }
  if (w.includes("highway=path")) {
    return "Path";
  }
  if (t.includes("pedestrian")) {
    return "Pedestrian way";
  }
  if (t.includes("steps")) {
    return "Stairs or steps";
  }
  if (t.includes("crossing")) {
    return "Crossing";
  }
  if (
    t.includes("unclassified") ||
    t.includes("residential") ||
    t.includes("service")
  ) {
    return "Campus road or access drive";
  }
  if (
    t.includes("secondary") ||
    t.includes("tertiary") ||
    t.includes("primary")
  ) {
    return "Main road";
  }
  return "Route segment";
}

/**
 * @param {unknown} messages
 * @returns {string[]}
 */
function brouterMessagesToSteps(messages) {
  if (!Array.isArray(messages) || messages.length < 2) {
    return [
      "Follow the red line. Turn-by-turn uses OpenStreetMap path data (footpaths, sidewalks, roads that allow walking).",
    ];
  }
  const steps = [];
  const rows = messages.slice(1);
  let added = 0;
  for (const row of rows) {
    if (!Array.isArray(row) || row.length < 10) continue;
    const dist = parseInt(String(row[3]), 10);
    if (!Number.isFinite(dist) || dist <= 0) continue;
    const wayTags = row[9] != null ? String(row[9]) : "";
    const nodeTags = row[10] != null ? String(row[10]) : "";
    const kind = describeBrouterSegment(wayTags, nodeTags);
    const dText = dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${dist} m`;
    if (added === 0) {
      steps.push(`Start (${kind.toLowerCase()}) — ${dText}`);
    } else {
      steps.push(`${kind} — ${dText}`);
    }
    added += 1;
  }
  steps.push("Arrive at destination");
  return steps;
}

/**
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ coordinates: [number, number][], steps: string[] }>}
 */
async function getBrouterShortestRoute(from, to, signal) {
  const params = new URLSearchParams({
    lonlats: `${from.lng},${from.lat}|${to.lng},${to.lat}`,
    profile: "shortest",
    format: "geojson",
  });
  const url = `${BROUTER_BASE}?${params.toString()}`;

  const res = await fetch(url, { signal });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`BRouter HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("BRouter: invalid JSON");
  }

  const feature = data?.features?.[0];
  const coords = feature?.geometry?.coordinates;
  if (feature?.geometry?.type !== "LineString" || !Array.isArray(coords) || coords.length < 2) {
    throw new Error("BRouter: no route line returned.");
  }

  const messages = feature?.properties?.messages;
  const steps = brouterMessagesToSteps(messages);
  const coordinates = coords.map(([lng, lat]) => [lat, lng]);

  return { coordinates, steps };
}

/**
 * @param {AbortSignal} [signal]
 */
async function getOsrmFootRoute(from, to, signal) {
  const coordPath = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const params = new URLSearchParams({
    overview: "full",
    geometries: "geojson",
    steps: "true",
  });
  const url = `${OSRM_BASE}/${coordPath}?${params.toString()}`;

  const res = await fetch(url, { signal });
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

  const coordinates = line.map(([lng, lat]) => [lat, lng]);

  const steps = [];
  for (const leg of route.legs ?? []) {
    for (const step of leg.steps ?? []) {
      steps.push(formatOsrmStep(step));
    }
  }

  return { coordinates, steps };
}

/**
 * @param {{ lat: number, lng: number }} from
 * @param {{ lat: number, lng: number }} to
 * @returns {Promise<{ coordinates: [number, number][], steps: string[] }>}
 */
export async function getWalkingRoute(from, to) {
  const withTimeout = async (fn) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      return await fn(from, to, controller.signal);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  try {
    return await withTimeout(getBrouterShortestRoute);
  } catch (err) {
    console.warn("BRouter route unavailable, trying OSRM foot.", err);
    return await withTimeout(getOsrmFootRoute);
  }
}
