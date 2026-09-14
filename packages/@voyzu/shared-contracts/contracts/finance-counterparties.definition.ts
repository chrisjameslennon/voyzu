import type { InternalApiDefinition } from "@voyzu/types/internal-api";
import * as dto from "../types/finance.internal-api.dto";
export const FinanceCounterpartiesDefinition = { dataDefinition: dto.FinanceCounterpartyDto, methods: {
 get: { input: dto.FinanceCounterpartyGetDto, output: dto.FinanceCounterpartyGetResponseDto },
 list: { input: dto.FinanceScopeDto, output: dto.FinanceCounterpartyListDto },
 ensure: { input: dto.FinanceCounterpartyEnsureDto, output: dto.FinanceCounterpartyDto },
} } as const satisfies InternalApiDefinition;
