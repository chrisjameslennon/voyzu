import "server-only";

import { notFound } from "next/navigation";

import { UserProfile } from "../../client";
import { getCurrentUser } from "../lib/current-user.service";
import { getUser } from "../lib/user.service";

export async function UserProfilePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) notFound();
  const user = await getUser(currentUser.code);

  return <UserProfile user={user ?? currentUser} />;
}
