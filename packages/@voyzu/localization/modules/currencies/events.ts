import Type from "typebox";

import { CurrencyResponseDto } from "@voyzu/localization/types/modules/currencies";

export const events = {
  currencyCreated: {
    description: "A currency was created.",
    payload: CurrencyResponseDto,
  },
  currencyUpdated: {
    description: "A currency was updated.",
    payload: CurrencyResponseDto,
  },
  currencyDeleted: {
    description: "A currency was deleted.",
    payload: CurrencyResponseDto,
  },
  currenciesCreated: {
    description: "Currencies were created.",
    payload: Type.Array(CurrencyResponseDto),
  },
  currenciesUpdated: {
    description: "Currencies were updated.",
    payload: Type.Array(CurrencyResponseDto),
  },
  currenciesDeleted: {
    description: "Currencies were deleted.",
    payload: Type.Array(CurrencyResponseDto),
  },
  currencyActivated: {
    description: "A currency was activated.",
    payload: CurrencyResponseDto,
  },
  currencyDeactivated: {
    description: "A currency was deactivated.",
    payload: CurrencyResponseDto,
  },
  currenciesActivated: {
    description: "Currencies were activated.",
    payload: Type.Array(CurrencyResponseDto),
  },
  currenciesDeactivated: {
    description: "Currencies were deactivated.",
    payload: Type.Array(CurrencyResponseDto),
  },
} as const;
