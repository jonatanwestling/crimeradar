// Sample police incidents across Sweden for local development/fallback
export const FALLBACK_INCIDENTS = [
  {
    id: 1,
    datetime: '2026-10-14 10:15:00',
    name: '14 oktober 10:15, Stöld, Stockholm',
    summary: 'Anmälan om cykelstöld och inbrott i förråd i centrala Stockholm.',
    type: 'Stöld',
    location_name: 'Stockholm',
    latitude: 59.3293,
    longitude: 18.0686,
    url: '/aktuellt/handelser/stockholm/stold'
  },
  {
    id: 2,
    datetime: '2026-10-14 11:30:00',
    name: '14 oktober 11:30, Trafikolycka, Stockholm',
    summary: 'Två personbilar har kolliderat på E4 i höjd med Kungens kurva.',
    type: 'Trafikolycka',
    location_name: 'Stockholm',
    latitude: 59.2711,
    longitude: 17.9156,
    url: '/aktuellt/handelser/stockholm/trafikolycka'
  },
  {
    id: 3,
    datetime: '2026-10-14 08:45:00',
    name: '14 oktober 08:45, Rån, Göteborg',
    summary: 'Larm om rån mot en närbutik i Majorna. Polis är på plats.',
    type: 'Rån',
    location_name: 'Göteborg',
    latitude: 57.6917,
    longitude: 11.9283,
    url: '/aktuellt/handelser/goteborg/ran'
  },
  {
    id: 4,
    datetime: '2026-10-14 09:20:00',
    name: '14 oktober 09:20, Skadegörelse, Göteborg',
    summary: 'Krossade rutor och klotter rapporterat vid en skola.',
    type: 'Skadegörelse',
    location_name: 'Göteborg',
    latitude: 57.7089,
    longitude: 11.9746,
    url: '/aktuellt/handelser/goteborg/skadegorelse'
  },
  {
    id: 5,
    datetime: '2026-10-14 12:00:00',
    name: '14 oktober 12:00, Misshandel, Malmö',
    summary: 'Bråk mellan flera personer utomhus vid Möllevångstorget.',
    type: 'Misshandel',
    location_name: 'Malmö',
    latitude: 55.5916,
    longitude: 13.0075,
    url: '/aktuellt/handelser/malmo/misshandel'
  },
  {
    id: 6,
    datetime: '2026-10-14 07:10:00',
    name: '14 oktober 07:10, Trafikbrott, Malmö',
    summary: 'Hastighetskontroll genomförd på Inre Ringvägen, flera böter utfärdade.',
    type: 'Trafikbrott',
    location_name: 'Malmö',
    latitude: 55.5780,
    longitude: 13.0420,
    url: '/aktuellt/handelser/malmo/trafikbrott'
  },
  {
    id: 7,
    datetime: '2026-10-14 06:50:00',
    name: '14 oktober 06:50, Inbrott, Uppsala',
    summary: 'Inbrott i villa under natten i Luthagen.',
    type: 'Inbrott',
    location_name: 'Uppsala',
    latitude: 59.8650,
    longitude: 17.6250,
    url: '/aktuellt/handelser/uppsala/inbrott'
  },
  {
    id: 8,
    datetime: '2026-10-14 09:55:00',
    name: '14 oktober 09:55, Brand, Umeå',
    summary: 'Mindre brand i en container i ett industriområde, släckt av räddningstjänst.',
    type: 'Brand',
    location_name: 'Umeå',
    latitude: 63.8258,
    longitude: 20.2630,
    url: '/aktuellt/handelser/umea/brand'
  },
  {
    id: 9,
    datetime: '2026-10-14 10:40:00',
    name: '14 oktober 10:40, Trafikolycka, Sundsvall',
    summary: 'Singelolycka med personbil på E4 södergående.',
    type: 'Trafikolycka',
    location_name: 'Sundsvall',
    latitude: 62.3908,
    longitude: 17.3069,
    url: '/aktuellt/handelser/sundsvall/trafikolycka'
  },
  {
    id: 10,
    datetime: '2026-10-14 04:30:00',
    name: '14 oktober 04:30, Rattfylleri, Kiruna',
    summary: 'Förare misstänkt för grovt rattfylleri stoppad i centrum.',
    type: 'Rattfylleri',
    location_name: 'Kiruna',
    latitude: 67.8558,
    longitude: 20.2253,
    url: '/aktuellt/handelser/kiruna/rattfylleri'
  }
];

const API_BASE_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8000' : '');

/**
 * Fetch incidents from the backend API.
 * Falls back to sample data if backend is unreachable or still in development.
 */
export async function fetchIncidents() {
  try {
    const res = await fetch(`${API_BASE_URL}/incidents/national`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_date: '2026-01-01',
        end_date: '2026-12-31'
      })
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return FALLBACK_INCIDENTS;
  } catch (error) {
    console.warn('Backend API not available, using fallback incident data:', error.message);
    return FALLBACK_INCIDENTS;
  }
}

