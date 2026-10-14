import * as React from 'react';
import { useMemo } from 'react';

export default function Sidebar({
  incidents,
  selectedType,
  onSelectType,
  searchTerm,
  onSearchChange,
  theme,
  onToggleTheme,
  isOpen,
  onToggleOpen,
  onSelectIncident
}) {
  // Extract unique incident types for the filter dropdown
  const incidentTypes = useMemo(() => {
    const set = new Set(incidents.map((i) => i.type).filter(Boolean));
    return ['Alla', ...Array.from(set).sort()];
  }, [incidents]);

  const isDark = theme === 'dark';

  return (
    <>
      {/* Toggle button when closed */}
      {!isOpen && (
        <button
          onClick={onToggleOpen}
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
            background: isDark ? 'rgba(24, 26, 32, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            color: isDark ? '#f3f4f6' : '#111827',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            padding: '10px 14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🚨</span> Crime Radar
        </button>
      )}

      {/* Main Sidebar Panel */}
      <aside
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          bottom: 16,
          width: '320px',
          maxWidth: 'calc(100vw - 32px)',
          zIndex: 10,
          background: isDark ? 'rgba(20, 22, 28, 0.92)' : 'rgba(255, 255, 255, 0.95)',
          color: isDark ? '#e5e7eb' : '#1f2937',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(16px)',
          borderRadius: '14px',
          boxShadow: isDark
            ? '0 12px 32px rgba(0, 0, 0, 0.5)'
            : '0 12px 32px rgba(0, 0, 0, 0.12)',
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.25s ease'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#ff5252', fontWeight: 700 }}>
              Live Monitor
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: isDark ? '#fff' : '#111' }}>
              Crime Radar Sweden
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={onToggleTheme}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              style={{
                background: isDark ? '#2e303a' : '#f0f0f4',
                color: isDark ? '#fff' : '#111',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={onToggleOpen}
              title="Close panel"
              style={{
                background: 'transparent',
                color: isDark ? '#9ca3af' : '#6b7280',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#9ca3af' : '#6b7280', display: 'block', marginBottom: '4px' }}>
              SÖK PLATS / HÄNDELSE
            </label>
            <input
              type="text"
              placeholder="T.ex. Stockholm, Rån..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px 10px',
                fontSize: '13px',
                borderRadius: '6px',
                border: isDark ? '1px solid #374151' : '1px solid #d1d5db',
                background: isDark ? '#111827' : '#f9fafb',
                color: isDark ? '#fff' : '#000',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#9ca3af' : '#6b7280', display: 'block', marginBottom: '4px' }}>
              HÄNDELSETYP
            </label>
            <select
              value={selectedType}
              onChange={(e) => onSelectType(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px 10px',
                fontSize: '13px',
                borderRadius: '6px',
                border: isDark ? '1px solid #374151' : '1px solid #d1d5db',
                background: isDark ? '#111827' : '#f9fafb',
                color: isDark ? '#fff' : '#000',
                cursor: 'pointer'
              }}
            >
              {incidentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280', marginTop: '2px' }}>
            Visar <strong>{incidents.length}</strong> händelser
          </div>
        </div>

        {/* Incident List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
          padding: '8px 12px'
        }}>
          {incidents.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#888', fontSize: '13px' }}>
              Inga händelser matchade filtret.
            </div>
          ) : (
            incidents.map((incident) => (
              <div
                key={incident.id}
                onClick={() => onSelectIncident && onSelectIncident(incident)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  marginBottom: '6px',
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.04)',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff5252' }}>
                    {incident.type}
                  </span>
                  <span style={{ fontSize: '10px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                    {incident.location_name}
                  </span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#f3f4f6' : '#1f2937', marginBottom: '4px' }}>
                  {incident.name}
                </div>
                <div style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {incident.summary}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}

