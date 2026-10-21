import { useState, useEffect, useRef, useMemo } from 'react';
import {
  formatDate,
  shiftDate,
  formatDisplayDate,
  formatDisplayRange
} from '../../api/incidents';

const WEEKDAYS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

export default function DateRangePicker({
  startDate,
  endDate,
  onSelectRange,
  onClose,
  anchorRef
}) {
  const popoverRef = useRef(null);
  const todayStr = useMemo(() => formatDate(new Date()), []);
  const todayDate = useMemo(() => new Date(), []);

  // Current month being viewed in calendar
  const [viewDate, setViewDate] = useState(() => {
    const initial = endDate || startDate || todayStr;
    const [y, m] = initial.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  // Range selection states
  const [pendingStart, setPendingStart] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);

  // Close on Escape or click outside
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    function handleClickOutside(e) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        (!anchorRef || !anchorRef.current || !anchorRef.current.contains(e.target))
      ) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, anchorRef]);

  // Quick range presets
  const presets = useMemo(() => {
    const [curYear, curMonth] = todayStr.split('-');
    const firstOfThisMonth = `${curYear}-${curMonth}-01`;

    return [
      {
        id: 'today',
        label: 'Idag',
        getRange: () => ({ startDate: todayStr, endDate: todayStr })
      },
      {
        id: 'yesterday',
        label: 'Igår',
        getRange: () => {
          const y = shiftDate(todayStr, -1);
          return { startDate: y, endDate: y };
        }
      },
      {
        id: '3days',
        label: '3 dagar',
        getRange: () => ({ startDate: shiftDate(todayStr, -2), endDate: todayStr })
      },
      {
        id: '7days',
        label: '7 dagar',
        getRange: () => ({ startDate: shiftDate(todayStr, -6), endDate: todayStr })
      },
      {
        id: '30days',
        label: '30 dagar',
        getRange: () => ({ startDate: shiftDate(todayStr, -29), endDate: todayStr })
      },
      {
        id: 'month',
        label: 'Denna månad',
        getRange: () => ({ startDate: firstOfThisMonth, endDate: todayStr })
      }
    ];
  }, [todayStr]);

  const handleApplyPreset = (preset) => {
    const range = preset.getRange();
    onSelectRange(range);
    setPendingStart(null);
    setHoveredDate(null);
  };

  // Calendar month navigation
  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isCurrentOrFutureMonth = useMemo(() => {
    return (
      viewDate.getFullYear() > todayDate.getFullYear() ||
      (viewDate.getFullYear() === todayDate.getFullYear() &&
        viewDate.getMonth() >= todayDate.getMonth())
    );
  }, [viewDate, todayDate]);

  const monthLabel = useMemo(() => {
    const raw = viewDate.toLocaleDateString('sv-SE', {
      month: 'long',
      year: 'numeric'
    });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [viewDate]);

  // Days grid generation
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = Monday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Leading days from previous month (disabled/muted)
    for (let i = 0; i < firstDayIndex; i++) {
      const prevDayNum = daysInPrevMonth - firstDayIndex + 1 + i;
      const prevMonthIdx = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(prevDayNum).padStart(2, '0')}`;
      days.push({
        dayNum: prevDayNum,
        dateStr,
        isCurrentMonth: false,
        isFuture: dateStr > todayStr
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        isFuture: dateStr > todayStr
      });
    }

    return days;
  }, [viewDate, todayStr]);

  // Current active range evaluation (including hover/pending preview)
  const previewRange = useMemo(() => {
    if (pendingStart) {
      if (hoveredDate && hoveredDate <= todayStr) {
        return {
          start: pendingStart < hoveredDate ? pendingStart : hoveredDate,
          end: pendingStart < hoveredDate ? hoveredDate : pendingStart
        };
      }
      return { start: pendingStart, end: pendingStart };
    }
    return { start: startDate, end: endDate };
  }, [pendingStart, hoveredDate, startDate, endDate, todayStr]);

  const handleDayClick = (dateStr, isFuture) => {
    if (isFuture) return;

    if (!pendingStart) {
      // First click sets beginning of span
      setPendingStart(dateStr);
    } else {
      // Second click finishes the span
      if (dateStr === pendingStart) {
        onSelectRange({ startDate: dateStr, endDate: dateStr });
      } else {
        const min = dateStr < pendingStart ? dateStr : pendingStart;
        const max = dateStr < pendingStart ? pendingStart : dateStr;
        onSelectRange({ startDate: min, endDate: max });
      }
      setPendingStart(null);
      setHoveredDate(null);
    }
  };

  const handleConfirm = () => {
    if (pendingStart) {
      onSelectRange({ startDate: pendingStart, endDate: pendingStart });
      setPendingStart(null);
    }
    onClose();
  };

  const handleResetToday = () => {
    onSelectRange({ startDate: todayStr, endDate: todayStr });
    setPendingStart(null);
    setHoveredDate(null);
    setViewDate(new Date());
  };

  const isTodayActive = startDate === todayStr && endDate === todayStr;

  return (
    <div
      ref={popoverRef}
      className="clean-frosted-date-picker-popover"
      role="dialog"
      aria-label="Välj datum eller datumintervall"
    >
      {/* Top Header with Month Navigator & Close */}
      <div className="clean-date-picker-header">
        <div className="clean-date-picker-month-nav">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="clean-frosted-btn clean-frosted-btn-circle"
            title="Föregående månad"
            aria-label="Föregående månad"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="clean-date-picker-month-title">{monthLabel}</span>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={isCurrentOrFutureMonth}
            className={`clean-frosted-btn clean-frosted-btn-circle ${
              isCurrentOrFutureMonth ? 'is-disabled' : ''
            }`}
            title={isCurrentOrFutureMonth ? 'Kan inte välja framtida månader' : 'Nästa månad'}
            aria-label="Nästa månad"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="clean-frosted-btn clean-frosted-btn-circle clean-date-picker-close-btn"
          title="Stäng"
          aria-label="Stäng datumväljare"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Quick Interval Presets Bar */}
      <div className="clean-date-presets-bar" role="group" aria-label="Snabbval intervall">
        {presets.map((p) => {
          const r = p.getRange();
          const isActive = !pendingStart && startDate === r.startDate && endDate === r.endDate;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className={`clean-date-preset-pill ${isActive ? 'is-active' : ''}`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Weekday Titles */}
      <div className="clean-calendar-weekdays" aria-hidden="true">
        {WEEKDAYS.map((w) => (
          <div key={w} className="clean-calendar-weekday-cell">
            {w}
          </div>
        ))}
      </div>

      {/* 7-column Calendar Day Grid */}
      <div
        className="clean-calendar-grid"
        role="grid"
        onMouseLeave={() => setHoveredDate(null)}
      >
        {calendarDays.map((cell, idx) => {
          const { dateStr, dayNum, isCurrentMonth, isFuture } = cell;

          const isStart = dateStr === previewRange.start;
          const isEnd = dateStr === previewRange.end;
          const isInRange = dateStr > previewRange.start && dateStr < previewRange.end;
          const isSingle = isStart && isEnd;
          const isToday = dateStr === todayStr;

          // Assemble css classes
          let cellClass = 'clean-calendar-day-btn';
          if (!isCurrentMonth) cellClass += ' is-other-month';
          if (isFuture) cellClass += ' is-future-disabled';
          if (isToday) cellClass += ' is-today';
          if (isSingle) {
            cellClass += ' is-range-single';
          } else {
            if (isStart) cellClass += ' is-range-start';
            if (isEnd) cellClass += ' is-range-end';
            if (isInRange) cellClass += ' is-in-range';
          }

          return (
            <button
              key={`${dateStr}-${idx}`}
              type="button"
              disabled={isFuture}
              onClick={() => handleDayClick(dateStr, isFuture)}
              onMouseEnter={() => {
                if (pendingStart && !isFuture) {
                  setHoveredDate(dateStr);
                }
              }}
              className={cellClass}
              title={
                isFuture
                  ? 'Framtida datum ej tillgängligt'
                  : formatDisplayDate(dateStr)
              }
              aria-label={formatDisplayDate(dateStr)}
            >
              <span className="clean-day-number">{dayNum}</span>
              {isToday && !isStart && !isEnd && (
                <span className="clean-today-dot" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Summary & Controls */}
      <div className="clean-date-picker-footer">
        <div className="clean-date-picker-summary">
          {pendingStart ? (
            <span className="clean-picking-helper">
              Välj slutdatum (eller klicka samma dag för 1 dag)
            </span>
          ) : (
            <span className="clean-selected-range-text">
              {formatDisplayRange(startDate, endDate)}
            </span>
          )}
        </div>

        <div className="clean-date-picker-footer-actions">
          {!isTodayActive && (
            <button
              type="button"
              onClick={handleResetToday}
              className="clean-frosted-btn clean-frosted-pill-btn"
              title="Återställ till Idag"
            >
              Idag
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="clean-date-confirm-btn"
            title="Tillämpa och stäng"
          >
            Klar
          </button>
        </div>
      </div>
    </div>
  );
}