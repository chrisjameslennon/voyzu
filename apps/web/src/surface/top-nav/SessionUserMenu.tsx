import "server-only";

import { UserMenu } from "@voyzu/ui-components";
import { getCurrentUser } from "@voyzu/auth/users/server";

export async function SessionUserMenu() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <UserMenu
      code={user.code}
      email={user.email}
      displayName={user.displayName}
    />
  );
}
