import Type from "typebox";

export const SettingSchema = Type.Object({ code: Type.String({ pattern: "\\S" }), value: Type.String() }, { additionalProperties: false });
export const SettingGetRequestDto = Type.Pick(SettingSchema, ["code"]);
export const SettingGetResponseDto = Type.Union([SettingSchema, Type.Null()]);
export const SettingSetResponseDto = Type.Undefined();
