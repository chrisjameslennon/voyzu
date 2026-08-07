"use client";

import { Radio } from "../radio/radio";
import styles from "./radio-group.module.css";

interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name?: string;
}

export function RadioGroup({ options, value, onChange, name }: RadioGroupProps) {
  return (
    <div className={styles.group}>
      {options.map(opt => (
        <label key={opt.value} className={styles.label}>
          <Radio
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            value={opt.value}
            name={name}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
