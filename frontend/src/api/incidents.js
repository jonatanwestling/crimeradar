// Sample police incidents across Sweden for local development/fallback
export const FALLBACK_INCIDENTS = [
  {
    id: 1,
    datetime: "2026-10-14 10:15:00",
    name: "14 oktober 10:15, Stöld, Stockholm",
    summary: "Anmälan om cykelstöld och inbrott i förråd i centrala Stockholm.",
    type: "Stöld",
    location_name: "Stockholm",
    latitude: 59.3293,
    longitude: 18.0686,
    url: "/aktuellt/handelser/stockholm/stold",
  },
  {
    id: 2,
    datetime: "2026-10-14 11:30:00",
    name: "14 oktober 11:30, Trafikolycka, Stockholm",
    summary: "Två personbilar har kolliderat på E4 i höjd med Kungens kurva.",
    type: "Trafikolycka",
    location_name: "Stockholm",
    latitude: 59.2711,
    longitude: 17.9156,
    url: "/aktuellt/handelser/stockholm/trafikolycka",
  },
  {
    id: 3,
    datetime: "2026-10-14 08:45:00",
    name: "14 oktober 08:45, Rån, Göteborg",
    summary: "Larm om rån mot en närbutik i Majorna. Polis är på plats.",
    type: "Rån",
    location_name: "Göteborg",
    latitude: 57.6917,
    longitude: 11.9283,
    url: "/aktuellt/handelser/goteborg/ran",
  },
  {
    id: 4,
    datetime: "2026-10-14 09:20:00",
    name: "14 oktober 09:20, Skadegörelse, Göteborg",
    summary: "Krossade rutor och klotter rapporterat vid en skola.",
    type: "Skadegörelse",
    location_name: "Göteborg",
    latitude: 57.7089,
    longitude: 11.9746,
    url: "/aktuellt/handelser/goteborg/skadegorelse",
  },
  {
    id: 5,
    datetime: "2026-10-14 12:00:00",
    name: "14 oktober 12:00, Misshandel, Malmö",
    summary: "Bråk mellan flera personer utomhus vid Möllevångstorget.",
    type: "Misshandel",
    location_name: "Malmö",
    latitude: 55.5916,
    longitude: 13.0075,
    url: "/aktuellt/handelser/malmo/misshandel",
  },
  {
    id: 6,
    datetime: "2026-10-14 07:10:00",
    name: "14 oktober 07:10, Trafikbrott, Malmö",
    summary:
      "Hastighetskontroll genomförd på Inre Ringvägen, flera böter utfärdade.",
    type: "Trafikbrott",
    location_name: "Malmö",
    latitude: 55.578,
    longitude: 13.042,
    url: "/aktuellt/handelser/malmo/trafikbrott",
  },
  {
    id: 7,
    datetime: "2026-10-14 06:50:00",
    name: "14 oktober 06:50, Inbrott, Uppsala",
    summary: "Inbrott i villa under natten i Luthagen.",
    type: "Inbrott",
    location_name: "Uppsala",
    latitude: 59.865,
    longitude: 17.625,
    url: "/aktuellt/handelser/uppsala/inbrott",
  },
  {
    id: 8,
    datetime: "2026-10-14 09:55:00",
    name: "14 oktober 09:55, Brand, Umeå",
    summary:
      "Mindre brand i en container i ett industriområde, släckt av räddningstjänst.",
    type: "Brand",
    location_name: "Umeå",
    latitude: 63.8258,
    longitude: 20.263,
    url: "/aktuellt/handelser/umea/brand",
  },
  {
    id: 9,
    datetime: "2026-10-14 10:40:00",
    name: "14 oktober 10:40, Trafikolycka, Sundsvall",
    summary: "Singelolycka med personbil på E4 södergående.",
    type: "Trafikolycka",
    location_name: "Sundsvall",
    latitude: 62.3908,
    longitude: 17.3069,
    url: "/aktuellt/handelser/sundsvall/trafikolycka",
  },
  {
    id: 10,
    datetime: "2026-10-14 04:30:00",
    name: "14 oktober 04:30, Rattfylleri, Kiruna",
    summary: "Förare misstänkt för grovt rattfylleri stoppad i centrum.",
    type: "Rattfylleri",
    location_name: "Kiruna",
    latitude: 67.8558,
    longitude: 20.2253,
    url: "/aktuellt/handelser/kiruna/rattfylleri",
  },
];

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:8000" : "");

