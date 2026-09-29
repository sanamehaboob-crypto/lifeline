/**
 * Overpass API Service
 * 
 * Fetches real hospital data from OpenStreetMap using the Overpass API.
 * No API key required. Returns hospitals near a given coordinate.
 */

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Common hospital specialties to randomly assign for realism
 * (OSM rarely has specialty data for hospitals)
 */
const SPECIALTY_POOLS = [
  ['General Medicine', 'Surgery', 'Pediatrics', 'Orthopedics'],
  ['Cardiology', 'Neurology', 'Oncology', 'Trauma'],
  ['Internal Medicine', 'ENT', 'Dermatology', 'Obstetrics'],
  ['Cardiology', 'Pulmonology', 'Nephrology', 'Gastroenterology'],
  ['General Medicine', 'Orthopedics', 'Emergency Medicine'],
  ['Neuroscience', 'Cardiology', 'Oncology', 'Urology'],
  ['Pediatrics', 'Obstetrics', 'General Surgery', 'Ophthalmology'],
];

/**
 * Generate realistic simulated availability data.
 * Real-time bed/ICU data isn't publicly available, so we simulate it
 * with consistent values seeded by the OSM node ID.
 */
function generateSimulatedData(osmId) {
  // Use OSM ID as a seed for consistent (but fake) values
  const seed = Math.abs(osmId) % 1000;
  const rng = (min, max) => min + (seed * 7 + min * 13) % (max - min + 1);

  const totalBeds = rng(50, 400);
  const bedsAvailable = Math.max(0, Math.floor(totalBeds * (0.1 + (seed % 50) / 100)));
  const totalIcu = rng(5, 40);
  const icuAvailable = Math.max(0, Math.floor(totalIcu * (0.1 + (seed % 30) / 100)));
  const waitingTime = rng(5, 60);

  const specialtyIndex = seed % SPECIALTY_POOLS.length;
  const specialties = SPECIALTY_POOLS[specialtyIndex];

  return {
    bedsAvailable,
    totalBeds,
    icuAvailable,
    totalIcu,
    waitingTime,
    specialties,
    emergencyServices: seed % 5 !== 0, // 80% have emergency services
  };
}

/**
 * Map raw OSM elements to our hospital schema format.
 */
function mapOSMElements(elements, userLat, userLng) {
  return elements
    .map((el) => {
      // Get coordinates (nodes have lat/lng directly, ways/relations use center)
      const hospitalLat = el.lat || el.center?.lat;
      const hospitalLng = el.lon || el.center?.lon;

      if (!hospitalLat || !hospitalLng) return null;

      const tags = el.tags || {};
      const name = tags.name || tags['name:en'] || null;

      // Skip entries without a name
      if (!name) return null;

      // Build address from available tags
      const addressParts = [
        tags['addr:street'],
        tags['addr:city'] || tags['addr:suburb'],
        tags['addr:state'],
        tags['addr:postcode'],
      ].filter(Boolean);
      const address = addressParts.length > 0
        ? addressParts.join(', ')
        : tags['addr:full'] || `Near ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;

      // Phone number
      const phone = tags.phone || tags['contact:phone'] || '';

      // Generate simulated availability data
      const simulated = generateSimulatedData(el.id);

      return {
        _id: `osm_${el.id}`,
        osmId: el.id,
        name,
        address,
        phone,
        location: {
          lat: hospitalLat,
          lng: hospitalLng,
        },
        ...simulated,
        lastUpdated: new Date(),
        source: 'openstreetmap',
      };
    })
    .filter(Boolean); // Remove nulls
}

/**
 * Fetch hospitals near a given coordinate using the Overpass API.
 * 
 * @param {number} lat - Latitude of the center point
 * @param {number} lng - Longitude of the center point
 * @param {number} radiusMeters - Search radius in meters (default: 10000 = 10km)
 * @returns {Array} Array of hospital objects matching our schema
 */
async function fetchNearbyHospitals(lat, lng, radiusMeters = 10000) {
  // Overpass QL query: find nodes and ways tagged as hospitals
  // Compact format to avoid whitespace issues with some endpoints
  const query = [
    '[out:json][timeout:25];',
    '(',
    `node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});`,
    `way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});`,
    `relation["amenity"="hospital"](around:${radiusMeters},${lat},${lng});`,
    ');',
    'out body center qt;',
  ].join('');

  // Try primary endpoint first, then fallback mirrors
  const endpoints = [
    OVERPASS_API_URL,
    'https://overpass.kumi.systems/api/interpreter',
  ];

  let lastError;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'LifeLine-Healthcare-App/1.0',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.elements || data.elements.length === 0) {
        return [];
      }

      return mapOSMElements(data.elements, lat, lng);
    } catch (err) {
      lastError = err;
      console.warn(`Overpass endpoint ${endpoint} failed:`, err.message);
      continue;
    }
  }

  throw lastError;
}

module.exports = {
  fetchNearbyHospitals,
};
