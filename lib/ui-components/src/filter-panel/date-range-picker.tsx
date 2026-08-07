"use client";

import { useState, useMemo, useEffect, useRef } from "react";

import styles from "./date-range-picker.module.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ── Calendar ── */

interface CalendarProps {
  label: string;
  year: number;
  month: number;
  selectedDate: string;
  onDateClick: (date: string) => void;
  onMonthChange: (diff: number) => void;
  onYearChange: (year: number) => void;
  onMonthSelect: (month: number) => void;
}

function Calendar({
  label, year, month, selectedDate,
  onDateClick, onMonthChange, onYearChange, onMonthSelect,
}: CalendarProps) {
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) setIsMonthOpen(false);
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) setIsYearOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    const currentYear = new Date().getFullYear();
    const yrs: number[] = [];
    for (let y = currentYear - 10; y <= currentYear + 10; y++) yrs.push(y);
    if (!yrs.includes(year)) { yrs.push(year); yrs.sort((a, b) => a - b); }
    return yrs;
  }, [year]);

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const parts = selectedDate.split("-");
    return parseInt(parts[0]) === year && parseInt(parts[1]) - 1 === month && parseInt(parts[2]) === day;
  };

  const handleDayClick = (day: number) => {
    const m = (month + 1).toString().padStart(2, "0");
    const d = day.toString().padStart(2, "0");
    onDateClick(`${year}-${m}-${d}`);
  };

  return (
    <div>
      <div className={styles.calendarLabel}>{label}</div>
      <div className={styles.calendar}>
        {/* Header */}
        <div className={styles.calendarHeader}>
          <button className={styles.calendarNavBtn} onClick={() => onMonthChange(-1)}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
          </button>
          <div className={styles.calendarSelectors}>
            {/* Month dropdown */}
            <div className={styles.selectorWrap} ref={monthRef}>
              <button className={styles.selectorBtn} onClick={() => setIsMonthOpen(!isMonthOpen)}>
                {MONTH_NAMES[month]}
                <span className="material-symbols-outlined">arrow_drop_down</span>
              </button>
              {isMonthOpen && (
                <div className={`${styles.selectorDropdown} ${styles.selectorDropdownMonth}`}>
                  {MONTH_NAMES.map((m, i) => (
                    <button
                      key={i}
                      className={`${styles.selectorOption} ${i === month ? styles.selectorOptionActive : ""}`}
                      onClick={() => { onMonthSelect(i); setIsMonthOpen(false); }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Year dropdown */}
            <div className={styles.selectorWrap} ref={yearRef}>
              <button className={styles.selectorBtn} onClick={() => setIsYearOpen(!isYearOpen)}>
                {year}
                <span className="material-symbols-outlined">arrow_drop_down</span>
              </button>
              {isYearOpen && (
                <div className={`${styles.selectorDropdown} ${styles.selectorDropdownYear}`}>
                  {years.map((y) => (
                    <button
                      key={y}
                      className={`${styles.selectorOption} ${y === year ? styles.selectorOptionActive : ""}`}
                      onClick={() => { onYearChange(y); setIsYearOpen(false); }}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button className={styles.calendarNavBtn} onClick={() => onMonthChange(1)}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
          </button>
        </div>

        {/* Day headers */}
        <div className={styles.dayHeaders}>
          {DAY_LABELS.map((d) => (
            <span key={d} className={styles.dayHeader}>{d}</span>
          ))}
        </div>

        {/* Day grid */}
        <div className={styles.dayGrid}>
          {days.map((day, idx) => (
            <div key={idx} className={styles.dayCell}>
              {day === null ? (
                <span className={styles.dayEmpty} />
              ) : (
                <button
                  className={`${styles.dayBtn} ${isSelected(day) ? styles.dayBtnSelected : ""}`}
                  onClick={() => handleDayClick(day)}
                >
                  {day}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── DateRangePicker ── */

export interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function DateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange }: DateRangePickerProps) {
  const today = new Date();
  const [startMonth, setStartMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [endMonth, setEndMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });

  useEffect(() => {
    if (startDate) {
      const d = new Date(startDate);
      if (!isNaN(d.getTime())) setStartMonth({ year: d.getFullYear(), month: d.getMonth() });
    }
    if (endDate) {
      const d = new Date(endDate);
      if (!isNaN(d.getTime())) setEndMonth({ year: d.getFullYear(), month: d.getMonth() });
    }
  }, []);

  const changeMonth = (type: "start" | "end", diff: number) => {
    const setter = type === "start" ? setStartMonth : setEndMonth;
    setter((prev) => {
      let newM = prev.month + diff;
      let newY = prev.year;
      if (newM > 11) { newM = 0; newY++; }
      if (newM < 0) { newM = 11; newY--; }
      return { month: newM, year: newY };
    });
  };

  const updateView = (target: "start" | "end", field: "month" | "year", value: number) => {
    const setter = target === "start" ? setStartMonth : setEndMonth;
    setter((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.calendarsRow}>
        <div className={styles.calendarCol}>
          <Calendar
            label="Start Date"
            year={startMonth.year}
            month={startMonth.month}
            selectedDate={startDate}
            onDateClick={onStartDateChange}
            onMonthChange={(d) => changeMonth("start", d)}
            onYearChange={(y) => updateView("start", "year", y)}
            onMonthSelect={(m) => updateView("start", "month", m)}
          />
        </div>
        <div className={styles.calendarCol}>
          <Calendar
            label="End Date"
            year={endMonth.year}
            month={endMonth.month}
            selectedDate={endDate}
            onDateClick={onEndDateChange}
            onMonthChange={(d) => changeMonth("end", d)}
            onYearChange={(y) => updateView("end", "year", y)}
            onMonthSelect={(m) => updateView("end", "month", m)}
          />
        </div>
      </div>

      <div className={styles.labelsRow}>
        <div className={`${styles.labelCol} ${styles.labelColStart}`}>
          <div className={styles.labelText}>{formatDate(startDate)}</div>
        </div>
        <div className={styles.labelDash}>-</div>
        <div className={`${styles.labelCol} ${styles.labelColEnd}`}>
          <div className={styles.labelText}>{formatDate(endDate)}</div>
        </div>
      </div>
    </div>
  );
}
