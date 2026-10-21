import { useState, useEffect, useCallback } from 'react';

const MCP_CONFIG_JSON = JSON.stringify(
  {
    mcpServers: {
      'crime-radar-sweden': {
        command: 'npx',
        args: ['-y', 'mcp-remote', 'https://crimeradar.hb6.se/mcp/sse']
      }
    }
  },
  null,
  2
);

export default function McpModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(MCP_CONFIG_JSON);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = MCP_CONFIG_JSON;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="clean-frosted-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mcp-modal-title"
    >
      <div className="clean-frosted-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="clean-frosted-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" />
                <line x1="9" y1="1" x2="9" y2="4" />
                <line x1="15" y1="1" x2="15" y2="4" />
                <line x1="9" y1="20" x2="9" y2="23" />
                <line x1="15" y1="20" x2="15" y2="23" />
                <line x1="20" y1="9" x2="23" y2="9" />
                <line x1="20" y1="14" x2="23" y2="14" />
                <line x1="1" y1="9" x2="4" y2="9" />
                <line x1="1" y1="14" x2="4" y2="14" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 id="mcp-modal-title" style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                  Model Context Protocol (MCP)
                </h2>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: 'var(--radar-green)'
                  }}
                >
                  LIVE
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Koppla din AI-agent eller språkmodell till live polishändelser
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="clean-frosted-btn clean-frosted-btn-circle"
            title="Stäng fönster (Esc)"
            aria-label="Stäng"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="clean-frosted-modal-body">
          {/* Instructions & Copy Section */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}
            >
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Lägg till i din agents MCP-konfigurationsfil:
              </span>
              <button
                onClick={handleCopy}
                className="clean-frosted-btn"
                style={{
                  fontSize: '11px',
                  padding: '4px 10px',
                  display: 'inline-flex',
                  gap: '5px',
                  alignItems: 'center'
                }}
              >
                {copied ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span style={{ color: '#22c55e' }}>Kopierad!</span>
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Kopiera JSON</span>
                  </>
                )}
              </button>
            </div>

            <pre className="clean-frosted-code-block">
              <code>{MCP_CONFIG_JSON}</code>
            </pre>
          </div>

          {/* Tools summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '16px'
            }}
          >
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'var(--glass-card-bg)',
                border: '1px solid var(--glass-border-subtle)'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text-main)', marginBottom: '3px' }}>
                search_events
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                Sök händelser med plats, typ, datumintervall och fritext.
              </div>
            </div>

            <div
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'var(--glass-card-bg)',
                border: '1px solid var(--glass-border-subtle)'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text-main)', marginBottom: '3px' }}>
                list_incident_types
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                Lista alla unika händelsetyper i databasen.
              </div>
            </div>
          </div>

          {/* Machine-readable links footer */}
          <div
            style={{
              paddingTop: '12px',
              borderTop: '1px solid var(--glass-border-subtle)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              Öppen & gratis • Rate limit: 10 req/min
            </span>

            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { label: 'llms.txt', url: '/llms.txt' },
                { label: 'capabilities.txt', url: '/capabilities.txt' },
                { label: 'robots.txt', url: '/robots.txt' }
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="clean-frosted-btn"
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--mono)',
                    padding: '3px 8px',
                    textDecoration: 'none',
                    borderRadius: '6px'
                  }}
                >
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
