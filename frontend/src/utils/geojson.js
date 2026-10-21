/**
 * Converts a list of incident objects to a GeoJSON FeatureCollection.
 * Handles both string and float coordinates, ensuring valid geometry.
 * Disperses overlapping (coincident) coordinates into a neat geometric rosette
 * so all individual incident markers remain visible and clickable when zoomed in.
 */
export function incidentsToGeoJSON(incidents = []) {
  const validIncidents = incidents
    .filter((inc) => inc && inc.latitude != null && inc.longitude != null)
    .map((inc) => {
      const lat = typeof inc.latitude === 'string' ? parseFloat(inc.latitude) : inc.latitude;
      const lng = typeof inc.longitude === 'string' ? parseFloat(inc.longitude) : inc.longitude;
      if (isNaN(lat) || isNaN(lng)) return null;
      return { ...inc, lat, lng };
    })
    .filter(Boolean);

  // Group by base coordinates to detect overlapping pins
  const groups = new Map();
  validIncidents.forEach((inc, index) => {
    const key = `${inc.lat.toFixed(5)},${inc.lng.toFixed(5)}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(index);
  });

  // Calculate dispersed coordinates for overlapping points
  const coords = new Array(validIncidents.length);
  groups.forEach((indices) => {
    const n = indices.length;
    if (n === 1) {
      const idx = indices[0];
      coords[idx] = [validIncidents[idx].lng, validIncidents[idx].lat];
      return;
    }

    const baseLat = validIncidents[indices[0]].lat;
    const baseLng = validIncidents[indices[0]].lng;
    const cosLat = Math.cos((baseLat * Math.PI) / 180);

    // If 2 to 8 points, arrange in a clean circle (~180m radius, clearly distinct at city zoom)
    // If > 8 points, use Fermat spiral / sunflower distribution
    if (n <= 8) {
      const radiusDeg = 0.0016; // ~180 meters
      indices.forEach((idx, i) => {
        const angle = (2 * Math.PI * i) / n;
        const dLat = radiusDeg * Math.sin(angle);
        const dLng = (radiusDeg / Math.max(0.1, cosLat)) * Math.cos(angle);
        coords[idx] = [baseLng + dLng, baseLat + dLat];
      });
    } else {
      const goldenAngle = 2.3999632; // ~137.5 degrees
      const c = 0.00065;
      indices.forEach((idx, i) => {
        const r = c * Math.sqrt(i + 1);
        const angle = i * goldenAngle;
        const dLat = r * Math.sin(angle);
        const dLng = (r / Math.max(0.1, cosLat)) * Math.cos(angle);
        coords[idx] = [baseLng + dLng, baseLat + dLat];
      });
    }
  });

  const features = validIncidents.map((inc, index) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coords[index]
    },
    properties: {
      id: inc.id,
      datetime: inc.datetime,
      name: inc.name || inc.type,
      summary: inc.summary || '',
      type: inc.type || 'Händelse',
      location_name: inc.location_name || '',
      url: inc.url || '',
      original_latitude: inc.lat,
      original_longitude: inc.lng
    }
  }));

  return {
    type: 'FeatureCollection',
    features
  };
}
