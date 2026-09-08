import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";

// Optional organization labels for platform consumers, independent of ERP schemas.
export const organizationDirectoryCapability = {
  list: {
    input: StrictObject({}),
    output: StrictObject({
      organizations: Type.Array(StrictObject({
        id: Type.Integer({ minimum: 1 }),
        code: Type.String(),
        name: Type.String(),
      })),
    }),
  },
} as const;
