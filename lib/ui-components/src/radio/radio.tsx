"use client";

import type React from "react";
import styles from "./radio.module.css";

type RadioProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export function Radio({ ...rest }: RadioProps) {
  return <input type="radio" className={styles.radio} {...rest} />;
}
