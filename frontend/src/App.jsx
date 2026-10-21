import { useState, useEffect, useMemo, useCallback } from 'react';
import CrimeMap from './components/map/CrimeMap';
import Sidebar from './components/sidebar/Sidebar';
import McpModal from './components/mcp/McpModal';
import DateBar from './components/datebar/DateBar';
import { incidentsToGeoJSON } from './utils/geojson';
import { fetchIncidents, formatDate } from './api/incidents';

const MAP_STYLES = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
};

export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState('Alla');
  const [selectedType, setSelectedType] = useState('Alla');
  const [dateRange, setDateRange] = useState(() => {
    const today = formatDate(new Date());
    return { startDate: today, endDate: today };
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
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

  // Fetch incidents from backend when date range, county or incident type filter changes
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchIncidents({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          county: selectedCounty === 'Alla' ? null : selectedCounty,
          incidentType: selectedType === 'Alla' ? null : selectedType,
        });
        if (mounted) {
          setIncidents(data);
        }
      } catch (err) {
        console.error('Failed to load incidents:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [dateRange, selectedCounty, selectedType]);

  // Filter incidents based on free text search term
  const filteredIncidents = useMemo(() => {
    if (!searchTerm.trim()) return incidents;
    const query = searchTerm.toLowerCase().trim();
    return incidents.filter((incident) => {
      return (
        incident.name?.toLowerCase().includes(query) ||
        incident.location_name?.toLowerCase().includes(query) ||
        incident.summary?.toLowerCase().includes(query) ||
        incident.type?.toLowerCase().includes(query)
      );
    });
  }, [incidents, searchTerm]);

  // Convert filtered incidents to GeoJSON for MapLibre
  const geojson = useMemo(() => {
    return incidentsToGeoJSON(filteredIncidents);
  }, [filteredIncidents]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleResetFilters = useCallback(() => {
    setSelectedCounty('Alla');
    setSelectedType('Alla');
    const today = formatDate(new Date());
    setDateRange({ startDate: today, endDate: today });
    setSearchTerm('');
  }, []);

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
        selectedCounty={selectedCounty}
        onSelectCounty={setSelectedCounty}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        dateRange={dateRange}
        selectedDate={
          dateRange.startDate === dateRange.endDate
            ? dateRange.startDate
            : `${dateRange.startDate} - ${dateRange.endDate}`
        }
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onResetFilters={handleResetFilters}
        loading={loading}
        theme={theme}
        onToggleTheme={toggleTheme}
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen((prev) => !prev)}
        selectedIncidentId={selectedIncident?.properties?.id}
        onSelectIncident={handleSelectIncidentFromFeed}
        onOpenMcp={() => setMcpModalOpen(true)}
      />

      {/* Floating Bottom Date Navigation Bar */}
      <DateBar
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onChangeRange={setDateRange}
        loading={loading}
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
