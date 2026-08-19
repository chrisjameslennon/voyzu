import typia from "typia";

function dto<T>() {
  return {
    validate: typia.createValidateEquals<T>(),
    schema: typia.json.schema<T>(),
  };
}

interface IceCreamDto {
  name: string;
  scoops: number;
}

const iceCream = dto<IceCreamDto>();

console.log(iceCream.validate({ name: "Vanilla", scoops: 2 }));
console.log(iceCream.schema);
