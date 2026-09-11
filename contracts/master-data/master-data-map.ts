import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { AuditUserDto } from "@voyzu/types/modules/core";
import { CountryMasterData } from "./country";
import { CurrencyMasterData } from "./currency";
import { UserMasterData } from "./user";
const all = { inputDataDefinition: StrictObject({}) };
const Id = Type.Integer({ minimum: 1 });
export const semanticDataContracts = {
  user: { identifier: "code", identifierDataDefinition: UserMasterData.properties.code, dataDefinition: Type.Omit(UserMasterData, ["code"]), queries: { all } },
  country: { identifier: "code", identifierDataDefinition: CountryMasterData.properties.code, dataDefinition: Type.Omit(CountryMasterData, ["code"]), queries: { all } },
  currency: { identifier: "code", identifierDataDefinition: CurrencyMasterData.properties.code, dataDefinition: Type.Omit(CurrencyMasterData, ["code"]), queries: { all } },
  userSummary: {
    identifier: "id", identifierDataDefinition: Id,
    dataDefinition: Type.Omit(AuditUserDto, ["id"]),
    queries: { byIds: { inputDataDefinition: StrictObject({ ids: Type.Array(Id) }) } },
  },
  organizationDirectory: {
    identifier: "id", identifierDataDefinition: Id,
    dataDefinition: StrictObject({ code: Type.String(), name: Type.String() }),
    queries: { all },
  },
} as const;
