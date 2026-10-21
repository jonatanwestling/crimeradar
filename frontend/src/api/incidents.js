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

export const SWEDISH_COUNTIES = [
  { id: "Blekinge", name: "Blekinge län" },
  { id: "Dalarna", name: "Dalarnas län" },
  { id: "Gotland", name: "Gotlands län" },
  { id: "Gävleborg", name: "Gävleborgs län" },
  { id: "Halland", name: "Hallands län" },
  { id: "Jämtland", name: "Jämtlands län" },
  { id: "Jönköping", name: "Jönköpings län" },
  { id: "Kalmar", name: "Kalmar län" },
  { id: "Kronoberg", name: "Kronobergs län" },
  { id: "Norrbotten", name: "Norrbottens län" },
  { id: "Skåne", name: "Skåne län" },
  { id: "Stockholm", name: "Stockholms län" },
  { id: "Södermanland", name: "Södermanlands län" },
  { id: "Uppsala", name: "Uppsala län" },
  { id: "Värmland", name: "Värmlands län" },
  { id: "Västerbotten", name: "Västerbottens län" },
  { id: "Västernorrland", name: "Västernorrlands län" },
  { id: "Västmanland", name: "Västmanlands län" },
  { id: "Västra Götaland", name: "Västra Götalands län" },
  { id: "Örebro", name: "Örebro län" },
  { id: "Östergötland", name: "Östergötlands län" },
];

export const INCIDENT_TYPES = [
  "Anträffad död",
  "Arbetsplatsolycka",
  "Bedrägeri",
  "Brand",
  "Bråk",
  "Djur",
  "Farligt föremål, misstänkt",
  "Fylleri",
  "Försvunnen person",
  "Hemfridsbrott",
  "Hets mot folkgrupp",
  "Häleri",
  "Inbrott",
  "Information",
  "Knivlagen",
  "Kontroll",
  "Lagen om hundar och katter",
  "Larm Överfall",
  "Luftfartslagen",
  "Missbruk av urkund",
  "Misshandel",
  "Misshandel, grov",
  "Mord/dråp",
  "Mord/dråp, försök",
  "Mordbrand",
  "Motorfordon, anträffat stulet",
  "Motorfordon, stöld",
  "Narkotikabrott",
  "Ofredande/förargelse",
  "Olaga hot",
  "Olaga intrång",
  "Olovlig körning",
  "Ordningslagen",
  "Polisinsats/kommendering",
  "Rattfylleri",
  "Rån",
  "Räddningsinsats",
  "Sammanfattning kväll och natt",
  "Sammanfattning natt",
  "Sexualbrott",
  "Skadegörelse",
  "Skyddslagen",
  "Smällar",
  "Stöld",
  "Stöld, försök",
  "Stöld/inbrott",
  "Trafikbrott",
  "Trafikhinder",
  "Trafikkontroll",
  "Trafikolycka",
  "Trafikolycka, personskada",
  "Trafikolycka, singel",
  "Trafikolycka, smitning från",
  "Trafikolycka, vilt",
  "Utlänningslagen",
  "Vapenlagen",
  "Våld/hot mot tjänsteman",
  "Våldtäkt",
  "Vållande till kroppsskada",
  "Övrigt",
];

const API_BASE_URL =
  import.meta.env?.VITE_API_URL ??
  (import.meta.env?.DEV ? "http://localhost:8000" : "");

/**
 * Filter fallback data offline when backend is not accessible.
 */
