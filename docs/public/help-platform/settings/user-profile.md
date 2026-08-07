# User Profile

User Profile manages the signed-in user's own display details and password.

## Concepts

* [Users and permissions](users.md) explains login identifiers, access modes, roles, and password requirements.

## Viewing your profile

The screen shows your code, display name, email, and role. The code and role are read-only because they define administrator-controlled identity and access. The audit panel records when the user record was created and last changed.

## Change profile details

Edit **Display Name** or **Email**, then select **Save**. Email is optional and can be used with the password to sign in to the UI. Voyzu does not verify the address or send email.

Keep the email unique. Changing it does not change the user code, and API authentication continues to use the code.

## Change password

Select **Change Password**, enter and confirm the replacement, then save. UI-only users require at least 8 characters; users with API access require at least 16.

Voyzu has no password-reset email. If you cannot sign in, an administrator must set a replacement password and provide it outside Voyzu through a secure channel.

## Access changes

You cannot change your role, UI/API access mode, status, or company assignments from this screen. An administrator manages those settings from Users. Admin and organization roles have all-company access; company users see only assigned companies.

## See also

* [Users](users.md)
* [Authentication](../../voyzu-platform-patterns/authentication.md)
