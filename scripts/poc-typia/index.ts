import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { Project, SyntaxKind } from "ts-morph";
import typia from "typia";

interface IceCreamDto {
  name: string;
  scoops: number;
}

const apiDefinition = {
  request: {
    contentType: "application/json",
    body: typia.createValidateEquals<IceCreamDto>(),
  },
};

console.log(
  "valid:",
  apiDefinition.request.body({ name: "Vanilla", scoops: 2 }),
);
console.log(
  "invalid:",
  apiDefinition.request.body({ name: "Vanilla", scoops: "2", extra: true }),
);

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.resolve(scriptDirectory, "..", "index.ts");
const project = new Project();
const sourceFile = project.addSourceFileAtPath(sourcePath);

const validatorCall = sourceFile
  .getDescendantsOfKind(SyntaxKind.CallExpression)
  .find((call) => call.getExpression().getText() === "typia.createValidateEquals");

if (!validatorCall) {
  throw new Error("Could not find typia.createValidateEquals call.");
}

const dtoType = validatorCall.getTypeArguments()[0]?.getText();
if (!dtoType) {
  throw new Error("Could not extract DTO type argument.");
}

console.log("DTO type from API definition:", dtoType);
