import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchStatistics, shiftDate, formatDisplayRange } from '../../api/incidents';
import { buildDailySeries } from '../../utils/statistics';
import DateRangePicker from '../datebar/DateRangePicker';
import './statistics.css';

const number = new Intl.NumberFormat('sv-SE');
const labelDate = (value) => new Date(`${value}T12:00:00Z`).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', timeZone: 'Europe/Stockholm' });

const COLORS = ['#22c55e', '#38bdf8', '#f59e0b', '#f472b6', '#a78bfa', '#fb7185', '#2dd4bf', '#a3e635'];

function DailyPlot({ series }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const days = series[0].days;
  const width = 960, height = 320;
  const left = 56, right = 24, top = 24, bottom = 48;
  const peak = series.reduce((max, item) => item.days.reduce((value, day) => Math.max(value, day.count), max), 1);
  const step = Math.max(1, Math.ceil(peak / 4));
  const max = step * 4;
  const x = (index) => days.length === 1 ? width / 2 : left + index * (width - left - right) / (days.length - 1);
  const y = (count) => height - bottom - count / max * (height - top - bottom);
  const labels = [...new Set([0, Math.floor((days.length - 1) / 2), days.length - 1])];
  const active = activeIndex !== null ? Math.min(activeIndex, days.length - 1) : null;

  function inspect(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = (event.clientX - bounds.left) / bounds.width * width;
    setActiveIndex(Math.max(0, Math.min(days.length - 1, Math.round((pointerX - left) / (width - left - right) * (days.length - 1)))));
  }

  function navigate(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Escape'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Escape') return setActiveIndex(null);
    if (event.key === 'Home') return setActiveIndex(0);
    if (event.key === 'End') return setActiveIndex(days.length - 1);
    setActiveIndex(Math.max(0, Math.min(days.length - 1, (active ?? 0) + (event.key === 'ArrowRight' ? 1 : -1))));
  }

  return (
    <div className="statistics-plot-scroll">
      <div className="statistics-plot-container">
        <svg className="statistics-plot" viewBox={`0 0 ${width} ${height}`} role="group" tabIndex={0}
          aria-label="Händelser per dag. Använd vänster och höger piltangent för att läsa värden."
          onPointerMove={inspect} onPointerDown={inspect} onPointerLeave={() => setActiveIndex(null)}
          onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) setActiveIndex(0); }} onBlur={() => setActiveIndex(null)} onKeyDown={navigate}>
          <desc>Antal lagrade händelser per svensk kalenderdag. Exakta värden finns också i tabellen nedan.</desc>
          {[0, 1, 2, 3, 4].map((tick) => (
            <g key={tick} className="statistics-axis">
              <line x1={left} x2={width - right} y1={y(tick * step)} y2={y(tick * step)} />
              <text x={left - 12} y={y(tick * step) + 4} textAnchor="end">{number.format(tick * step)}</text>
            </g>
          ))}
          {series.map((item) => <g key={item.type}>
            <polyline points={item.days.map((day, index) => `${x(index)},${y(day.count)}`).join(' ')} fill="none" stroke={item.color} strokeWidth="3" strokeLinejoin="round" strokeDasharray={item.dash} />
            {item.days.map((day, index) => <circle key={day.date} cx={x(index)} cy={y(day.count)} r={days.length > 90 ? 2 : 4} fill={item.color} />)}
          </g>)}
          {active !== null && <g aria-hidden="true">
            <line x1={x(active)} x2={x(active)} y1={top} y2={height - bottom} stroke="var(--text-muted)" strokeDasharray="4 4" />
            {series.map((item) => <circle key={item.type} cx={x(active)} cy={y(item.days[active].count)} r="6" fill={item.color} stroke="var(--text-main)" strokeWidth="2" />)}
          </g>}
          {labels.map((index) => <text key={index} className="statistics-axis-label" x={x(index)} y={height - 16} textAnchor="middle">{labelDate(days[index].date)}</text>)}
        </svg>
        {active !== null && <div className="statistics-tooltip" role="status" style={{ left: `${Math.min(68, Math.max(2, x(active) / width * 100))}%` }}>
          <strong>{days[active].date}</strong>
          {series.map((item) => <div key={item.type}><span style={{ color: item.color }}>●</span> {item.type}: <b>{number.format(item.days[active].count)}</b></div>)}
        </div>}
      </div>
    </div>
  );
}