function filterFallbackIncidents({
  county,
  incidentType,
  startDate,
  endDate,
}) {
  let list = FALLBACK_INCIDENTS;

  if (startDate && endDate) {
    const s = formatDate(startDate);
    const e = formatDate(endDate);
    const dateFiltered = list.filter((i) => {
      if (!i.datetime) return true;
      const d = i.datetime.slice(0, 10);
      return d >= s && d <= e;
    });
    if (dateFiltered.length > 0) {
      list = dateFiltered;
    }
  }

  if (county && county !== "Alla" && county !== "Alla län") {
    const q = county.toLowerCase().replace(/ län$/i, "").trim();
    list = list.filter((i) =>
      (i.location_name || "").toLowerCase().includes(q)
    );
  }

  if (incidentType && incidentType !== "Alla" && incidentType !== "Alla typer") {
    const q = incidentType.toLowerCase().trim();
    list = list.filter((i) =>
      (i.type || "").toLowerCase().includes(q)
    );
  }

  return list;
}

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
 * Shifts a 'YYYY-MM-DD' date string by offsetDays (+1 for tomorrow, -1 for yesterday).
 *
 * @param {string|Date} dateStr - Input date string or Date object
 * @param {number} [offsetDays=0] - Number of days to offset
 * @returns {string} Formatted 'YYYY-MM-DD'
 */
export function shiftDate(dateStr, offsetDays = 0) {
  const formatted = formatDate(dateStr) || formatDate(new Date());
  const [y, m, d] = formatted.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  target.setDate(target.getDate() + offsetDays);
  return formatDate(target);
}

/**
 * Calculates the number of days between two 'YYYY-MM-DD' dates (inclusive).
 *
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @returns {number} Number of days
 */
export function calculateDaySpan(startDate, endDate) {
  const start = formatDate(startDate) || formatDate(new Date());
  const end = formatDate(endDate) || start;
  const [y1, m1, d1] = start.split("-").map(Number);
  const [y2, m2, d2] = end.split("-").map(Number);
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  const diffTime = date2.getTime() - date1.getTime();
  return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
}

/**
 * Formats a date range ('YYYY-MM-DD' to 'YYYY-MM-DD') into a friendly Swedish label.
 * Single day: "Idag, 21 okt." / "14 okt. 2026"
 * Span: "14 – 21 okt. (8 dgr)" / "28 sep. – 4 okt. (7 dgr)"
 *
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @returns {string} Formatted range label
 */
