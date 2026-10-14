// Liquid glass luminous cartographic styling for crime incident clusters.
// Uses an intensity scale with bright specular rings and glowing cores.

export const clusterLayer = {
  id: 'clusters',
  type: 'circle',
  source: 'crimes',
  filter: ['has', 'point_count'],
  paint: {
    // Intensity gradient based on incident density with glowing translucency
    'circle-color': [
      'step',
      ['get', 'point_count'],
      'rgba(245, 158, 11, 0.88)',  // Low (< 10): Radiant Amber
      10,
      'rgba(249, 115, 22, 0.92)',  // Medium (10 - 49): Vivid Tangerine
      50,
      'rgba(239, 68, 68, 0.95)'    // High (50+): Crimson
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      16,
      10,
      22,
      50,
      30
    ],
    'circle-stroke-width': 2.5,
    'circle-stroke-color': 'rgba(255, 255, 255, 0.75)'
  }
};

export const clusterCountLayer = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'crimes',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-size': 12,
    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold']
  },
  paint: {
    'text-color': '#ffffff'
  }
};

export const unclusteredPointLayer = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'crimes',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#f43f5e',
    'circle-radius': 6.5,
    'circle-stroke-width': 2.5,
    'circle-stroke-color': '#ffffff'
  }
};
