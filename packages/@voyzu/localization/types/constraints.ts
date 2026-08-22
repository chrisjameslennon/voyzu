import Type from "typebox";

export const BusinessCode = Type.String({
  pattern: "^[A-Z0-9][A-Z0-9_-]*$",
  description: "An uppercase business code containing letters, numbers, underscores or hyphens.",
});
export const CurrencyCode = Type.String({ pattern: "^[A-Z]{3}$" });
export const NonBlankText = Type.String({ pattern: "\\S" });
export const TaxFilingAnchorMonth = Type.Integer({ minimum: 1, maximum: 12 });
