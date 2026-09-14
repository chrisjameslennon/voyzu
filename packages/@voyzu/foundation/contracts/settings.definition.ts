import type { InternalApiDefinition } from "@voyzu/types/internal-api";
import { SettingSchema, SettingGetRequestDto, SettingGetResponseDto, SettingSetResponseDto } from "../types/settings.dto";

export const SettingsDefinition = {
  dataDefinition: SettingSchema,
  methods: {
    get: { input: SettingGetRequestDto, output: SettingGetResponseDto },
    set: { input: SettingSchema, output: SettingSetResponseDto },
  },
} as const satisfies InternalApiDefinition;
