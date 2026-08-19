import * as __typia_transform__accessExpressionAsString from "typia/lib/internal/_accessExpressionAsString";
import * as __typia_transform__validateReport from "typia/lib/internal/_validateReport";
import * as __typia_transform__createStandardSchema from "typia/lib/internal/_createStandardSchema";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { Project, SyntaxKind } from "ts-morph";
import typia from "typia";
const apiDefinition = {
    request: {
        contentType: "application/json",
        body: (() => { const _io0 = (input, _exceptionable = true) => "string" === typeof input.name && "number" === typeof input.scoops && (2 === Object.keys(input).length || Object.keys(input).every(key => {
            if (["name", "scoops"].some(prop => key === prop))
                return true;
            const value = input[key];
            if (undefined === value)
                return true;
            return false;
        })); const _vo0 = (input, _path, _exceptionable = true) => ["string" === typeof input.name || _report(_exceptionable, {
                path: _path + ".name",
                expected: "string",
                value: input.name
            }), "number" === typeof input.scoops || _report(_exceptionable, {
                path: _path + ".scoops",
                expected: "number",
                value: input.scoops
            }), 2 === Object.keys(input).length || (false === _exceptionable || Object.keys(input).map(key => {
                if (["name", "scoops"].some(prop => key === prop))
                    return true;
                const value = input[key];
                if (undefined === value)
                    return true;
                return _report(_exceptionable, {
                    path: _path + __typia_transform__accessExpressionAsString._accessExpressionAsString(key),
                    expected: "undefined",
                    value: value,
                    description: [
                        `The property \`${key}\` is not defined in the object type.`,
                        "",
                        "Please remove the property next time."
                    ].join("\n")
                });
            }).every(flag => flag))].every(flag => flag); const __is = (input, _exceptionable = true) => "object" === typeof input && null !== input && _io0(input, true); let errors; let _report; return __typia_transform__createStandardSchema._createStandardSchema(input => {
            if (false === __is(input)) {
                errors = [];
                _report = __typia_transform__validateReport._validateReport(errors);
                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input || _report(true, {
                    path: _path + "",
                    expected: "IceCreamDto",
                    value: input
                })) && _vo0(input, _path + "", true) || _report(true, {
                    path: _path + "",
                    expected: "IceCreamDto",
                    value: input
                }))(input, "$input", true);
                const success = 0 === errors.length;
                return success ? {
                    success,
                    data: input
                } : {
                    success,
                    errors,
                    data: input
                };
            }
            return {
                success: true,
                data: input
            };
        }); })(),
    },
};
console.log("valid:", apiDefinition.request.body({ name: "Vanilla", scoops: 2 }));
console.log("invalid:", apiDefinition.request.body({ name: "Vanilla", scoops: "2", extra: true }));
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
