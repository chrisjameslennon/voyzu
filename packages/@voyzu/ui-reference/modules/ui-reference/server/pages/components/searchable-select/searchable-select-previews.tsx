"use client";
import { useState } from "react";
import { SearchableSelect } from "@voyzu/ui-components";

const COUNTRIES = [
  { value: "au", label: "Australia" },
  { value: "ca", label: "Canada" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "in", label: "India" },
  { value: "jp", label: "Japan" },
  { value: "nz", label: "New Zealand" },
  { value: "sg", label: "Singapore" },
  { value: "za", label: "South Africa" },
  { value: "gb", label: "United Kingdom" },
  { value: "us", label: "United States" },
];

const CURRENCIES = [
  { value: "NZD", label: "NZD — New Zealand Dollar" },
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "JPY", label: "JPY — Japanese Yen" },
];

const COA_ACCOUNTS = [
  { value: "1000", label: "Cash at Bank", code: "1000" },
  { value: "1100", label: "Accounts Receivable", code: "1100" },
  { value: "1200", label: "Inventory", code: "1200" },
  { value: "2000", label: "Accounts Payable", code: "2000" },
  { value: "3000", label: "Share Capital", code: "3000" },
  { value: "4000", label: "Sales Revenue", code: "4000" },
  { value: "5000", label: "Cost of Goods Sold", code: "5000" },
  { value: "6000", label: "Wages & Salaries", code: "6000" },
  { value: "6100", label: "Rent Expense", code: "6100" },
];

export function SearchableSelectBasicPreview() {
  const [value, setValue] = useState("");
  return (
    <div style={{ width: "100%", maxWidth: "20rem" }}>
      <SearchableSelect
        value={value}
        onChange={setValue}
        options={COUNTRIES}
        placeholder="Select a country…"
        searchPlaceholder="Search countries…"
      />
    </div>
  );
}

export function SearchableSelectNonSearchablePreview() {
  const [value, setValue] = useState("NZD");
  return (
    <div style={{ width: "100%", maxWidth: "20rem" }}>
      <SearchableSelect
        value={value}
        onChange={setValue}
        options={CURRENCIES}
        placeholder="Select a currency…"
        searchable={false}
      />
    </div>
  );
}

export function SearchableSelectMultiPreview() {
  const [values, setValues] = useState<string[]>(["nz", "au"]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "20rem" }}>
      <SearchableSelect
        multiple
        value={values}
        onChange={setValues}
        options={COUNTRIES}
        placeholder="Select countries…"
        searchPlaceholder="Search countries…"
        ariaLabel="Countries"
        clearable
      />
      <p style={{ fontSize: "0.75rem", color: "var(--voyzu-color-text-tertiary)", margin: 0 }}>
        Values: <strong>{values.length ? values.join(", ") : "(none)"}</strong>
      </p>
    </div>
  );
}

export function SearchableSelectMultiNonSearchablePreview() {
  const [values, setValues] = useState<string[]>(["NZD"]);
  return (
    <div style={{ width: "100%", maxWidth: "20rem" }}>
      <SearchableSelect
        multiple
        searchable={false}
        value={values}
        onChange={setValues}
        options={CURRENCIES}
        placeholder="Select currencies…"
        ariaLabel="Currencies"
      />
    </div>
  );
}

export function SearchableSelectCodeBadgePreview() {
  const [value, setValue] = useState("");
  return (
    <div style={{ width: "100%", maxWidth: "22rem" }}>
      <SearchableSelect
        value={value}
        onChange={setValue}
        options={COA_ACCOUNTS}
        placeholder="Select an account…"
        searchPlaceholder="Search accounts…"
        codeBadge
      />
    </div>
  );
}

export function SearchableSelectClearablePreview() {
  const [value, setValue] = useState("nz");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "20rem" }}>
      <SearchableSelect
        value={value}
        onChange={setValue}
        options={COUNTRIES}
        placeholder="Select a country…"
        clearable
      />
      <p style={{ fontSize: "0.75rem", color: "var(--voyzu-color-text-tertiary)", margin: 0 }}>
        Value: <strong>{value || "(none)"}</strong>
      </p>
    </div>
  );
}

export function SearchableSelectErrorPreview() {
  const [value, setValue] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", maxWidth: "20rem" }}>
      <SearchableSelect
        value={value}
        onChange={setValue}
        options={COUNTRIES}
        placeholder="Select a country…"
        hasError={!value}
      />
      {!value && (
        <p style={{ fontSize: "0.75rem", color: "var(--voyzu-color-danger)", margin: 0, fontWeight: 500 }}>
          Country is required.
        </p>
      )}
    </div>
  );
}

export function SearchableSelectDisabledPreview() {
  return (
    <div style={{ width: "100%", maxWidth: "20rem" }}>
      <SearchableSelect
        value="nz"
        onChange={() => {}}
        options={COUNTRIES}
        placeholder="Select a country…"
        disabled
      />
    </div>
  );
}
