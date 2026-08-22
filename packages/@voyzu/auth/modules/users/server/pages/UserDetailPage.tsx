import "server-only";

import { notFound } from "next/navigation";

import { UserDetail } from "../../client";
import { currentUserCanManageUsers } from "../lib/current-user.service";
import { getUser } from "../lib/user.service";

interface UserDetailPageProps {
  code?: string;
}

export async function UserDetailPage({ code }: UserDetailPageProps) {
  if (!code) notFound();

  const canManageUsers = await currentUserCanManageUsers();
  if (!canManageUsers) {
    return (
      <UserDetail
        pageTitle="Users"
        canManageUsers={false}
        user={null}
      />
    );
  }

  const user = await getUser(decodeURIComponent(code));

  if (!user) notFound();

  return (
    <UserDetail
      pageTitle="Users"
      canManageUsers
      user={user}
    />
  );
}