export default function StatisticsPage({ theme, onToggleTheme }) {
  const [range, setRange] = useState(() => {
    const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date());
    return { startDate: shiftDate(today, -29), endDate: today };
  });
  const [draft, setDraft] = useState(range);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const dateAnchor = useRef(null);
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

  const types = useMemo(() => [...new Set([...result.rows.map((row) => row.type), ...selectedTypes])].sort((a, b) => a.localeCompare(b, 'sv')), [result.rows, selectedTypes]);
  const series = useMemo(() => (selectedTypes.length ? selectedTypes : ['']).map((type, index) => ({
    type: type || 'Alla händelsetyper',
    color: COLORS[index % COLORS.length],
    dash: ['', '8 3', '3 3', '10 3 2 3'][index % 4],
    days: buildDailySeries(result.rows, range.startDate, range.endDate, type),
  })), [result.rows, range, selectedTypes]);
  const days = series[0].days.map((day, index) => ({ ...day, count: series.reduce((sum, item) => sum + item.days[index].count, 0) }));
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const peak = days.reduce((best, day) => day.count > best.count ? day : best, days[0]);
  const title = selectedTypes.length ? selectedTypes.join(', ') : 'Alla händelsetyper';
  const invalidRange = !draft.startDate || !draft.endDate || draft.startDate > draft.endDate;

  function load(event) {
    event.preventDefault();
    if (invalidRange) return;
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
          <div className="statistics-date-picker">
            <button type="button" ref={dateAnchor} className="statistics-date-trigger" aria-haspopup="dialog" aria-expanded={isPickerOpen} onClick={() => setIsPickerOpen((open) => !open)}>
              {formatDisplayRange(draft.startDate, draft.endDate)} ▾
            </button>
            {isPickerOpen && <DateRangePicker startDate={draft.startDate} endDate={draft.endDate} onSelectRange={setDraft} onClose={() => setIsPickerOpen(false)} anchorRef={dateAnchor} />}
          </div>
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
            </div>
            <details className="statistics-type-picker">
              <summary>Händelsetyper · {selectedTypes.length ? `${selectedTypes.length} valda` : 'Alla (totalt)'}</summary>
              <fieldset>
                <legend>Välj typer att jämföra</legend>
                <label><input type="checkbox" checked={selectedTypes.length === 0} onChange={() => setSelectedTypes([])} />Alla händelsetyper (totalt)</label>
                {types.map((type) => <label key={type}><input type="checkbox" checked={selectedTypes.includes(type)} onChange={(event) => setSelectedTypes((current) => event.target.checked ? [...current, type] : current.filter((value) => value !== type))} />{type}</label>)}
              </fieldset>
            </details>
            <div className="statistics-legends">{series.map((item) => <span key={item.type}><svg width="24" height="6" aria-hidden="true"><line x1="0" x2="24" y1="3" y2="3" stroke={item.color} strokeWidth="3" strokeDasharray={item.dash} /></svg>{item.type}</span>)}</div>
            <DailyPlot key={JSON.stringify([range, selectedTypes])} series={series} />
          </section>
          <details className="statistics-table"><summary>Visa dagliga värden</summary><div className="statistics-table-scroll"><table><caption>{title} – antal per dag</caption><thead><tr><th scope="col">Datum</th>{series.map((item) => <th scope="col" key={item.type}>{item.type}</th>)}</tr></thead><tbody>{days.map((day, index) => <tr key={day.date}><th scope="row">{day.date}</th>{series.map((item) => <td key={item.type}>{number.format(item.days[index].count)}</td>)}</tr>)}</tbody></table></div></details>
        </>}
        <p className="statistics-note">Statistiken visar händelser som samlats in från Polisen. Dagar utan lagrade händelser visas som 0. Dagens antal är preliminärt.</p>
      </div>
    </main>
  );
}
