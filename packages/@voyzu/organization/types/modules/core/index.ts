import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";

export const AccountType = Type.Union([
  Type.Literal("ASSET"), Type.Literal("LIABILITY"), Type.Literal("EQUITY"),
  Type.Literal("REVENUE"), Type.Literal("EXPENSE"),
]);
export type AccountType = Type.Static<typeof AccountType>;

export const DrCr = Type.Union([Type.Literal("DR"), Type.Literal("CR")]);
export type DrCr = Type.Static<typeof DrCr>;

export const EntryType = Type.Union([Type.Literal("DEBIT"), Type.Literal("CREDIT")]);
export type EntryType = Type.Static<typeof EntryType>;

export const Ledger = Type.Union([
  Type.Literal("ACCOUNTS_PAYABLE"), Type.Literal("ACCOUNTS_RECEIVABLE"),
  Type.Literal("GENERAL"), Type.Literal("TAX"), Type.Literal("INVENTORY"),
  Type.Literal("BANK_CASH"),
]);
export type Ledger = Type.Static<typeof Ledger>;

export const GlAccountPointerName = Type.Union([
  Type.Literal("Accounts Payable Control Accounts"),
  Type.Literal("Accounts Receivable Control Accounts"),
  Type.Literal("Bank / Cash Accounts"), Type.Literal("Tax Control Accounts"),
  Type.Literal("Inventory Control Accounts"),
  Type.Literal("Financial Document Defaults"), Type.Literal("Item Posting Profiles"),
]);
export type GlAccountPointerName = Type.Static<typeof GlAccountPointerName>;

export const OperationReference = StrictObject({ type: Type.String(), code: Type.String() });
export type OperationReference = Type.Static<typeof OperationReference>;

export const GlAccountPointerReference = StrictObject({
  ...OperationReference.properties,
  type: GlAccountPointerName,
});
export type GlAccountPointerReference = Type.Static<typeof GlAccountPointerReference>;

export {
  ActorType, AuditMetadataDto, AuditStampDto, AuditUserDto, Status,
} from "@voyzu/types/modules/core";
export type { OperationBlocker } from "@voyzu/types/modules/core";
