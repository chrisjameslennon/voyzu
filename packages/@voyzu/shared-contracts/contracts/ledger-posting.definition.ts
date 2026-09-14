import type { InternalApiDefinition } from "@voyzu/types/internal-api";
import { ApBillRequestDto } from "../types/ledger-posting.internal-api.dto";
import { ApBillPostingResponseDto } from "@voyzu/types/dtos/accounting/modules/financial-document-processing-engine/types/ap-bill.response.dto";
import { ApBillCancellationRequestDto } from "../types/ledger-posting.internal-api.dto";
import { ApProcessingPostingResponseDto } from "@voyzu/types/dtos/accounting/modules/financial-document-processing-engine/types/ap-processing.response.dto";
import { ApCreditNoteRequestDto } from "../types/ledger-posting.internal-api.dto";
import { ApOpeningBalanceRequestDto } from "../types/ledger-posting.internal-api.dto";
import { ApPaymentRequestDto } from "../types/ledger-posting.internal-api.dto";
import { ApPaymentApplicationRequestDto } from "../types/ledger-posting.internal-api.dto";
import { ApRefundRequestDto } from "../types/ledger-posting.internal-api.dto";
import { ApWriteOffRequestDto } from "../types/ledger-posting.internal-api.dto";
import { ArCreditNoteRequestDto } from "../types/ledger-posting.internal-api.dto";
import { ArAdjustmentPostingResponseDto } from "@voyzu/types/dtos/accounting/modules/financial-document-processing-engine/types/ar-adjustment.response.dto";
import { ArInvoiceRequestDto } from "../types/ledger-posting.internal-api.dto";
import { ArInvoicePostingResponseDto } from "@voyzu/types/dtos/accounting/modules/financial-document-processing-engine/types/ar-invoice.response.dto";
import { ArInvoiceCancellationRequestDto } from "../types/ledger-posting.internal-api.dto";
import { ArInvoiceCancellationPostingResponseDto } from "@voyzu/types/dtos/accounting/modules/financial-document-processing-engine/types/ar-invoice-cancellation.response.dto";
import { ArOpeningBalanceRequestDto } from "../types/ledger-posting.internal-api.dto";
import { ArReceiptRequestDto } from "../types/ledger-posting.internal-api.dto";
import { ArReceiptPostingResponseDto } from "@voyzu/types/dtos/accounting/modules/financial-document-processing-engine/types/ar-receipt.response.dto";
import { ArReceiptApplicationRequestDto } from "../types/ledger-posting.internal-api.dto";
import { ArReceiptApplicationPostingResponseDto } from "@voyzu/types/dtos/accounting/modules/financial-document-processing-engine/types/ar-receipt-application.response.dto";
import { ArRefundRequestDto } from "../types/ledger-posting.internal-api.dto";
import { ArWriteOffRequestDto } from "../types/ledger-posting.internal-api.dto";
import { InventoryAdjustmentRequestDto } from "../types/ledger-posting.internal-api.dto";
import { InventoryProcessingPostingResponseDto } from "@voyzu/types/dtos/accounting/modules/financial-document-processing-engine/types/inventory-processing.response.dto";
import { InventoryIssueRequestDto } from "../types/ledger-posting.internal-api.dto";
import { InventoryReceiptRequestDto } from "../types/ledger-posting.internal-api.dto";
import { LedgerJournalRequestDto } from "../types/ledger-posting.internal-api.dto";
import { LedgerJournalPostingResponseDto } from "@voyzu/types/dtos/accounting/modules/financial-document-processing-engine/types/ledger-journal.response.dto";
import { LedgerJournalReversalRequestDto } from "../types/ledger-posting.internal-api.dto";
import { LedgerJournalReversalPostingResponseDto } from "@voyzu/types/dtos/accounting/modules/financial-document-processing-engine/types/ledger-journal-reversal.response.dto";
import { TaxAdjustmentRequestDto } from "../types/ledger-posting.internal-api.dto";
import { TaxProcessingPostingResponseDto } from "@voyzu/types/dtos/accounting/modules/financial-document-processing-engine/types/tax-processing.response.dto";
import { TaxPaymentRequestDto } from "../types/ledger-posting.internal-api.dto";
import { TaxRefundRequestDto } from "../types/ledger-posting.internal-api.dto";
export const LedgerPostingDefinition = { methods: {
 apBill: { input: ApBillRequestDto, output: ApBillPostingResponseDto },
 apBillCancellation: { input: ApBillCancellationRequestDto, output: ApProcessingPostingResponseDto },
 apCreditNote: { input: ApCreditNoteRequestDto, output: ApProcessingPostingResponseDto },
 apOpeningBalance: { input: ApOpeningBalanceRequestDto, output: ApProcessingPostingResponseDto },
 apPayment: { input: ApPaymentRequestDto, output: ApProcessingPostingResponseDto },
 apPaymentApplication: { input: ApPaymentApplicationRequestDto, output: ApProcessingPostingResponseDto },
 apRefund: { input: ApRefundRequestDto, output: ApProcessingPostingResponseDto },
 apWriteOff: { input: ApWriteOffRequestDto, output: ApProcessingPostingResponseDto },
 arCreditNote: { input: ArCreditNoteRequestDto, output: ArAdjustmentPostingResponseDto },
 arInvoice: { input: ArInvoiceRequestDto, output: ArInvoicePostingResponseDto },
 arInvoiceCancellation: { input: ArInvoiceCancellationRequestDto, output: ArInvoiceCancellationPostingResponseDto },
 arOpeningBalance: { input: ArOpeningBalanceRequestDto, output: ArAdjustmentPostingResponseDto },
 arReceipt: { input: ArReceiptRequestDto, output: ArReceiptPostingResponseDto },
 arReceiptApplication: { input: ArReceiptApplicationRequestDto, output: ArReceiptApplicationPostingResponseDto },
 arRefund: { input: ArRefundRequestDto, output: ArAdjustmentPostingResponseDto },
 arWriteOff: { input: ArWriteOffRequestDto, output: ArAdjustmentPostingResponseDto },
 inventoryAdjustment: { input: InventoryAdjustmentRequestDto, output: InventoryProcessingPostingResponseDto },
 inventoryIssue: { input: InventoryIssueRequestDto, output: InventoryProcessingPostingResponseDto },
 inventoryReceipt: { input: InventoryReceiptRequestDto, output: InventoryProcessingPostingResponseDto },
 ledgerJournal: { input: LedgerJournalRequestDto, output: LedgerJournalPostingResponseDto },
 ledgerJournalReversal: { input: LedgerJournalReversalRequestDto, output: LedgerJournalReversalPostingResponseDto },
 taxAdjustment: { input: TaxAdjustmentRequestDto, output: TaxProcessingPostingResponseDto },
 taxPayment: { input: TaxPaymentRequestDto, output: TaxProcessingPostingResponseDto },
 taxRefund: { input: TaxRefundRequestDto, output: TaxProcessingPostingResponseDto },
} } as const satisfies InternalApiDefinition;
