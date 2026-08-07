"use client";

import { useMemo, useState } from "react";

import { Button } from "@voyzu/ui-components";
import { DropdownMenu, type DropdownMenuItem } from "@voyzu/ui-components";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function PeriodPresetDropdownPreview() {
  const [selectedValue, setSelectedValue] = useState("this-financial-year");
  const [selectedLabel, setSelectedLabel] = useState("This financial year");

  const items = useMemo<DropdownMenuItem[]>(() => {
    const select = (value: string, label: string) => ({
      value,
      label,
      onSelect: () => {
        setSelectedValue(value);
        setSelectedLabel(label);
      },
    });

    return [
      { ...select("this-financial-year", "This financial year"), icon: "calendar_month" },
      { ...select("last-financial-year", "Last financial year"), icon: "history" },
      { ...select("this-month", "This month"), icon: "today" },
      { ...select("last-month", "Last month"), icon: "event_repeat" },
      {
        value: "periods",
        label: "Periods",
        icon: "date_range",
        children: MONTHS.map((month, index) => {
          const value = `period-${String(index + 1).padStart(2, "0")}`;
          return {
            value,
            label: month,
            onSelect: () => {
              setSelectedValue(value);
              setSelectedLabel(month);
            },
          };
        }),
      },
    ];
  }, []);

  return (
    <DropdownMenu
      trigger={<Button variant="secondary" icon="calendar_today">{selectedLabel}</Button>}
      items={items}
      selectedValue={selectedValue}
      width={240}
    />
  );
}
