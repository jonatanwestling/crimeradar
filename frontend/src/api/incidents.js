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

const API_BASE_URL = import.meta.env?.VITE_API_URL ?? "";

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
    return [];
  } catch (error) {
    console.error("Failed to fetch national incidents:", error.message);
    return [];
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
    console.error(`Failed to fetch incidents for county "${county}":`, error.message);
    return [];
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
    console.error(`Failed to fetch incidents for type "${incidentType}":`, error.message);
    return [];
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