/**
 * Formats a Date object or date string into 'YYYY-MM-DD' (local calendar date).
 *
 * @param {Date|string} [date=new Date()]
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export function formatDate(date = new Date()) {
  if (!date) return "";
  if (typeof date === "string") {
    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return date;
    }
    date = parsed;
  }
  if (date instanceof Date && !isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return "";
}

/**
 * Fetch incidents for a specific date range from the backend API.
 * Falls back to sample data if backend is unreachable or still in development.
 *
 * @param {Date|string} startDate - Start of date range (YYYY-MM-DD or Date object)
 * @param {Date|string} [endDate] - End of date range (defaults to startDate)
 * @returns {Promise<Array>} List of incidents
 */
export async function fetchIncidentsByDateRange(
  startDate,
  endDate = startDate,
) {
  const formattedStart = formatDate(startDate) || formatDate(new Date());
  const formattedEnd = formatDate(endDate) || formattedStart;

  console.log(
    `[CrimeRadar] Fetching incidents for: ${formattedStart} -> ${formattedEnd}`,
  );

  try {
    const res = await fetch(`${API_BASE_URL}/incidents/national`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start_date: formattedStart,
        end_date: formattedEnd,
      }),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    console.log("[CrimeRadar] API response data:", data);

    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return FALLBACK_INCIDENTS;
  } catch (error) {
    console.warn(
      "Backend API not available, using fallback incident data:",
      error.message,
    );
    return FALLBACK_INCIDENTS;
  }
}

/**
 * Fetch incidents for a single specific date.
 *
 * @param {Date|string} [date=new Date()] - Specific date to query (defaults to today)
 * @returns {Promise<Array>} List of incidents
 */
export async function fetchIncidentsForDate(date = new Date()) {
  return fetchIncidentsByDateRange(date, date);
}

/**
 * Fetch incidents for today only.
 *
 * @returns {Promise<Array>} List of incidents
 */
export async function fetchTodayIncidents() {
  return fetchIncidentsForDate(new Date());
}

/**
 * Dynamic incident fetching function.
 * Supports:
 * - No arguments: fetches today's incidents (fetchIncidents())
 * - Single date: fetches for that specific date (fetchIncidents('2026-10-14') or fetchIncidents(new Date()))
 * - Date range: fetches between start and end (fetchIncidents('2026-10-01', '2026-10-14'))
 * - Options object: fetchIncidents({ startDate, endDate }) or fetchIncidents({ date })
 *
 * @param {Date|string|Object} [startDateOrOptions=new Date()] - Single date, start date, or options object
 * @param {Date|string} [maybeEndDate] - Optional end date if first arg is start date
 * @returns {Promise<Array>} List of incidents
 */
export async function fetchIncidents(
  startDateOrOptions = new Date(),
  maybeEndDate,
) {
  if (
    startDateOrOptions &&
    typeof startDateOrOptions === "object" &&
    !(startDateOrOptions instanceof Date)
  ) {
    const { startDate, endDate, start_date, end_date, date } =
      startDateOrOptions;
    const start = startDate || start_date || date || new Date();
    const end = endDate || end_date || start;
    return fetchIncidentsByDateRange(start, end);
  }

  const startDate = startDateOrOptions || new Date();
  const endDate = maybeEndDate || startDate;
  return fetchIncidentsByDateRange(startDate, endDate);
}
