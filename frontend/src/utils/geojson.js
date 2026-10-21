/**
 * Converts a list of incident objects to a GeoJSON FeatureCollection.
 * Handles both string and float coordinates, ensuring valid geometry.
 * Preserves true coordinates without artificial dispersal.
 */
export function incidentsToGeoJSON(incidents = []) {
  const features = (incidents || [])
    .filter((inc) => inc && inc.latitude != null && inc.longitude != null)
    .map((inc) => {
      const lat = typeof inc.latitude === 'string' ? parseFloat(inc.latitude) : inc.latitude;
      const lng = typeof inc.longitude === 'string' ? parseFloat(inc.longitude) : inc.longitude;
      if (isNaN(lat) || isNaN(lng)) return null;

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        properties: {
          id: inc.id,
          datetime: inc.datetime,
          name: inc.name || inc.type,
          summary: inc.summary || '',
          type: inc.type || 'Händelse',
          location_name: inc.location_name || '',
          url: inc.url || '',
          latitude: lat,
          longitude: lng
        }
      };
    })
    .filter(Boolean);

  return {
    type: 'FeatureCollection',
    features
  };
}
