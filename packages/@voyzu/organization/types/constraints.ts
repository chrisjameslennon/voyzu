import Type from "typebox";

export const BusinessCode = Type.String({
  pattern: "^[A-Z0-9][A-Z0-9_-]*$",
  description: "An uppercase business code containing letters, numbers, underscores or hyphens.",
});
export const BusinessCode14 = Type.String({
  pattern: "^[A-Z0-9][A-Z0-9_-]{0,13}$",
  description: "An uppercase business code of at most 14 letters, numbers, underscores or hyphens.",
});
export const BusinessCode40 = Type.String({
  pattern: "^[A-Z0-9][A-Z0-9_-]{0,39}$",
  description: "An uppercase business code of at most 40 letters, numbers, underscores or hyphens.",
});
export const NormalizableBusinessCode = Type.String({
  pattern: "^\\s*[A-Za-z0-9_-](?:[A-Za-z0-9_ -]*[A-Za-z0-9_-])?\\s*$",
  description: "A business code that is normalized to uppercase with spaces replaced by underscores.",
});
export const NormalizableUnitCode = Type.String({
  pattern: "^\\s*[A-Za-z](?:[A-Za-z0-9_-]*[A-Za-z0-9_-])?\\s*$",
  description: "A unit code containing letters, numbers, underscores or hyphens.",
});

export const CountryCode = Type.String({ pattern: "^[A-Z]{2}$" });
export const CurrencyCode = Type.String({ pattern: "^[A-Z]{3}$" });
export const DimensionValueName = Type.String({ pattern: "^[A-Za-z0-9 _-]{1,14}$" });
export const IsoDate = Type.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" });
export const NonBlankText = Type.String({ pattern: "\\S" });
export const TrimmedText50 = Type.String({ maxLength: 50, pattern: "^(?:|\\S(?:.*\\S)?)$" });
export const TrimmedText70 = Type.String({ minLength: 1, maxLength: 70, pattern: "^\\S(?:.*\\S)?$" });
export const TrimmedText100 = Type.String({ maxLength: 100, pattern: "^(?:|\\S(?:.*\\S)?)$" });
export const TrimmedText120 = Type.String({ minLength: 1, maxLength: 120, pattern: "^\\S(?:.*\\S)?$" });
export const TrimmedText200 = Type.String({ minLength: 1, maxLength: 200, pattern: "^\\S(?:.*\\S)?$" });
export const TaxFilingAnchorMonth = Type.Integer({ minimum: 1, maximum: 12 });
export const PositiveId = Type.Integer({ minimum: 1 });