export function formatDisplayRange(startDate, endDate) {
  const start = formatDate(startDate) || formatDate(new Date());
  const end = formatDate(endDate) || start;

  if (start === end) {
    return formatDisplayDate(start);
  }

  const [y1, m1, d1] = start.split("-").map(Number);
  const [y2, m2, d2] = end.split("-").map(Number);
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  const daySpan = calculateDaySpan(start, end);

  // If in the same year and same month
  if (y1 === y2 && m1 === m2) {
    const monthName = date1.toLocaleDateString("sv-SE", { month: "short" });
    return `${d1}–${d2} ${monthName} (${daySpan} dgr)`;
  }

  // If in the same year, different month
  if (y1 === y2) {
    const m1Name = date1.toLocaleDateString("sv-SE", { month: "short" });
    const m2Name = date2.toLocaleDateString("sv-SE", { month: "short" });
    return `${d1} ${m1Name} – ${d2} ${m2Name} (${daySpan} dgr)`;
  }

  // Different year
  const s1 = date1.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const s2 = date2.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${s1} – ${s2} (${daySpan} dgr)`;
}

/**
 * Formats a 'YYYY-MM-DD' string into a friendly Swedish string:
 * "Idag, 21 okt." / "Igår, 20 okt." / "ons 14 okt. 2026"
 *
 * @param {string|Date} dateStr - Input date
 * @returns {string} Friendly label
 */
export function formatDisplayDate(dateStr) {
  const formatted = formatDate(dateStr) || formatDate(new Date());
  const todayStr = formatDate(new Date());
  const yesterdayStr = shiftDate(todayStr, -1);

  const [y, m, d] = formatted.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);

  if (formatted === todayStr) {
    const dayMonth = dateObj.toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "short",
    });
    return `Idag, ${dayMonth}`;
  }

  if (formatted === yesterdayStr) {
    const dayMonth = dateObj.toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "short",
    });
    return `Igår, ${dayMonth}`;
  }

  return dateObj.toLocaleDateString("sv-SE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
    `[CrimeRadar] Fetching national incidents for: ${formattedStart} -> ${formattedEnd}`,
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

    if (Array.isArray(data)) {
      return data;
    }
    return FALLBACK_INCIDENTS;
  } catch (error) {
    console.warn(
      "Backend API not available, using fallback incident data:",
      error.message,
    );
    return filterFallbackIncidents({
      startDate: formattedStart,
      endDate: formattedEnd,
    });
  }
}

/**
 * Fetch incidents for a specific county from the backend API.
 *
 * @param {string} county - County name (e.g. 'Stockholm', 'Skåne')
 * @param {Date|string} [startDate=new Date()]
 * @param {Date|string} [endDate=startDate]
 * @returns {Promise<Array>} List of incidents
 */
export async function fetchCountyIncidents(
  county,
  startDate = new Date(),
  endDate = startDate,
) {
  const formattedStart = formatDate(startDate) || formatDate(new Date());
  const formattedEnd = formatDate(endDate) || formattedStart;

  console.log(
    `[CrimeRadar] Fetching incidents for county "${county}": ${formattedStart} -> ${formattedEnd}`,
  );

  try {
    const res = await fetch(`${API_BASE_URL}/incidents/county`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        county,
        start_date: formattedStart,
        end_date: formattedEnd,
      }),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    console.log(`[CrimeRadar] /incidents/county response (${data.length} items):`, data);

    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.warn(
      `Backend API /incidents/county not available, using fallback:`,
      error.message,
    );
    return filterFallbackIncidents({
      county,
      startDate: formattedStart,
      endDate: formattedEnd,
    });
  }
}

/**
 * Fetch incidents for a specific incident type nationwide from the backend API.
 *
 * @param {string} incidentType - Incident type (e.g. 'Stöld', 'Trafikolycka')
 * @param {Date|string} [startDate=new Date()]
 * @param {Date|string} [endDate=startDate]
 * @returns {Promise<Array>} List of incidents
 */
export async function fetchIncidentsByType(
  incidentType,
  startDate = new Date(),
  endDate = startDate,
) {
  const formattedStart = formatDate(startDate) || formatDate(new Date());
  const formattedEnd = formatDate(endDate) || formattedStart;

  console.log(
    `[CrimeRadar] Fetching incidents for type "${incidentType}": ${formattedStart} -> ${formattedEnd}`,
  );

  try {
    const res = await fetch(`${API_BASE_URL}/incidents/national/type`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incident_type: incidentType,
        start_date: formattedStart,
        end_date: formattedEnd,
      }),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    console.log(`[CrimeRadar] /incidents/national/type response (${data.length} items):`, data);

    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.warn(
      `Backend API /incidents/national/type not available, using fallback:`,
      error.message,
    );
    return filterFallbackIncidents({
      incidentType,
      startDate: formattedStart,
      endDate: formattedEnd,
    });
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
 * - Options object: fetchIncidents({ startDate, endDate, county, incidentType, type })
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
    const {
      startDate,
      endDate,
      start_date,
      end_date,
      date,
      county,
      incidentType,
      type,
    } = startDateOrOptions;

    const start = startDate || start_date || date || new Date();
    const end = endDate || end_date || start;

    const hasCounty =
      county && county !== "Alla" && county !== "Alla län";
    const selectedType = incidentType || type;
    const hasType =
      selectedType && selectedType !== "Alla" && selectedType !== "Alla typer";

    // If both county and type are selected:
    // Query county endpoint, and filter returned list by type client-side
    if (hasCounty && hasType) {
      const countyData = await fetchCountyIncidents(county, start, end);
      const q = selectedType.toLowerCase();
      return countyData.filter((i) =>
        (i.type || "").toLowerCase().includes(q),
      );
    }

    if (hasCounty) {
      return fetchCountyIncidents(county, start, end);
    }

    if (hasType) {
      return fetchIncidentsByType(selectedType, start, end);
    }

    return fetchIncidentsByDateRange(start, end);
  }

  const startDate = startDateOrOptions || new Date();
  const endDate = maybeEndDate || startDate;
  return fetchIncidentsByDateRange(startDate, endDate);
}
