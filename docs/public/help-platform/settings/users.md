# Users and permissions

Users manages platform identities, authentication channels, roles and status. Create a separate identity for every person and integration so access can be revoked independently and audit records identify the actual actor.

## Signing in

A user has a unique code and may also have a unique email address. UI users can sign in with either identifier and their password. API authentication always uses the user code, not the email address.

Access mode controls where the identity can be used:

| Access mode | Use                                  |
| ----------- | ------------------------------------ |
| UI          | Browser sign-in only.                |
| API         | API authentication only.             |
| UI and API  | Both browser and API authentication. |

UI passwords require at least 8 characters. Identities with API access require at least 16 characters.

## Roles

| Role     | Scope                                                                    |
| -------- | ------------------------------------------------------------------------ |
| Admin    | Platform administration and unrestricted access to installed applications. |
| Standard | Normal application access. Business packages may apply additional scope. |

When ERP Core is installed, company assignments are managed separately from platform identity under **Organization > Company Access**. Admin users have access to every company; standard users have access only to assigned companies.

## Viewing users

The list shows code, display name, email, role, access mode, and status. Search the visible identity fields and filter by role, access mode, or status. Click a row to open it; select rows for Activate, Deactivate, Delete, or Export.

## In use

Search or filter by role, access mode, and status. Select rows for Activate, Deactivate, Delete, or Export. Deactivation preserves the identity and its audit history.

## Create a new user

Select **Add User**. Enter a stable code, optional email, display name, initial password, role, access mode and status.

Choose **UI**, **API**, or **UI and API** deliberately. UI passwords require at least 8 characters; identities with API access require at least 16. Voyzu sends no email, invitation, or reset message, so supply the password manually through a secure channel.

An email address is an optional UI login identifier, not a recovery mechanism. Voyzu does not send invitations, verification messages, or password-reset links.

## Make changes

Open a user to update display name, email, role, access mode, or administrator-only options. Use **Change Password** to set a replacement credential. Changing an email changes an optional UI login identifier; API login always uses the user code.

## Change status

Deactivate access that is no longer required. This blocks UI and API authentication without removing the identity or audit history. Activate the user to restore access.

## Delete

Use deletion only for an identity created in error with no meaningful history. Prefer deactivation for anyone who has used Voyzu.

## Good practice

* Give every person and integration its own identity.
* Use API-only identities for integrations where practical.
* Grant standard users only the business-package access they need.
* Reserve the admin role for platform administration.
* Share passwords outside Voyzu through a secure channel.
* Deactivate access promptly when it is no longer required.

## See also

* [User Profile](user-profile.md)
* [Authentication](../../voyzu-platform-patterns/authentication.md)
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md)
* [Company Audit Log](../../help-core/company-ledger/audit-log.md)
