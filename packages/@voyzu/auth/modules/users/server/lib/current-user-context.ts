import { AsyncLocalStorage } from "node:async_hooks";

import type { ActorType } from "@voyzu/types/modules/core";
import type { UserResponseDto } from "@voyzu/auth/types";

interface CurrentUserContext {
  user: UserResponseDto;
  actorType: ActorType;
}

const currentUserStorage = new AsyncLocalStorage<CurrentUserContext>();

export function getCurrentUserFromContext(): UserResponseDto | null {
  return currentUserStorage.getStore()?.user ?? null;
}

export function getCurrentActorTypeFromContext(): ActorType | null {
  return currentUserStorage.getStore()?.actorType ?? null;
}

export function runWithCurrentUserContext<T>(
  user: UserResponseDto,
  callback: () => Promise<T>,
  actorType: ActorType = "APP",
): Promise<T> {
  return currentUserStorage.run({ user, actorType }, callback);
}
