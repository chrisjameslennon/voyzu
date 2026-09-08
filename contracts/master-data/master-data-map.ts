import { CountryMasterData } from "./country";
import { CurrencyMasterData } from "./currency";
import { UserMasterData } from "./user";

export const masterDataContracts = {
  "platform.user": {
    id: UserMasterData.properties.code,
    data: UserMasterData,
    key: "user",
    list: true,
  },
  "platform.country": {
    id: CountryMasterData.properties.code,
    data: CountryMasterData,
    key: "country",
    list: true,
  },
  "platform.currency": {
    id: CurrencyMasterData.properties.code,
    data: CurrencyMasterData,
    key: "currency",
    list: true,
  },
} as const;
