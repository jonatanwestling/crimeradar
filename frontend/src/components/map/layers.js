// MapLibre layer configurations for crime clustering

export const clusterLayer = {
  id: 'clusters',
  type: 'circle',
  source: 'crimes',
  filter: ['has', 'point_count'],
  paint: {
    // Color stops based on incident count: < 10 (cyan), < 50 (gold), 50+ (crimson)
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#00bcd4', // < 10
      10,
      '#ffb300', // 10 - 49
      50,
      '#e91e63'  // 50+
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      18, // < 10
      10,
      26, // 10 - 49
      50,
      36  // 50+
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff'
  }
};

export const clusterCountLayer = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'crimes',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-size': 13
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
    'circle-color': '#ff3d00',
    'circle-radius': 7,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff'
  }
};

