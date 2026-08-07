"use client";

import { useState, useMemo, useEffect, useRef } from "react";

import calStyles from "../filter-panel/date-range-picker.module.css";
import styles from "./date-picker.module.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// ── Locale ───────────────────────────────────────────────────────────────────

function detectMMDD(): boolean {
  try {
    // Use no-arg Intl.DateTimeFormat so the system regional format is used,
    // not navigator.language which reflects the browser UI language (often en-US).
    const parts = new Intl.DateTimeFormat(undefined, { month: "numeric", day: "numeric" })
      .formatToParts(new Date(2000, 2, 15));
    return parts.findIndex((p) => p.type === "month") < parts.findIndex((p) => p.type === "day");
  } catch {
    return false;
  }
}

// ── Formatting helpers ────────────────────────────────────────────────────────

/**
 * YYYY-MM-DD → long-form display, locale-ordered month name.
 * US:     "September 14 2000"
 * Non-US: "14 September 2000"
 */
function formatLong(dateStr: string, isMMDD: boolean): string {
  if (!dateStr) return "";
  const [yr, mo, dy] = dateStr.split("-").map(Number);
  const monthName = new Intl.DateTimeFormat(undefined, { month: "long" }).format(new Date(yr, mo - 1, dy));
  return isMMDD ? `${monthName} ${dy} ${yr}` : `${dy} ${monthName} ${yr}`;
}

/** YYYY-MM-DD → locale display (dd/mm/yyyy or mm/dd/yyyy) */
function toDisplay(dateStr: string, isMMDD: boolean): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return "";
  return isMMDD ? `${m}/${d}/${y}` : `${d}/${m}/${y}`;
}

