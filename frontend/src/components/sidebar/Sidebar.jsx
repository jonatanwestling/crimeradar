import { useMemo } from 'react';
import { SWEDISH_COUNTIES, INCIDENT_TYPES } from '../../api/incidents';

/**
 * Minimalist neutral incident category styling (no blue tint, no heavy glow)
 */
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

export default function Sidebar({
  incidents = [],
  allIncidents = [],
  selectedCounty = 'Alla',
  onSelectCounty,
  selectedType = 'Alla',
  onSelectType,
  searchTerm = '',
  onSearchChange,
  onResetFilters,
  loading = false,
  theme = 'dark',
  onToggleTheme,
  isOpen = true,
  onToggleOpen,
  selectedIncidentId = null,
  onSelectIncident
}) {
  const countyList = useMemo(() => {
    return [
      { id: 'Alla', name: 'Alla län (Hela Sverige)' },
      ...SWEDISH_COUNTIES
    ];
  }, []);

  const incidentTypes = useMemo(() => {
    const set = new Set(INCIDENT_TYPES);
    (allIncidents.length > 0 ? allIncidents : incidents).forEach((i) => {
      if (i.type) set.add(i.type);
    });
    const sorted = Array.from(set).sort((a, b) => a.localeCompare(b, 'sv'));
    return ['Alla typer', ...sorted];
  }, [incidents, allIncidents]);

  const isFiltered =
    (selectedCounty && selectedCounty !== 'Alla') ||
    (selectedType && selectedType !== 'Alla') ||
    Boolean(searchTerm.trim());

  const isDark = theme === 'dark';

  return (
    <>
      {/* Floating launcher when sidebar is collapsed */}
      {!isOpen && (
        <button
          onClick={onToggleOpen}
          aria-label="Öppna händelsepanel"
          className="clean-frosted-launcher"
        >
          <span className="clean-radar-dot" />
          <span>RADAR FEED</span>
          <span
            style={{
              padding: '1px 6px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'var(--mono)',
              background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
              color: 'var(--text-main)'
            }}
          >
            {incidents.length}
          </span>
        </button>
      )}

      {/* Floating Transparent Frosted Sidebar */}
      {isOpen && (
        <aside className="clean-frosted-sidebar">
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--glass-border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/logo.png"
                alt="Crime Radar Sweden"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '6px',
                  objectFit: 'contain',
                  flexShrink: 0,
                  display: 'block'
                }}
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    lineHeight: 1,
                    marginBottom: '3px'
                  }}
                >
                  SWEDEN
                </span>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    lineHeight: 1,
                    letterSpacing: '-0.01em'
                  }}
                >
                  CRIME RADAR
                </h1>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Theme Toggle Button */}
              <button
                onClick={onToggleTheme}
                title={isDark ? 'Växla till ljust läge' : 'Växla till mörkt läge'}
                className="clean-frosted-btn clean-frosted-btn-circle"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  /* Sun Icon */
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  /* Moon Icon */
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              {/* Collapse Button */}
              <button
                onClick={onToggleOpen}
                title="Dölj panel"
                className="clean-frosted-btn clean-frosted-btn-circle"
                aria-label="Collapse panel"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Controls: Search & Filter */}
          <div
            style={{
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Sök plats eller nyckelord..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="clean-frosted-input"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Rensa sökning"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* County Select */}
            <div className="clean-frosted-select-wrapper">
              <select
                value={selectedCounty}
                onChange={(e) => onSelectCounty && onSelectCounty(e.target.value)}
                className="clean-frosted-select"
                aria-label="Filtrera efter län"
              >
                {countyList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>

            {/* Type Select */}
            <div className="clean-frosted-select-wrapper">
              <select
                value={selectedType}
                onChange={(e) => onSelectType && onSelectType(e.target.value)}
                className="clean-frosted-select"
                aria-label="Filtrera efter händelsetyp"
              >
                {incidentTypes.map((t) => (
                  <option key={t} value={t === 'Alla typer' ? 'Alla' : t}>
                    {t}
                  </option>
                ))}
              </select>
              <span
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>

            {/* Counter */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                fontFamily: 'var(--mono)',
                color: 'var(--text-dim)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {loading ? '...' : incidents.length}
                </span>
                <span>{incidents.length === 1 ? 'HÄNDELSE' : 'HÄNDELSER'}</span>
                {loading && (
                  <span
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-dim)',
                      fontStyle: 'italic'
                    }}
                  >
                    (laddar...)
                  </span>
                )}
              </div>
              {isFiltered && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    FILTER AKTIVT
                  </span>
                  {onResetFilters && (
                    <button
                      onClick={onResetFilters}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        padding: '1px 3px',
                        fontSize: '10px',
                        textDecoration: 'underline',
                        fontFamily: 'inherit'
                      }}
                      title="Nollställ alla filter"
                    >
                      Rensa
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Incident Feed List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              borderTop: '1px solid var(--glass-border-subtle)',
              padding: '8px 12px'
            }}
          >
            {loading && incidents.length === 0 ? (
              <div
                style={{
                  padding: '36px 16px',
                  textAlign: 'center',
                  color: 'var(--text-dim)',
                  fontSize: '12px'
                }}
              >
                Hämtar händelser...
              </div>
            ) : incidents.length === 0 ? (
              <div
                style={{
                  padding: '36px 16px',
                  textAlign: 'center',
                  color: 'var(--text-dim)',
                  fontSize: '12px'
                }}
              >
                Inga händelser hittades för valt filter.
              </div>
            ) : (
              incidents.map((incident) => {
                const badgeStyle = getIncidentTypeStyle(incident.type, isDark);
                const isSelected = selectedIncidentId === incident.id;

                return (
                  <div
                    key={incident.id}
                    onClick={() => onSelectIncident && onSelectIncident(incident)}
                    className={`clean-frosted-card ${isSelected ? 'is-active' : ''}`}
                  >
                    {/* Top Row: Type Badge & Time */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px'
                      }}
                    >
                      <span
                        className="clean-badge"
                        style={{
                          backgroundColor: badgeStyle.bg,
                          border: `1px solid ${badgeStyle.border}`,
                          color: badgeStyle.color
                        }}
                      >
                        {incident.type || 'Händelse'}
                      </span>

                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--mono)',
                          color: 'var(--text-dim)'
                        }}
                      >
                        {incident.datetime ? (incident.datetime.match(/[T ](\d{2}:\d{2})/)?.[1] || '') : ''}
                      </span>
                    </div>

                    {/* Headline */}
                    <div
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        marginBottom: '3px',
                        lineHeight: 1.3
                      }}
                    >
                      {incident.name}
                    </div>

                    {/* Summary */}
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {incident.summary}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      )}
    </>
  );
}
