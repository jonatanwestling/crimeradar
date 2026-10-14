import * as React from 'react';
import { useRef } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import { setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
setWorkerUrl(workerUrl);

// 1. Layer Definitions
const clusterLayer = {
  id: 'clusters',
  type: 'circle',
  source: 'crimes',
  filter: ['has', 'point_count'],
  paint: {
    // Color stops based on incident count: < 10 (blue), < 50 (yellow), 50+ (red/pink)
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#51bbd6',
      10,
      '#f1f075',
      50,
      '#f28cb1'
    ],
    // Radius stops based on incident count
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      18,
      10,
      25,
      50,
      35
    ]
  }
};

const clusterCountLayer = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'crimes',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-size': 12
  },
  paint: {
    'text-color': '#000000'
  }
};

const unclusteredPointLayer = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'crimes',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#ff4d4d',
    'circle-radius': 6,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff'
  }
};

// Sample Swedish incident points (Replace with your backend API data or GeoJSON URL)
const sampleCrimeData = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [18.0686, 59.3293] }, properties: { type: 'Stöld' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [18.0710, 59.3320] }, properties: { type: 'Rån' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [18.0650, 59.3280] }, properties: { type: 'Inbrott' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [11.9746, 57.7089] }, properties: { type: 'Trafikbrott' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [11.9680, 57.7050] }, properties: { type: 'Misshandel' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [13.0038, 55.6050] }, properties: { type: 'Skadegörelse' } }
  ]
};

export default function App() {
  const mapRef = useRef(null);

  // 2. Click Handler to expand cluster on click
  const onClick = (event) => {
    const feature = event.features && event.features[0];
    if (!feature) return;

    const clusterId = feature.properties.cluster_id;
    if (clusterId == null) {
      // Clicked on a single incident point
      alert(`Incident: ${feature.properties.type || 'Crime reported'}`);
      return;
    }

    const map = mapRef.current.getMap();
    const source = map.getSource('crimes');

    // Calculate zoom needed to expand this cluster
    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;

      map.easeTo({
        center: feature.geometry.coordinates,
        zoom: zoom,
        duration: 500
      });
    });
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 16.0,
          latitude: 62.0,
          zoom: 4.8
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        interactiveLayerIds={['clusters', 'unclustered-point']}
        onClick={onClick}
        cursor="pointer"
      >
        <Source
          id="crimes"
          type="geojson"
          data={sampleCrimeData} // Can also be a URL string: "http://localhost:8000/api/crimes.geojson"
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>
      </Map>
    </div>
  );
}