/** Locale display → YYYY-MM-DD, or null if incomplete/unparseable. */
function fromDisplay(display: string, isMMDD: boolean): string | null {
  const parts = display.split("/");
  if (parts.length !== 3) return null;
  const [a, b, year] = parts;
  if (!a || !b || !year || year.length !== 4) return null;
  const mo = parseInt(isMMDD ? a : b, 10);
  const d = parseInt(isMMDD ? b : a, 10);
  const y = parseInt(year, 10);
  if (isNaN(y) || isNaN(mo) || isNaN(d)) return null;
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Confirm a YYYY-MM-DD string is a real calendar date. */
function isValidDate(dateStr: string): boolean {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/** Check a YYYY-MM-DD year falls within the allowed range. */
function isInYearRange(dateStr: string, minYear: number, maxYear: number): boolean {
  const y = parseInt(dateStr.split("-")[0], 10);
  return y >= minYear && y <= maxYear;
}

/** Expand a 2-digit year using the year range cutoff. */
function expand2DigitYear(twoDigit: string, maxYear: number): string {
  const n = parseInt(twoDigit, 10);
  const cutoff = maxYear % 100;
  return n <= cutoff ? `20${twoDigit}` : `19${twoDigit}`;
}

/**
 * Process raw input text into formatted display value.
 *
 * - Digits: auto-insert slashes after each 2-digit segment.
 * - Slash typed: pad the preceding segment with a leading zero if it's 1 digit,
 *   then advance to the next segment.
 */
function processInput(raw: string, prev: string): string {
  const prevSlashes = (prev.match(/\//g) ?? []).length;
  const rawSlashes = (raw.match(/\//g) ?? []).length;

  if (rawSlashes > prevSlashes) {
    // User typed a slash — find it and handle the preceding segment.
    const lastSlash = raw.lastIndexOf("/");
    const before = raw.slice(0, lastSlash);
    const after = raw.slice(lastSlash + 1).replace(/\D/g, "");
    const segs = before.split("/");
    const lastSeg = segs[segs.length - 1].replace(/\D/g, "").slice(0, 2);

    // Ignore: empty segment before slash, or attempt at a third slash.
    if (lastSeg.length === 0 || segs.length > 2) return prev;

    segs[segs.length - 1] = lastSeg.length === 1 ? `0${lastSeg}` : lastSeg;
    const prefix = segs.join("/");

    if (segs.length === 1) {
      if (!after) return `${prefix}/`;
      if (after.length <= 2) return `${prefix}/${after}`;
      return `${prefix}/${after.slice(0, 2)}/${after.slice(2, 6)}`;
    } else {
      // segs.length === 2: entering the year segment
      if (!after) return `${prefix}/`;
      return `${prefix}/${after.slice(0, 4)}`;
    }
  }

  // Normal digit path: rebuild from digits only.
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

// ── Calendar ──────────────────────────────────────────────────────────────────

interface CalendarProps {
  year: number;
  month: number;
  selectedDate: string;
  minYear: number;
  maxYear: number;
  minDate?: string;
  maxDate?: string;
  onDateClick: (date: string) => void;
  onTodayClick: () => void;
  onMonthChange: (diff: number) => void;
  onYearChange: (year: number) => void;
  onMonthSelect: (month: number) => void;
}

function Calendar({ year, month, selectedDate, minYear, maxYear, minDate, maxDate, onDateClick, onTodayClick, onMonthChange, onYearChange, onMonthSelect }: CalendarProps) {
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const activeMonthRef = useRef<HTMLButtonElement>(null);
  const activeYearRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) setIsMonthOpen(false);
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) setIsYearOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (isMonthOpen && activeMonthRef.current) {
      activeMonthRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [isMonthOpen]);

  useEffect(() => {
    if (isYearOpen && activeYearRef.current) {
      activeYearRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [isYearOpen]);

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const slots: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) slots.push(null);
    for (let i = 1; i <= daysInMonth; i++) slots.push(i);
    while (slots.length < 42) slots.push(null);
    return slots;
  }, [year, month]);

  const years = useMemo(() => {
    const yrs: number[] = [];
    for (let y = minYear; y <= maxYear; y++) yrs.push(y);
    return yrs;
  }, [minYear, maxYear]);

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const [sy, sm, sd] = selectedDate.split("-").map(Number);
    return sy === year && sm - 1 === month && sd === day;
  };

  const isDisabled = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const canGoPrev = () => {
    if (!minDate) return year > minYear || month > 0;
    const [minY, minM] = minDate.split("-").map(Number);
    return year > minY || (year === minY && month > minM - 1);
  };

  const canGoNext = () => {
    if (!maxDate) return year < maxYear || month < 11;
    const [maxY, maxM] = maxDate.split("-").map(Number);
    return year < maxY || (year === maxY && month < maxM - 1);
  };

  const handleDayClick = (day: number) =>
    onDateClick(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);

  return (
    <div className={`${calStyles.calendar} ${styles.popupCalendar}`}>
      <div className={calStyles.calendarHeader}>
        <button type="button" className={calStyles.calendarNavBtn} onClick={() => onMonthChange(-1)} disabled={!canGoPrev()}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
        </button>
        <div className={calStyles.calendarSelectors}>
          <div className={calStyles.selectorWrap} ref={monthRef}>
            <button type="button" className={calStyles.selectorBtn} onClick={() => setIsMonthOpen((o) => !o)}>
              {MONTH_NAMES[month]}
              <span className="material-symbols-outlined">arrow_drop_down</span>
            </button>
            {isMonthOpen && (
              <div className={`${calStyles.selectorDropdown} ${calStyles.selectorDropdownMonth}`}>
                {MONTH_NAMES.map((name, i) => (
                  <button type="button" key={i}
                    ref={i === month ? activeMonthRef : undefined}
                    className={`${calStyles.selectorOption} ${i === month ? calStyles.selectorOptionActive : ""}`}
                    onClick={() => { onMonthSelect(i); setIsMonthOpen(false); }}>
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={calStyles.selectorWrap} ref={yearRef}>
            <button type="button" className={calStyles.selectorBtn} onClick={() => setIsYearOpen((o) => !o)}>
              {year}
              <span className="material-symbols-outlined">arrow_drop_down</span>
            </button>
            {isYearOpen && (
              <div className={`${calStyles.selectorDropdown} ${calStyles.selectorDropdownYear}`}>
                {years.map((y) => (
                  <button type="button" key={y}
                    ref={y === year ? activeYearRef : undefined}
                    className={`${calStyles.selectorOption} ${y === year ? calStyles.selectorOptionActive : ""}`}
                    onClick={() => { onYearChange(y); setIsYearOpen(false); }}>
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button type="button" className={calStyles.calendarNavBtn} onClick={() => onMonthChange(1)} disabled={!canGoNext()}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
        </button>
      </div>

      <div className={calStyles.dayHeaders}>
        {DAY_LABELS.map((d) => <span key={d} className={calStyles.dayHeader}>{d}</span>)}
      </div>

      <div className={calStyles.dayGrid}>
        {days.map((day, idx) => (
          <div key={idx} className={calStyles.dayCell}>
            {day === null ? (
              <span className={calStyles.dayEmpty} />
            ) : (
              <button type="button"
                className={`${calStyles.dayBtn} ${isSelected(day) ? calStyles.dayBtnSelected : isToday(day) ? calStyles.dayBtnToday : ""}`}
                onClick={() => handleDayClick(day)}
                disabled={isDisabled(day)}>
                {day}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className={styles.calendarFooter}>
        <button type="button" className={styles.todayBtn} onClick={onTodayClick}>
          Today
        </button>
      </div>
    </div>
  );
}

// ── DatePicker ────────────────────────────────────────────────────────────────

export interface DatePickerProps {
  value: string;           // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  clearable?: boolean;
  hasError?: boolean;
  preYearOffset?: number;
  postYearOffset?: number;
  minDate?: string;        // YYYY-MM-DD inclusive
  maxDate?: string;        // YYYY-MM-DD inclusive
}

export function DatePicker({ value, onChange, placeholder, clearable = true, hasError = false, preYearOffset = 100, postYearOffset = 10, minDate, maxDate }: DatePickerProps) {
  // Initialise to false (dd/mm/yyyy) to match SSR, then update after mount
  // to avoid hydration mismatch caused by navigator.language being unavailable on the server.
  const [isMMDD, setIsMMDD] = useState(false);
  useEffect(() => { setIsMMDD(detectMMDD()); }, []);
  const placeholderText = placeholder ?? (isMMDD ? "mm/dd/yyyy" : "dd/mm/yyyy");

  const currentYear = new Date().getFullYear();
  const minYear = minDate ? parseInt(minDate.split("-")[0], 10) : currentYear - preYearOffset;
  const maxYear = maxDate ? parseInt(maxDate.split("-")[0], 10) : currentYear + postYearOffset;

  const [displayValue, setDisplayValue] = useState(() => toDisplay(value, isMMDD));
  const [isInvalid, setIsInvalid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      if (y && m) return { year: y, month: m - 1 };
    }
    const t = new Date();
    return { year: t.getFullYear(), month: t.getMonth() };
  });

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync display when external value changes (calendar pick, clear, etc.).
  // Skip sync when invalid — preserves the user's typed text with red border.
  useEffect(() => {
    if (isInvalid) return;
    setDisplayValue(toDisplay(value, isMMDD));
    if (value) {
      const [y, m] = value.split("-").map(Number);
      if (y && m) setView({ year: y, month: m - 1 });
    }
  }, [value, isMMDD, isInvalid]);

  // Close calendar on outside click.
  useEffect(() => {
    if (!isOpen) return;
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = processInput(e.target.value, displayValue);
    setDisplayValue(formatted);
    setIsInvalid(false);
    if (isOpen) setIsOpen(false);

    if (formatted.length === 10) {
      const parsed = fromDisplay(formatted, isMMDD);
      if (parsed && isValidDate(parsed) && isInYearRange(parsed, minYear, maxYear)) {
        onChange(parsed);
        const [y, m] = parsed.split("-").map(Number);
        setView({ year: y, month: m - 1 });
      }
    } else if (formatted.length === 0) {
      onChange("");
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!displayValue) return;

    // Attempt to normalise before validating.
    const segs = displayValue.split("/");

    // Pad single-digit day/month segments.
    if (segs[0]?.length === 1) segs[0] = `0${segs[0]}`;
    if (segs[1]?.length === 1) segs[1] = `0${segs[1]}`;

    // Expand 2-digit year using the year range cutoff.
    if (segs[2]?.length === 2) segs[2] = expand2DigitYear(segs[2], maxYear);

    const normalised = segs.join("/");

    if (normalised.length !== 10) {
      setIsInvalid(true);
      onChange("");
      return;
    }

    const parsed = fromDisplay(normalised, isMMDD);
    if (!parsed || !isValidDate(parsed) || !isInYearRange(parsed, minYear, maxYear) || (minDate && parsed < minDate) || (maxDate && parsed > maxDate)) {
      setIsInvalid(true);
      onChange("");
      return;
    }

    setIsInvalid(false);
    setDisplayValue(normalised);
    if (parsed !== value) onChange(parsed);
  };

  const handleDayClick = (date: string) => {
    onChange(date);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleTodayClick = () => {
    const t = new Date();
    const today = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
    onChange(today);
    setView({ year: t.getFullYear(), month: t.getMonth() });
    setIsInvalid(false);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange("");
    setDisplayValue("");
    setIsInvalid(false);
    setIsOpen(false);
    const t = new Date();
    setView({ year: t.getFullYear(), month: t.getMonth() });
    inputRef.current?.focus();
  };

  const changeMonth = (diff: number) => {
    setView((prev) => {
      let m = prev.month + diff;
      let y = prev.year;
      if (m > 11) { m = 0; y++; }
      if (m < 0) { m = 11; y--; }
      if (y < minYear || y > maxYear) return prev;
      return { month: m, year: y };
    });
  };

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <div className={`${styles.inputWrap} ${(hasError || isInvalid) ? styles.inputWrapError : ""}`}>
        <input
          ref={inputRef}
          type="text"
          inputMode={isFocused ? "numeric" : undefined}
          className={styles.textInput}
          value={isFocused || isInvalid || !value ? displayValue : formatLong(value, isMMDD)}
          onFocus={handleFocus}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder={placeholderText}
          maxLength={isFocused ? 10 : undefined}
        />
        {clearable && (value || isInvalid) && (
          <button type="button" className={styles.clearBtn} onClick={handleClear} tabIndex={-1}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        )}
        <button type="button" className={styles.calendarBtn} onClick={() => setIsOpen((o) => !o)} tabIndex={-1}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_month</span>
        </button>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <Calendar
            year={view.year}
            month={view.month}
            selectedDate={value}
            minYear={minYear}
            maxYear={maxYear}
            minDate={minDate}
            maxDate={maxDate}
            onDateClick={handleDayClick}
            onTodayClick={handleTodayClick}
            onMonthChange={changeMonth}
            onYearChange={(y) => setView((prev) => ({ ...prev, year: y }))}
            onMonthSelect={(m) => setView((prev) => ({ ...prev, month: m }))}
          />
        </div>
      )}
    </div>
  );
}
