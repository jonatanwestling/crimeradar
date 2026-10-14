import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import CrimeMap from './components/map/CrimeMap';
import Sidebar from './components/sidebar/Sidebar';
import { incidentsToGeoJSON } from './utils/geojson';
import { fetchIncidents } from './api/incidents';

const MAP_STYLES = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
};

export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('Alla');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initialize theme from system preference or default to dark
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });

  // Fetch incidents on mount
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      const data = await fetchIncidents();
      if (mounted) {
        setIncidents(data);
        setLoading(false);
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

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Sidebar Controls and Incident Feed */}
      <Sidebar
        incidents={filteredIncidents}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        theme={theme}
        onToggleTheme={toggleTheme}
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main Interactive Map with Clustering */}
      <CrimeMap
        geojson={geojson}
        mapStyle={MAP_STYLES[theme]}
      />
    </div>
  );
}
