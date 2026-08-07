"use client";

import styles from "./toggle-switch.module.css";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleSwitch({ checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`${styles.track} ${checked ? styles.trackOn : ""}`}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span className={`${styles.knob} ${checked ? styles.knobOn : ""}`} />
    </button>
  );
}
