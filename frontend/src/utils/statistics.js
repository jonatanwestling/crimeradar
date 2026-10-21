// UTC arithmetic keeps calendar days consecutive across daylight saving changes.
export function buildDailySeries(rows, startDate, endDate, selectedType = '') {
  const totals = new Map();
  for (const row of rows) {
    if (!selectedType || row.type === selectedType) {
      totals.set(row.date, (totals.get(row.date) || 0) + Number(row.number_of_events));
    }
  }
  const days = [];
  const current = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  while (current <= end) {
    const date = current.toISOString().slice(0, 10);
    days.push({ date, count: totals.get(date) || 0 });
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return days;
}
