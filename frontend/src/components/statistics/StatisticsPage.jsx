import { useEffect, useMemo, useState } from 'react';
import { fetchStatistics, shiftDate } from '../../api/incidents';
import { buildDailySeries } from '../../utils/statistics';
import './statistics.css';

const number = new Intl.NumberFormat('sv-SE');
const labelDate = (value) => new Date(`${value}T12:00:00Z`).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', timeZone: 'Europe/Stockholm' });

function DailyPlot({ days, title }) {
  const width = 960, height = 320;
  const left = 56, right = 24, top = 24, bottom = 48;
  const peak = Math.max(1, ...days.map((day) => day.count));
  const step = Math.max(1, Math.ceil(peak / 4));
  const max = step * 4;
  const x = (index) => days.length === 1 ? width / 2 : left + index * (width - left - right) / (days.length - 1);
  const y = (count) => height - bottom - count / max * (height - top - bottom);
  const points = days.map((day, index) => `${x(index)},${y(day.count)}`).join(' ');
  const labels = [...new Set([0, Math.floor((days.length - 1) / 2), days.length - 1])];

  return (
    <div className="statistics-plot-scroll">
      <svg className="statistics-plot" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="plot-title plot-description">
        <title id="plot-title">{title} – händelser per dag</title>
        <desc id="plot-description">Antal lagrade händelser per svensk kalenderdag. Exakta värden finns i tabellen nedan.</desc>
        {[0, 1, 2, 3, 4].map((tick) => (
          <g key={tick} className="statistics-axis">
            <line x1={left} x2={width - right} y1={y(tick * step)} y2={y(tick * step)} />
            <text x={left - 12} y={y(tick * step) + 4} textAnchor="end">{number.format(tick * step)}</text>
          </g>
        ))}
        <polyline points={points} fill="none" stroke="var(--radar-green)" strokeWidth="3" strokeLinejoin="round" />
        {days.map((day, index) => (
          <circle key={day.date} cx={x(index)} cy={y(day.count)} r={days.length > 90 ? 2 : 4} fill="var(--radar-green)">
            <title>{day.date}: {number.format(day.count)} händelser</title>
          </circle>
        ))}
        {labels.map((index) => (
          <text key={index} className="statistics-axis-label" x={x(index)} y={height - 16} textAnchor="middle">{labelDate(days[index].date)}</text>
        ))}
      </svg>
    </div>
  );
}

export default function StatisticsPage({ theme, onToggleTheme }) {
  const [range, setRange] = useState(() => {
    const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date());
    return { startDate: shiftDate(today, -29), endDate: today };
  });
  const [draft, setDraft] = useState(range);
  const [selectedType, setSelectedType] = useState('');
  const [result, setResult] = useState({ rows: [], status: 'loading', error: '' });

  useEffect(() => {
    const controller = new AbortController();
    fetchStatistics(range.startDate, range.endDate, controller.signal)
      .then((rows) => {
        if (!controller.signal.aborted) setResult({ rows, status: 'ready', error: '' });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setResult({ rows: [], status: 'error', error: error instanceof TypeError ? 'Kunde inte ansluta till statistik-API:et.' : error.message });
      });
    return () => controller.abort();
  }, [range]);

  const types = useMemo(() => [...new Set(result.rows.map((row) => row.type))].sort((a, b) => a.localeCompare(b, 'sv')), [result.rows]);
  const days = useMemo(() => buildDailySeries(result.rows, range.startDate, range.endDate, selectedType), [result.rows, range, selectedType]);
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const peak = days.reduce((best, day) => day.count > best.count ? day : best, days[0]);
  const title = selectedType || 'Alla händelsetyper';
  const invalidRange = !draft.startDate || !draft.endDate || draft.startDate > draft.endDate;

  function load(event) {
    event.preventDefault();
    if (invalidRange) return;
    setSelectedType('');
    setResult({ rows: [], status: 'loading', error: '' });
    setRange({ ...draft });
  }

  return (
    <main className="statistics-page" data-theme={theme}>
      <div className="statistics-content">
        <nav className="statistics-nav" aria-label="Sidnavigering">
          <a href="#map">← Till kartan</a>
          <span>CRIME RADAR / STATISTIK</span>
          <button onClick={onToggleTheme}>{theme === 'dark' ? 'Ljust läge' : 'Mörkt läge'}</button>
        </nav>
        <header className="statistics-heading">
          <p className="statistics-eyebrow">HÄNDELSER I SVERIGE</p>
          <h1>Statistik över tid</h1>
          <p>Följ antalet polisrapporterade händelser, dag för dag.</p>
        </header>
        <form className="statistics-filters" onSubmit={load}>
          <label>Från<input type="date" required value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} /></label>
          <label>Till<input type="date" required min={draft.startDate} value={draft.endDate} onChange={(event) => setDraft({ ...draft, endDate: event.target.value })} /></label>
          <button className="statistics-primary" disabled={invalidRange || result.status === 'loading'}>Visa statistik</button>
          {invalidRange && <p role="alert">Välj ett slutdatum som är samma dag som eller efter startdatumet.</p>}
        </form>
        {result.status === 'loading' && <p className="statistics-message" role="status">Hämtar statistik…</p>}
        {result.status === 'error' && <p className="statistics-message" role="alert">{result.error} Försök igen med ”Visa statistik”.</p>}
        {result.status === 'ready' && result.rows.length === 0 && <p className="statistics-message" role="status">Inga lagrade händelser under perioden. Välj ett annat datumintervall.</p>}
        {result.status === 'ready' && result.rows.length > 0 && <>
          <section className="statistics-summary" aria-label="Sammanfattning">
            <div><span>Händelser totalt</span><strong>{number.format(total)}</strong></div>
            <div><span>Genomsnitt per dag</span><strong>{number.format(Math.round(total / days.length * 10) / 10)}</strong></div>
            <div><span>Flest på en dag · {labelDate(peak.date)}</span><strong>{number.format(peak.count)}</strong></div>
          </section>
          <section className="statistics-chart-card" aria-labelledby="statistics-chart-heading">
            <div className="statistics-chart-header">
              <div><h2 id="statistics-chart-heading">Händelser per dag</h2><p>{range.startDate} — {range.endDate} · Svensk tid</p></div>
              <label htmlFor="statistics-type">Händelsetyp<select id="statistics-type" aria-label="Händelsetyp" value={selectedType} onChange={(event) => setSelectedType(event.target.value)}><option value="">Alla händelsetyper</option>{types.map((type) => <option key={type}>{type}</option>)}</select></label>
            </div>
            <p className="statistics-legend"><span />{title}</p>
            <DailyPlot days={days} title={title} />
          </section>
          <details className="statistics-table"><summary>Visa dagliga värden</summary><table><caption>{title} – antal per dag</caption><thead><tr><th scope="col">Datum</th><th scope="col">Antal händelser</th></tr></thead><tbody>{days.map((day) => <tr key={day.date}><th scope="row">{day.date}</th><td>{number.format(day.count)}</td></tr>)}</tbody></table></details>
        </>}
        <p className="statistics-note">Statistiken visar händelser som samlats in från Polisen. Dagar utan lagrade händelser visas som 0. Dagens antal är preliminärt.</p>
      </div>
    </main>
  );
}
