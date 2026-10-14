import { useRef, useState, useCallback, useEffect } from 'react';
import Map, { Source, Layer, Popup, NavigationControl } from 'react-map-gl/maplibre';
import { setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { clusterLayer, clusterCountLayer, unclusteredPointLayer } from './layers';

setWorkerUrl(workerUrl);

const INITIAL_VIEW_STATE = {
  longitude: 16.5,
  latitude: 62.0,
  zoom: 4.8
};

function getIncidentTypeStyle(type, isDark) {
  const t = (type || '').toLowerCase();
  if (t.includes('stöld') || t.includes('rån') || t.includes('inbrott') || t.includes('vapen')) {
    return {
      bg: isDark ? 'rgba(239, 68, 68, 0.14)' : 'rgba(239, 68, 68, 0.1)',
      border: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.25)',
      color: isDark ? '#f87171' : '#dc2626'
    };
  }
  if (t.includes('trafik') || t.includes('olycka')) {
    return {
      bg: isDark ? 'rgba(245, 158, 11, 0.14)' : 'rgba(245, 158, 11, 0.1)',
      border: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.25)',
      color: isDark ? '#fbbf24' : '#d97706'
    };
  }
  if (t.includes('brand')) {
    return {
      bg: isDark ? 'rgba(249, 115, 22, 0.14)' : 'rgba(249, 115, 22, 0.1)',
      border: isDark ? 'rgba(249, 115, 22, 0.3)' : 'rgba(249, 115, 22, 0.25)',
      color: isDark ? '#fb923c' : '#ea580c'
    };
  }
  if (t.includes('misshandel') || t.includes('mord') || t.includes('dråp')) {
    return {
      bg: isDark ? 'rgba(220, 38, 38, 0.14)' : 'rgba(220, 38, 38, 0.1)',
      border: isDark ? 'rgba(220, 38, 38, 0.3)' : 'rgba(220, 38, 38, 0.25)',
      color: isDark ? '#ef4444' : '#b91c1c'
    };
  }
  return {
    bg: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    border: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
    color: isDark ? '#d4d4d8' : '#52525b'
  };
}

export default function CrimeMap({
  geojson,
  mapStyle,
  isDark = true,
  selectedIncident: controlledIncident,
  onSelectIncident,
  totalIncidents = 0
}) {
  const mapRef = useRef(null);
  const [internalIncident, setInternalIncident] = useState(null);
  const [cursor, setCursor] = useState('auto');

  const activeIncident = controlledIncident !== undefined ? controlledIncident : internalIncident;
  const setIncident = useCallback(
    (val) => {
      if (onSelectIncident) {
        onSelectIncident(val);
      } else {
        setInternalIncident(val);
      }
    },
    [onSelectIncident]
  );

  useEffect(() => {
    if (activeIncident?.coordinates && mapRef.current) {
      const map = mapRef.current.getMap ? mapRef.current.getMap() : mapRef.current;
      if (map && map.easeTo) {
        map.easeTo({
          center: activeIncident.coordinates,
          zoom: Math.max(map.getZoom(), 11.5),
          duration: 500
        });
      }
    }
  }, [activeIncident]);

  const onMouseEnter = useCallback(() => setCursor('pointer'), []);
  const onMouseLeave = useCallback(() => setCursor('auto'), []);

  const handleClick = useCallback(
    (event) => {
      const feature = event.features && event.features[0];
      if (!feature) return;

      const clusterId = feature.properties?.cluster_id;

      if (clusterId != null) {
        const map = mapRef.current?.getMap ? mapRef.current.getMap() : mapRef.current;
        if (!map) return;

        const source = map.getSource('crimes');
        if (!source) return;

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({
            center: feature.geometry.coordinates,
            zoom: zoom + 0.5,
            duration: 450
          });
        });
      } else {
        setIncident({
          coordinates: feature.geometry.coordinates,
          properties: feature.properties
        });
      }
    },
    [setIncident]
  );

  const resetView = useCallback(() => {
    const map = mapRef.current?.getMap ? mapRef.current.getMap() : mapRef.current;
    if (map && map.easeTo) {
      map.easeTo({
        center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
        zoom: INITIAL_VIEW_STATE.zoom,
        duration: 650
      });
    }
  }, []);

  const popupStyle = activeIncident ? getIncidentTypeStyle(activeIncident.properties?.type, isDark) : null;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Floating Transparent Frosted HUD */}
      <div className="clean-frosted-hud">
        <span style={{ letterSpacing: '0.04em' }}>SVERIGE</span>
        {totalIncidents > 0 && (
          <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
            {totalIncidents} st
          </span>
        )}
        <button
          onClick={resetView}
          title="Återställ kartvy till Sverige"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px 4px',
            fontSize: '11px',
            fontFamily: 'var(--sans)',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Återställ
        </button>
      </div>

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
        <NavigationControl position="bottom-right" showCompass={false} />

        <Source
          id="crimes"
          type="geojson"
          data={geojson}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={45}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>

        {activeIncident && (
          <Popup
            longitude={activeIncident.coordinates[0]}
            latitude={activeIncident.coordinates[1]}
            anchor="bottom"
            onClose={() => setIncident(null)}
            closeOnClick={false}
            offset={12}
          >
            <div className="clean-frosted-popup-card">
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}
              >
                <span
                  className="clean-badge"
                  style={{
                    backgroundColor: popupStyle?.bg,
                    border: `1px solid ${popupStyle?.border}`,
                    color: popupStyle?.color
                  }}
                >
                  {activeIncident.properties?.type || 'Händelse'}
                </span>

                <button
                  onClick={() => setIncident(null)}
                  className="clean-frosted-btn clean-frosted-btn-circle"
                  style={{ width: '24px', height: '24px' }}
                  title="Stäng"
                  aria-label="Close"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Title & Metadata */}
              <h4
                style={{
                  margin: '0 0 4px',
                  fontSize: '13px',
                  fontWeight: 600,
                  lineHeight: 1.35,
                  color: 'var(--text-main)'
                }}
              >
                {activeIncident.properties?.name}
              </h4>

              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--text-dim)',
                  fontFamily: 'var(--mono)',
                  marginBottom: '8px'
                }}
              >
                {activeIncident.properties?.location_name && (
                  <span>{activeIncident.properties.location_name} • </span>
                )}
                {activeIncident.properties?.datetime}
              </div>

              {/* Summary */}
              {activeIncident.properties?.summary && (
                <p
                  style={{
                    margin: '0 0 10px',
                    fontSize: '12px',
                    lineHeight: 1.45,
                    color: 'var(--text-muted)'
                  }}
                >
                  {activeIncident.properties.summary}
                </p>
              )}

              {/* Polisen.se Link */}
              {activeIncident.properties?.url && (
                <div>
                  <a
                    href={`https://polisen.se${activeIncident.properties.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="clean-frosted-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px'
                    }}
                  >
                    <span>Polisen.se</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
