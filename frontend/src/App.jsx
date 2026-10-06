import * as React from 'react';
import Map from 'react-map-gl/maplibre';
import { setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Vite worker bundle configuration
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
setWorkerUrl(workerUrl);

export default function App() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Map
        initialViewState={{
          longitude: 20.2597, 
          latitude: 63.8284,
          zoom: 4.8
        }}
        style={{ width: '100%', height: '100%' }}
        // Free CARTO Positron basemap
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      />
    </div>
  );
}