import { useState, useEffect, useMemo, useCallback } from 'react';
import CrimeMap from './components/map/CrimeMap';
import Sidebar from './components/sidebar/Sidebar';
import McpModal from './components/mcp/McpModal';
import { incidentsToGeoJSON } from './utils/geojson';
import { fetchIncidents } from './api/incidents';

const MAP_STYLES = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
};

export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [selectedType, setSelectedType] = useState('Alla');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [mcpModalOpen, setMcpModalOpen] = useState(false);

  // Initialize theme from system preference or default to dark
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });

  // Keep data-theme in sync with document root for styling
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch incidents on mount
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      const data = await fetchIncidents();
      if (mounted) {
        setIncidents(data);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter incidents based on search term and selected type
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesType =
        selectedType === 'Alla' || incident.type === selectedType;

      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        incident.name?.toLowerCase().includes(query) ||
        incident.location_name?.toLowerCase().includes(query) ||
        incident.summary?.toLowerCase().includes(query);

      return matchesType && matchesSearch;
    });
  }, [incidents, selectedType, searchTerm]);

  // Convert filtered incidents to GeoJSON for MapLibre
  const geojson = useMemo(() => {
    return incidentsToGeoJSON(filteredIncidents);
  }, [filteredIncidents]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSelectIncidentFromFeed = useCallback((incident) => {
    if (!incident) {
      setSelectedIncident(null);
      return;
    }
    setSelectedIncident({
      coordinates: [incident.longitude, incident.latitude],
      properties: incident
    });
  }, []);

  return (
    <div
      data-theme={theme}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: theme === 'dark' ? '#121214' : '#fafafa'
      }}
    >
      {/* Clean Transparent Frosted Sidebar */}
      <Sidebar
        incidents={filteredIncidents}
        allIncidents={incidents}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        theme={theme}
        onToggleTheme={toggleTheme}
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen((prev) => !prev)}
        selectedIncidentId={selectedIncident?.properties?.id}
        onSelectIncident={handleSelectIncidentFromFeed}
        onOpenMcp={() => setMcpModalOpen(true)}
      />

      {/* Main Interactive Map with Liquid Glass Elements */}
      <CrimeMap
        geojson={geojson}
        mapStyle={MAP_STYLES[theme]}
        isDark={theme === 'dark'}
        selectedIncident={selectedIncident}
        onSelectIncident={setSelectedIncident}
        totalIncidents={filteredIncidents.length}
        onOpenMcp={() => setMcpModalOpen(true)}
      />

      {/* Model Context Protocol (MCP) & AI Agent Modal */}
      <McpModal
        isOpen={mcpModalOpen}
        onClose={() => setMcpModalOpen(false)}
      />
    </div>
  );
}
