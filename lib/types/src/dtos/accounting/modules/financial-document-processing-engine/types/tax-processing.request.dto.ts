import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BankCashDetailsRequestDto } from "./bank-cash-details.dto";
import { BusinessCode, IsoDate } from "../../common/types/constraints";

export const TaxProcessingDocumentType = Type.Union([Type.Literal("TAX_PAYMENT"), Type.Literal("TAX_REFUND"), Type.Literal("TAX_ADJUSTMENT")]);
export type TaxProcessingDocumentType = Type.Static<typeof TaxProcessingDocumentType>;
export const TaxMovementCode = Type.Union([Type.Literal("TAX_ON_SALES"), Type.Literal("TAX_ON_PURCHASES")]);
export type TaxMovementCode = Type.Static<typeof TaxMovementCode>;
export const TaxAdjustmentEffect = Type.Union([Type.Literal("INCREASES_TAX_PAYABLE"), Type.Literal("REDUCES_TAX_PAYABLE"), Type.Literal("INCREASES_TAX_RECOVERABLE"), Type.Literal("REDUCES_TAX_RECOVERABLE")]);
export type TaxAdjustmentEffect = Type.Static<typeof TaxAdjustmentEffect>;

export const TaxPaymentRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("TAX_PAYMENT")),
  company_code: BusinessCode,
  tax_authority_code: BusinessCode,
  document_id: Type.Optional(Type.String()),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  payment_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  payment_amount: Type.Number(),
  bank_cash_account_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  bank_cash_details: Type.Optional(Type.Union([BankCashDetailsRequestDto, Type.Null()])),
});
export type TaxPaymentRequestDto = Type.Static<typeof TaxPaymentRequestDto>;

export const TaxRefundRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("TAX_REFUND")),
  company_code: BusinessCode,
  tax_authority_code: BusinessCode,
  document_id: Type.Optional(Type.String()),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  refund_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  refund_amount: Type.Number(),
  bank_cash_account_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  bank_cash_details: Type.Optional(Type.Union([BankCashDetailsRequestDto, Type.Null()])),
});
export type TaxRefundRequestDto = Type.Static<typeof TaxRefundRequestDto>;

export const TaxAdjustmentRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("TAX_ADJUSTMENT")),
  company_code: BusinessCode,
  tax_authority_code: BusinessCode,
  document_id: Type.Optional(Type.String()),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  adjustment_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  tax_movement_code: TaxMovementCode,
  adjustment_effect: TaxAdjustmentEffect,
  adjustment_amount: Type.Number(),
  adjustment_gl_account_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  bank_cash_details: Type.Optional(Type.Union([BankCashDetailsRequestDto, Type.Null()])),
});
export type TaxAdjustmentRequestDto = Type.Static<typeof TaxAdjustmentRequestDto>;

export const TaxProcessingRequestDto = Type.Union([TaxPaymentRequestDto, TaxRefundRequestDto, TaxAdjustmentRequestDto]);
export type TaxProcessingRequestDto = Type.Static<typeof TaxProcessingRequestDto>;
