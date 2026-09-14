import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { OrganizationResponseDto } from "../../organization-finance/types/organization.response.dto";
import { ArInvoiceDetailedInvoiceDto } from "../../financial-document-processing-engine/types/ar-invoice.response.dto";
import { BusinessCode, IsoDate, NonBlankText } from "../../common/types/constraints";

export const ArInvoiceStatementTransactionDto = StrictObject({
  code: BusinessCode,
  journalCode: BusinessCode,
  postingDate: IsoDate,
  documentDate: IsoDate,
  documentTypeCode: BusinessCode,
  documentTypeLabel: Type.String(),
  documentId: Type.String(),
  documentRef: Type.String(),
  memo: Type.Union([Type.String(), Type.Null()]),
  amount: Type.Number(),
});
export type ArInvoiceStatementTransactionDto = Type.Static<typeof ArInvoiceStatementTransactionDto>;

export const ArInvoiceStatementResponseDto = StrictObject({
  company: OrganizationResponseDto,
  invoiceEntryCode: BusinessCode,
  invoice: ArInvoiceDetailedInvoiceDto,
  counterpartyCode: BusinessCode,
  counterpartyName: NonBlankText,
  invoiceAmount: Type.Number(),
  appliedAmount: Type.Number(),
  openBalance: Type.Number(),
  transactions: Type.Array(ArInvoiceStatementTransactionDto),
});
export type ArInvoiceStatementResponseDto = Type.Static<typeof ArInvoiceStatementResponseDto>;
