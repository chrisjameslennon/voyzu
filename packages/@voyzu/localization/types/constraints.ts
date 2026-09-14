import Type from "typebox";

export { BusinessCode, CurrencyCode, NonBlankText } from "@voyzu/types/dtos/constraints";
export const TaxFilingAnchorMonth = Type.Integer({ minimum: 1, maximum: 12 });
