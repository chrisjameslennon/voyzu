import Type from "typebox";
import Schema from "typebox/schema";
import Value from "typebox/value";
export const IceCreamDto = Type.Object({
    code: Type.String(),
    name: Type.String(),
    scoops: Type.Number(),
}, { additionalProperties: false });
const result = {
    code: "VANILLA",
    name: "Vanilla",
    scoops: 2,
};
const invalid = {
    code: "VANILLA",
    namex: "Vanilla",
    scoops: "2",
};
const validator = Schema.Compile(IceCreamDto);
console.log("typed result:", result);
console.log("runtime valid:", validator.Check(result));
console.log("runtime invalid:", validator.Check(invalid));
console.log("validation errors:", [...Value.Errors(IceCreamDto, invalid)]);
console.log("JSON Schema:", JSON.stringify(IceCreamDto, null, 2));
