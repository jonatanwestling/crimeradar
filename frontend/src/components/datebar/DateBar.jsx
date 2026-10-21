import { useState, useRef, useMemo } from 'react';
import {
  formatDate,
  shiftDate,
  formatDisplayRange,
  calculateDaySpan
} from '../../api/incidents';
import DateRangePicker from './DateRangePicker';

export default function DateBar({
  startDate,
  endDate,
  selectedDate,
  onChangeRange,
  onChangeDate,
  loading = false
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const badgeRef = useRef(null);

  const todayStr = useMemo(() => formatDate(new Date()), []);

  // Standardize start and end dates
  const activeStart = startDate || selectedDate || todayStr;
  const activeEnd = endDate || selectedDate || activeStart;

  const isToday = activeStart === todayStr && activeEnd === todayStr;
  const isAtLatest = activeEnd >= todayStr;

  const spanDays = useMemo(() => {
    return calculateDaySpan(activeStart, activeEnd);
  }, [activeStart, activeEnd]);

  const applyRange = (newStart, newEnd) => {
    if (onChangeRange) {
      onChangeRange({ startDate: newStart, endDate: newEnd });
    } else if (onChangeDate) {
      onChangeDate(newStart);
    }
  };

  // Shift whole span or single day backward
  const handlePrevSpan = () => {
    const newEnd = shiftDate(activeStart, -1);
    const newStart = shiftDate(newEnd, -(spanDays - 1));
    applyRange(newStart, newEnd);
  };

  // Shift whole span or single day forward (clamped to today)
  const handleNextSpan = () => {
    if (isAtLatest) return;

    let nextStart = shiftDate(activeEnd, 1);
    let nextEnd = shiftDate(nextStart, spanDays - 1);

    if (nextEnd > todayStr) {
      nextEnd = todayStr;
      nextStart = shiftDate(todayStr, -(spanDays - 1));
    }

    applyRange(nextStart, nextEnd);
  };

  const handleJumpToToday = () => {
    applyRange(todayStr, todayStr);
    setIsPickerOpen(false);
  };

  const handleTogglePicker = () => {
    setIsPickerOpen((prev) => !prev);
  };

  const handleSelectRange = ({ startDate: s, endDate: e }) => {
    applyRange(s, e);
  };

  const prevTitle =
    spanDays > 1 ? `Föregående ${spanDays} dagar` : 'Föregående dag';
  const nextTitle = isAtLatest
    ? 'Idag är senaste datumet'
    : spanDays > 1
      ? `Nästa ${spanDays} dagar`
      : 'Nästa dag';

  return (
    <>
      <div
        className="clean-frosted-bottom-bar"
        role="toolbar"
        aria-label="Datumnavigering och intervall"
      >
      {/* Previous Span/Day Button */}
      <button
        type="button"
        onClick={handlePrevSpan}
        className="clean-frosted-btn clean-frosted-btn-circle"
        title={prevTitle}
        aria-label={prevTitle}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Date Display Badge & Calendar Trigger */}
      <div
        ref={badgeRef}
        className={`clean-frosted-date-badge ${isPickerOpen ? 'is-active' : ''}`}
        onClick={handleTogglePicker}
        title="Klicka för att välja datum eller datumintervall"
        role="button"
        tabIndex={0}
        aria-expanded={isPickerOpen}
        aria-haspopup="dialog"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTogglePicker();
          }
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ opacity: 0.85, flexShrink: 0 }}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>

        <span className="clean-frosted-date-text">
          {formatDisplayRange(activeStart, activeEnd)}
        </span>

        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{
            opacity: 0.65,
            flexShrink: 0,
            transform: isPickerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Next Span/Day Button */}
      <button
        type="button"
        onClick={handleNextSpan}
        disabled={isAtLatest}
        className={`clean-frosted-btn clean-frosted-btn-circle ${
          isAtLatest ? 'is-disabled' : ''
        }`}
        title={nextTitle}
        aria-label={nextTitle}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Quick Jump to Today if viewing past dates */}
      {!isToday && (
        <button
          type="button"
          onClick={handleJumpToToday}
          className="clean-frosted-btn clean-frosted-pill-btn"
          title="Gå tillbaka till Idag"
        >
          <span>IDAG</span>
        </button>
      )}

      {/* Loading Radar Pulse Indicator */}
      {loading && (
        <span
          className="clean-radar-dot"
          style={{
            width: '6px',
            height: '6px',
            marginLeft: '2px',
            boxShadow: '0 0 8px var(--radar-green)'
          }}
          title="Hämtar händelser..."
        />
      )}

      </div>

      {/* Frosted Glass Date Range Picker Popover (rendered as sibling to prevent nested backdrop-filter bug) */}
      {isPickerOpen && (
        <DateRangePicker
          startDate={activeStart}
          endDate={activeEnd}
          onSelectRange={handleSelectRange}
          onClose={() => setIsPickerOpen(false)}
          anchorRef={badgeRef}
        />
      )}
    </>
  );
}