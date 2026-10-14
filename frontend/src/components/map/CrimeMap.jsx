import * as React from 'react';
import { useRef, useState, useCallback } from 'react';
import Map, { Source, Layer, Popup } from 'react-map-gl/maplibre';
import { setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { clusterLayer, clusterCountLayer, unclusteredPointLayer } from './layers';

setWorkerUrl(workerUrl);

// Centered on Sweden with an overview zoom
const INITIAL_VIEW_STATE = {
  longitude: 16.5,
  latitude: 62.0,
  zoom: 4.8
};

export default function CrimeMap({ geojson, mapStyle, onSelectIncident }) {
  const mapRef = useRef(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [cursor, setCursor] = useState('auto');

  const onMouseEnter = useCallback(() => setCursor('pointer'), []);
  const onMouseLeave = useCallback(() => setCursor('auto'), []);

  const handleClick = useCallback((event) => {
    const feature = event.features && event.features[0];
    if (!feature) return;

    const clusterId = feature.properties.cluster_id;

    if (clusterId != null) {
      // Clicked on a cluster -> smooth zoom in
      const map = mapRef.current?.getMap();
      if (!map) return;

      const source = map.getSource('crimes');
      if (!source) return;

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        map.easeTo({
          center: feature.geometry.coordinates,
          zoom: zoom,
          duration: 500
        });
      });
    } else {
      // Clicked on an individual point
      const incidentData = {
        coordinates: feature.geometry.coordinates,
        properties: feature.properties
      };
      setSelectedIncident(incidentData);
      if (onSelectIncident) {
        onSelectIncident(feature.properties);
      }
    }
  }, [onSelectIncident]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        interactiveLayerIds={['clusters', 'unclustered-point']}
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        cursor={cursor}
      >
        <Source
          id="crimes"
          type="geojson"
          data={geojson}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>

        {selectedIncident && (
          <Popup
            longitude={selectedIncident.coordinates[0]}
            latitude={selectedIncident.coordinates[1]}
            anchor="bottom"
            onClose={() => setSelectedIncident(null)}
            closeOnClick={false}
            offset={14}
          >
            <div style={{
              maxWidth: '260px',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '13px',
              lineHeight: 1.4,
              color: '#1a1a1a'
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#e53935',
                textTransform: 'uppercase',
                marginBottom: '4px'
              }}>
                {selectedIncident.properties.type}
              </div>
              <strong style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                {selectedIncident.properties.name}
              </strong>
              {selectedIncident.properties.location_name && (
                <div style={{ fontSize: '12px', color: '#555', marginBottom: '6px' }}>
                  📍 {selectedIncident.properties.location_name}
                </div>
              )}
              {selectedIncident.properties.datetime && (
                <div style={{ fontSize: '11px', color: '#777', marginBottom: '6px' }}>
                  🕒 {selectedIncident.properties.datetime}
                </div>
              )}
              <p style={{ margin: '6px 0', fontSize: '12px', color: '#333' }}>
                {selectedIncident.properties.summary}
              </p>
              {selectedIncident.properties.url && (
                <a
                  href={`https://polisen.se${selectedIncident.properties.url}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: '6px',
                    color: '#0288d1',
                    fontSize: '12px',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  Läs mer på Polisen.se →
                </a>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

