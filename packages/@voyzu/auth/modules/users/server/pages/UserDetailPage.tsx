import { pageStringParameters, type PageProps } from "@voyzu/types/page-routing";
import "server-only";

import { notFound } from "next/navigation";

import { UserDetail } from "../../client";
import { currentUserCanManageUsers } from "../lib/current-user.service";
import { getUser } from "../lib/user.service";

export async function UserDetailPage({ context }: PageProps) {
  const { code } = pageStringParameters(context.pathParams);
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

  const user = await getUser((code));

  if (!user) notFound();

  return (
    <UserDetail
      pageTitle="Users"
      canManageUsers
      user={user}
    />
  );
}
