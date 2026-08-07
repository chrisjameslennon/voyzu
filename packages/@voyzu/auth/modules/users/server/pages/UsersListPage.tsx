import "server-only";

import { UserList } from "../../client";
import { currentUserCanManageUsers } from "../lib/current-user.service";
import { listUsers } from "../lib/user.service";

export async function UsersListPage() {
  const canManageUsers = await currentUserCanManageUsers();
  const users = canManageUsers ? await listUsers() : [];

  return (
    <UserList
      pageTitle="Users"
      canManageUsers={canManageUsers}
      initialUsers={users}
      companies={[]}
    />
  );
}
