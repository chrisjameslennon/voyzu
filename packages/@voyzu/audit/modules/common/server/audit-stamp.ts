import { randomUUID } from "node:crypto";

import type { ActorType } from "@voyzu/types/modules/core";
import { getCurrentActorType, getCurrentUser } from "@voyzu/auth/users/server";

export interface UpdateAuditStamp {
  actorType: ActorType;
  userId: string | null;
  mutationId: string;
  timestamp: string;
}

export type CreationAuditStamp = UpdateAuditStamp;

export async function createUpdateAuditStamp(): Promise<UpdateAuditStamp> {
  const currentUser = await getCurrentUser();
  return {
    actorType: getCurrentActorType(),
    userId: currentUser ? String(currentUser.id) : null,
    mutationId: randomUUID(),
    timestamp: new Date().toISOString(),
  };
}

export const createCreationAuditStamp = createUpdateAuditStamp;

export function withCreationAudit<T extends object>(row: T, audit: CreationAuditStamp): T & {
  creation_date: string;
  creation_actor_type: ActorType;
  creation_user_id: string | null;
  creation_mutation_id: string;
} {
  return {
    ...row,
    creation_date: audit.timestamp,
    creation_actor_type: audit.actorType,
    creation_user_id: audit.userId,
    creation_mutation_id: audit.mutationId,
  };
}

export function withUpdateAudit<T extends object>(row: T, audit: UpdateAuditStamp): T & {
  updated_date: string;
  updated_actor_type: ActorType;
  updated_user_id: string | null;
  updated_mutation_id: string;
} {
  return {
    ...row,
    updated_date: audit.timestamp,
    updated_actor_type: audit.actorType,
    updated_user_id: audit.userId,
    updated_mutation_id: audit.mutationId,
  };
}
