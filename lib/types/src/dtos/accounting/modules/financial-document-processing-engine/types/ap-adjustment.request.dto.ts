import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BankCashDetailsRequestDto } from "./bank-cash-details.dto";
import { ApBillCallerSuppliedTaxComponentDto, ApBillCounterpartyInputDto, ApBillDimensionsDto } from "./ap-bill.request.dto";
import { BusinessCode, IsoDate, PositiveId } from "../../common/types/constraints";

export const ApDocumentReferenceRequestDto = StrictObject({
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});
export type ApDocumentReferenceRequestDto = Type.Static<typeof ApDocumentReferenceRequestDto>;

export const ApCreditNoteLineRequestDto = StrictObject({
  line_id: Type.Optional(Type.Union([PositiveId, Type.Null()])),
  description: Type.String(),
  net_amount: Type.Optional(Type.Union([Type.Number(), Type.String(), Type.Null()])),
  gross_amount: Type.Optional(Type.Union([Type.Number(), Type.String(), Type.Null()])),
  tax_rule: Type.String(),
  tax_components: Type.Optional(Type.Union([Type.Array(ApBillCallerSuppliedTaxComponentDto), Type.Null()])),
  tax_recoverable: Type.Optional(Type.Union([Type.Boolean(), Type.Null()])),
  purchase_posting_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  dimensions: Type.Optional(Type.Union([ApBillDimensionsDto, Type.Null()])),
});
export type ApCreditNoteLineRequestDto = Type.Static<typeof ApCreditNoteLineRequestDto>;

export const ApCreditNoteAllocationRequestDto = StrictObject({
  document_id: Type.String(),
  amount: Type.Union([Type.Number(), Type.String()]),
});
export type ApCreditNoteAllocationRequestDto = Type.Static<typeof ApCreditNoteAllocationRequestDto>;

export const ApCreditNoteRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("AP_CREDIT_NOTE")),
  company_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ap_counterparty_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ap_counterparty: Type.Optional(Type.Union([ApBillCounterpartyInputDto, Type.Null()])),
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  supplier_credit_note_number: Type.String(),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  credit_note_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  tax_recoverable: Type.Optional(Type.Union([Type.Boolean(), Type.Null()])),
  purchase_posting_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  dimensions: Type.Optional(Type.Union([ApBillDimensionsDto, Type.Null()])),
  lines: Type.Array(ApCreditNoteLineRequestDto),
  allocations: Type.Optional(Type.Union([Type.Array(ApCreditNoteAllocationRequestDto), Type.Null()])),
});
export type ApCreditNoteRequestDto = Type.Static<typeof ApCreditNoteRequestDto>;

export const ApOpeningBalanceRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("AP_OPENING_BALANCE")),
  company_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ap_counterparty_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ap_counterparty: Type.Optional(Type.Union([ApBillCounterpartyInputDto, Type.Null()])),
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  opening_balance_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  opening_balance_equity_posting_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  items: Type.Array(StrictObject({
    line_id: Type.Optional(Type.Union([PositiveId, Type.Null()])),
    external_reference: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    description: Type.String(),
    gross_amount: Type.Union([Type.Number(), Type.String()]),
  })),
  dimensions: Type.Optional(Type.Union([Type.Record(Type.String(), Type.String()), Type.Null()])),
});
export type ApOpeningBalanceRequestDto = Type.Static<typeof ApOpeningBalanceRequestDto>;

export const ApRefundRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("AP_REFUND")),
  company_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ap_counterparty_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  refund_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  refund_amount: Type.Union([Type.Number(), Type.String()]),
  bank_cash_account_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  bank_cash_details: Type.Optional(Type.Union([BankCashDetailsRequestDto, Type.Null()])),
  dimensions: Type.Optional(Type.Union([Type.Record(Type.String(), Type.String()), Type.Null()])),
});
export type ApRefundRequestDto = Type.Static<typeof ApRefundRequestDto>;

export const ApWriteOffRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("AP_WRITE_OFF")),
  company_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ap_counterparty_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  write_off_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  write_off_income_posting_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  applications: Type.Array(StrictObject({
    target_bill: Type.Optional(Type.Union([ApDocumentReferenceRequestDto, Type.Null()])),
    amount: Type.Union([Type.Number(), Type.String()]),
  })),
  dimensions: Type.Optional(Type.Union([Type.Record(Type.String(), Type.String()), Type.Null()])),
});
export type ApWriteOffRequestDto = Type.Static<typeof ApWriteOffRequestDto>;

export const ApAdjustmentRequestDto = Type.Union([ApCreditNoteRequestDto, ApOpeningBalanceRequestDto, ApRefundRequestDto, ApWriteOffRequestDto]);
export type ApAdjustmentRequestDto = Type.Static<typeof ApAdjustmentRequestDto>;
