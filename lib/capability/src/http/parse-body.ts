import type { NextRequest } from "next/server";

import { InputValidationError } from "../errors";

export async function parseBody<T>(req: NextRequest): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new InputValidationError("Request body is required and must be valid JSON");
  }
}
