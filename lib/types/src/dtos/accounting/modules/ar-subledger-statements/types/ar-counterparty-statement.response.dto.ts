import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { EntryType } from "../../common/types/index";
import { OrganizationResponseDto } from "../../organization-finance/types/organization.response.dto";
import { BusinessCode, CurrencyCode, IsoDate, NonBlankText } from "../../common/types/constraints";

export const ArCounterpartyStatementApplicationDto = StrictObject({
  code: BusinessCode,
  postingDate: IsoDate,
  documentTypeCode: BusinessCode,
  documentTypeLabel: Type.String(),
  documentId: Type.String(),
  documentRef: Type.String(),
  memo: Type.Union([Type.String(), Type.Null()]),
  description: Type.String(),
  entryType: EntryType,
  debit: Type.Number(),
  credit: Type.Number(),
});
export type ArCounterpartyStatementApplicationDto = Type.Static<typeof ArCounterpartyStatementApplicationDto>;

export const ArCounterpartyStatementGroupDto = StrictObject({
  code: BusinessCode,
  postingDate: IsoDate,
  documentTypeCode: BusinessCode,
  documentTypeLabel: Type.String(),
  documentId: Type.String(),
  documentRef: Type.String(),
  memo: Type.Union([Type.String(), Type.Null()]),
  description: Type.String(),
  entryType: EntryType,
  debit: Type.Number(),
  credit: Type.Number(),
  openBalance: Type.Number({ description: "Net of the root document amount and all applications. Negative when overpaid." }),
  applications: Type.Array(ArCounterpartyStatementApplicationDto),
});
export type ArCounterpartyStatementGroupDto = Type.Static<typeof ArCounterpartyStatementGroupDto>;

export const ArCounterpartyStatementResponseDto = StrictObject({
  company: OrganizationResponseDto,
  counterpartyCode: BusinessCode,
  counterpartyName: NonBlankText,
  baseCurrencyCode: CurrencyCode,
  asAtDate: IsoDate,
  totalDebit: Type.Number(),
  totalCredit: Type.Number(),
  totalOwing: Type.Number({ description: "totalDebit − totalCredit (positive = owed by counterparty)." }),
  groups: Type.Array(ArCounterpartyStatementGroupDto),
});
export type ArCounterpartyStatementResponseDto = Type.Static<typeof ArCounterpartyStatementResponseDto>;
