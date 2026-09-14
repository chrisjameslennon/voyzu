import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { DrCr } from "../../common/types/index";
import { BusinessCode, CurrencyCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const InventoryProcessingLineDimensionDto = StrictObject({
  dimension_code: BusinessCode,
  dimension_name: NonBlankText,
  dimension_value_name: NonBlankText,
});
export type InventoryProcessingLineDimensionDto = Type.Static<typeof InventoryProcessingLineDimensionDto>;

export const InventoryProcessingDetailedLineDto = StrictObject({
  line_id: PositiveId,
  inventory_item_code: BusinessCode,
  inventory_item_name: NonBlankText,
  item_posting_profile_code: Type.Union([BusinessCode, Type.Null()]),
  gl_account_code: Type.Union([BusinessCode, Type.Null()]),
  description: Type.String(),
  movement: Type.Union([Type.Literal("INVENTORY_RECEIPT"), Type.Literal("INVENTORY_ISSUE"), Type.Literal("INVENTORY_QUANTITY_ADJUSTMENT"), Type.Literal("INVENTORY_VALUE_ADJUSTMENT")]),
  quantity_delta: Type.Number(),
  valuation_method: Type.Union([Type.String(), Type.Null()]),
  issue_purpose: Type.Union([Type.Literal("SOLD"), Type.Literal("CONSUMED"), Type.Null()]),
  adjustment_type: Type.Union([Type.Literal("QUANTITY_ADJUSTMENT"), Type.Literal("VALUE_ADJUSTMENT"), Type.Null()]),
  unit_book_value_supplied: Type.Union([Type.Number(), Type.Null()]),
  unit_book_value_used: Type.Union([Type.Number(), Type.Null()]),
  book_value_delta: Type.Number(),
  qty_balance: Type.Number(),
  avg_unit_value: Type.Number(),
  book_value_balance: Type.Number(),
  dimensions: Type.Record(Type.String(), Type.String()),
});
export type InventoryProcessingDetailedLineDto = Type.Static<typeof InventoryProcessingDetailedLineDto>;

export const InventoryProcessingDetailedDocumentDto = StrictObject({
  company: StrictObject({
    code: BusinessCode,
    base_currency_code: CurrencyCode,
  }),
  document_type: Type.Union([Type.Literal("INVENTORY_RECEIPT"), Type.Literal("INVENTORY_ISSUE"), Type.Literal("INVENTORY_ADJUSTMENT")]),
  document_id: Type.String(),
  memo: Type.Union([Type.String(), Type.Null()]),
  source: StrictObject({
    source_document: Type.String(),
    source_document_id: Type.Union([Type.String(), Type.Null()]),
    source_type: Type.Union([Type.String(), Type.Null()]),
    source_line_id: Type.Union([PositiveId, Type.Null()]),
  }),
  generated_description: Type.String(),
  document_date: IsoDate,
  posting_date: IsoDate,
  lines: Type.Array(InventoryProcessingDetailedLineDto),
  total_book_value_increase: Type.Number(),
  total_book_value_decrease: Type.Number(),
});
export type InventoryProcessingDetailedDocumentDto = Type.Static<typeof InventoryProcessingDetailedDocumentDto>;

export const InventoryLedgerLineDetailDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  inventory_ledger_entry_header_id: Type.Union([PositiveId, Type.Null()]),
  line_number: PositiveId,
  movement: Type.String(),
  inventory_item_code: BusinessCode,
  inventory_item_name: NonBlankText,
  inventory_control_account_code: BusinessCode,
  qty_delta: Type.Number(),
  unit_value_supplied: Type.Union([Type.Number(), Type.Null()]),
  book_value_delta: Type.Number(),
  qty_balance: Type.Number(),
  avg_unit_value: Type.Number(),
  book_value_balance: Type.Number(),
  memo: Type.Union([Type.String(), Type.Null()]),
});
export type InventoryLedgerLineDetailDto = Type.Static<typeof InventoryLedgerLineDetailDto>;

export const InventoryLedgerDetailsDto = StrictObject({
  inventory_ledger_entry_header: StrictObject({
    id: Type.Union([PositiveId, Type.Null()]),
    code: Type.Union([BusinessCode, Type.Null()]),
    company_code: BusinessCode,
    journal_header_id: Type.Union([PositiveId, Type.Null()]),
    source_document_type_code: BusinessCode,
    document_id: Type.String(),
    generated_description: Type.String(),
    document_date: IsoDate,
    posting_date: IsoDate,
    financial_year_code: BusinessCode,
    financial_period_code: BusinessCode,
    base_currency_code: CurrencyCode,
    status: Type.Union([Type.Literal("POSTED"), Type.Literal("EPHEMERAL")]),
  }),
  inventory_ledger_lines: Type.Array(InventoryLedgerLineDetailDto),
});
export type InventoryLedgerDetailsDto = Type.Static<typeof InventoryLedgerDetailsDto>;

export const InventoryProcessingJournalHeaderDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  code: Type.Union([BusinessCode, Type.Null()]),
  document_type_code: Type.Union([Type.Literal("INVENTORY_RECEIPT"), Type.Literal("INVENTORY_ISSUE"), Type.Literal("INVENTORY_ADJUSTMENT")]),
  document_id: Type.String(),
  generated_description: Type.String(),
  posting_engine_code: Type.Union([Type.Literal("INVENTORY_RECEIPT"), Type.Literal("INVENTORY_ISSUE"), Type.Literal("INVENTORY_ADJUSTMENT")]),
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
});
export type InventoryProcessingJournalHeaderDto = Type.Static<typeof InventoryProcessingJournalHeaderDto>;

export const InventoryProcessingJournalLineDto = StrictObject({
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
  dimensions: Type.Optional(Type.Array(InventoryProcessingLineDimensionDto)),
});
export type InventoryProcessingJournalLineDto = Type.Static<typeof InventoryProcessingJournalLineDto>;

export const InventoryProcessingPostingDetailsDto = StrictObject({
  journal_header: InventoryProcessingJournalHeaderDto,
  journal_lines: Type.Array(InventoryProcessingJournalLineDto),
});
export type InventoryProcessingPostingDetailsDto = Type.Static<typeof InventoryProcessingPostingDetailsDto>;

export const InventoryProcessingPostingResponseDto = StrictObject({
  detailed_document: InventoryProcessingDetailedDocumentDto,
  inventory_ledger_details: InventoryLedgerDetailsDto,
  posting_details: InventoryProcessingPostingDetailsDto,
});
export type InventoryProcessingPostingResponseDto = Type.Static<typeof InventoryProcessingPostingResponseDto>;
