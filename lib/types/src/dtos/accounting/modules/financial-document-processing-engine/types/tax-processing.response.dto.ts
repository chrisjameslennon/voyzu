import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { DrCr, EntryType } from "../../common/types/index";
import { BankCashJournalDetailsDto } from "./bank-cash-details.dto";
import { TaxAdjustmentEffect, TaxMovementCode, TaxProcessingDocumentType } from "./tax-processing.request.dto";
import { BusinessCode, CurrencyCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const TaxProcessingJournalLineDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  journal_header_id: Type.Union([PositiveId, Type.Null()]),
  line_number: PositiveId,
  gl_account_code: BusinessCode,
  gl_account_name: NonBlankText,
  source_ledger: Type.Union([Type.String(), Type.Null()]),
  source_control_account: Type.Union([Type.String(), Type.Null()]),
  dr_cr: DrCr,
  base_currency_amount: Type.Number(),
  description: Type.String(),
  memo: Type.Union([Type.String(), Type.Null()]),
});
export type TaxProcessingJournalLineDto = Type.Static<typeof TaxProcessingJournalLineDto>;

export const TaxProcessingTaxLedgerDetailDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  code: Type.Union([BusinessCode, Type.Null()]),
  tax_rule: Type.Literal("CALLER_SUPPLIED"),
  tax_component_id: Type.Union([PositiveId, Type.Null()]),
  tax_authority_code: BusinessCode,
  tax_authority_name: Type.Optional(NonBlankText),
  tax_movement_type_code: TaxMovementCode,
  description: Type.String(),
  tax_rate: Type.Number(),
  taxable_amount: Type.Number(),
  posting_date: IsoDate,
  financial_year_code: BusinessCode,
  financial_period_code: BusinessCode,
  base_currency_code: CurrencyCode,
  entry_type: EntryType,
  base_currency_amount: Type.Number(),
  status: Type.Union([Type.Literal("POSTED"), Type.Literal("EPHEMERAL")]),
});
export type TaxProcessingTaxLedgerDetailDto = Type.Static<typeof TaxProcessingTaxLedgerDetailDto>;

export const TaxProcessingDetailedDocumentDto = StrictObject({
  document_type: TaxProcessingDocumentType,
  company: StrictObject({
    code: BusinessCode,
    base_currency_code: CurrencyCode,
  }),
  tax_authority: StrictObject({
    code: BusinessCode,
    name: NonBlankText,
  }),
  document_id: Type.String(),
  memo: Type.Union([Type.String(), Type.Null()]),
  generated_description: Type.String(),
  posting_date: IsoDate,
  tax_movement_code: TaxMovementCode,
  bank_cash_account_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  bank_cash_details: Type.Optional(Type.Union([BankCashJournalDetailsDto, Type.Null()])),
  payment_date: Type.Optional(IsoDate),
  payment_amount: Type.Optional(Type.Number()),
  refund_date: Type.Optional(IsoDate),
  refund_amount: Type.Optional(Type.Number()),
  adjustment_date: Type.Optional(IsoDate),
  adjustment_effect: Type.Optional(TaxAdjustmentEffect),
  adjustment_gl_account_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  adjustment_amount: Type.Optional(Type.Number()),
});
export type TaxProcessingDetailedDocumentDto = Type.Static<typeof TaxProcessingDetailedDocumentDto>;

export const TaxProcessingPostingResponseDto = StrictObject({
  detailed_document: TaxProcessingDetailedDocumentDto,
  tax_ledger_details: Type.Array(TaxProcessingTaxLedgerDetailDto),
  posting_details: StrictObject({
    journal_header: StrictObject({
      id: Type.Union([PositiveId, Type.Null()]),
      code: Type.Union([BusinessCode, Type.Null()]),
      document_type_code: TaxProcessingDocumentType,
      document_id: Type.String(),
      generated_description: Type.String(),
      posting_engine_code: TaxProcessingDocumentType,
      company_code: BusinessCode,
      document_date: IsoDate,
      posting_date: IsoDate,
      financial_year_code: BusinessCode,
      financial_period_code: BusinessCode,
      base_currency_code: CurrencyCode,
      total_debit_base_amount: Type.Number(),
      total_credit_base_amount: Type.Number(),
      memo: Type.Union([Type.String(), Type.Null()]),
      status: Type.Union([Type.Literal("POSTED"), Type.Literal("EPHEMERAL")]),
    }),
    journal_lines: Type.Array(TaxProcessingJournalLineDto),
  }),
});
export type TaxProcessingPostingResponseDto = Type.Static<typeof TaxProcessingPostingResponseDto>;
