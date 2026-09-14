import type { InternalApiDefinition } from "@voyzu/types/internal-api";
import * as dto from "../types/accounting.internal-api.dto";
export const LedgerDocumentsDefinition = { methods: {
 getTaxEntry: { input: dto.AccountingGetDto, output: dto.TaxEntryGetResponseDto },
 getInventoryEntry: { input: dto.AccountingGetDto, output: dto.InventoryEntryGetResponseDto },
 getJournal: { input: dto.AccountingGetDto, output: dto.journalGetResponseDto },
 getArEntry: { input: dto.AccountingGetDto, output: dto.arEntryGetResponseDto },
 getApEntry: { input: dto.AccountingGetDto, output: dto.apEntryGetResponseDto },
 getArDocument: { input: dto.AccountingGetDto, output: dto.arDocumentGetResponseDto },
 getApDocument: { input: dto.AccountingGetDto, output: dto.apBillGetResponseDto },
 listArEntries: { input: dto.AccountingScopeDto, output: dto.arEntryListResponseDto },
 listApEntries: { input: dto.AccountingScopeDto, output: dto.apEntryListResponseDto },
 listArStatementSummaries: { input: dto.AccountingScopeDto, output: dto.arSummaryListResponseDto },
 listApStatementSummaries: { input: dto.AccountingScopeDto, output: dto.apSummaryListResponseDto },
 getArStatement: { input: dto.AccountingGetDto, output: dto.arStatementGetResponseDto },
 getApStatement: { input: dto.AccountingGetDto, output: dto.apStatementGetResponseDto },
 getInvoice: { input: dto.AccountingGetDto, output: dto.arInvoiceGetResponseDto },
 getBill: { input: dto.AccountingGetDto, output: dto.apBillGetResponseDto },
} } as const satisfies InternalApiDefinition;
