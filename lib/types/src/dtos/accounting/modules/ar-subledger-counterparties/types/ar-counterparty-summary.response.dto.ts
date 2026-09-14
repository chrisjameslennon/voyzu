import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BusinessCode, NonBlankText } from "../../common/types/constraints";

export const ArCounterpartySummaryResponseDto = StrictObject({
  counterpartyCode: BusinessCode,
  counterpartyName: NonBlankText,
  openInvoicesAmount: Type.Number({ description: "Sum of open balances across this counterparty's AR invoices\n(invoice amount minus CREDIT applications posted against the invoice)." }),
  unappliedReceiptsAmount: Type.Number({ description: "Sum of receipt amounts that have not yet been drawn down by applications\n(receipt amount minus DEBIT applications posted against the receipt)." }),
  netBalance: Type.Number({ description: "openInvoicesAmount − unappliedReceiptsAmount. Positive = owed by counterparty." }),
});
export type ArCounterpartySummaryResponseDto = Type.Static<typeof ArCounterpartySummaryResponseDto>;
