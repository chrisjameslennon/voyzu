# Settings

Settings manages application users and the signed-in user's own profile.

## Concepts

* [Users and permissions](users.md) explains authentication, UI and API access, platform roles, and password handling.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains the company scope granted by assignments.

## User administration

Administrators use **Users** to create identities, choose UI or API access, assign platform roles, set passwords, change status, and preserve audit attribution. Voyzu has no built-in email delivery, invitation, or password-reset service.

## Personal profile

Every signed-in UI user can use **User Profile** to change their display name, email login identifier, and password. Role, access mode and status remain administrator-controlled.

## Access boundaries

Admin users can access all companies. Standard users can access only the companies assigned under **Organization > Company Access**. Use a separate identity for every person and integration, and deactivate an identity when access is no longer needed.

## See also

* [Users](users.md)
* [User Profile](user-profile.md)
* [Authentication](../../voyzu-platform-patterns/authentication.md)
