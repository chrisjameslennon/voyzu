import type { InternalApiDefinition } from "@voyzu/types/internal-api";
import { FinanceDocumentDto, FinanceDocumentGetDto, FinanceDocumentGetResponseDto } from "../types/finance.internal-api.dto";
export const FinanceDocumentsDefinition = { dataDefinition: FinanceDocumentDto, methods: {
 get: { input: FinanceDocumentGetDto, output: FinanceDocumentGetResponseDto },
 record: { input: FinanceDocumentDto, output: FinanceDocumentDto },
} } as const satisfies InternalApiDefinition;
