import Type from "typebox";
import Schema from "typebox/schema";

export const IceCreamDto = Type.Object(
  {
    code: Type.String(),
    name: Type.String(),
    scoops: Type.Number(),
  },
  { additionalProperties: false },
);

export type IceCreamDto = Type.Static<typeof IceCreamDto>;

const result = {
  code: "VANILLA",
  name: "Vanilla",
  scoops: 2,
} satisfies IceCreamDto;

const validator = Schema.Compile(IceCreamDto);

console.log("typed result:", result);
console.log("runtime valid:", validator.Check(result));
console.log(
  "runtime invalid:",
  validator.Check({ code: "VANILLA", name: "Vanilla", scoops: 2, junk: true }),
);
console.log("JSON Schema:", JSON.stringify(IceCreamDto, null, 2));
