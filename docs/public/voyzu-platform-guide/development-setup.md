# Development setup

Set up a local development environment for creating Voyzu packages.

{% hint style="info" %}
This is a development installation for package authors.

For an isolated end-user or production installation, use [Production installation and setup](../installation-and-operation/installation-and-setup.md).
{% endhint %}

## 1. Prerequisites

Package development has the same prerequisites as a production installation; no additional development tooling is required. The best way to ensure you are set up correctly do develop Voyzu packages is to install Voyzu, e.g. in a temporary folder. To do this follow the [production installation guide](../installation-and-operation/installation-and-setup.md)

## 2. Choose a package name

Every Voyzu package name must use the format `@publisher/package-name`. For example:

* `@voyzu/ice-creams`
* `@voyzu/core`
* `@acme/warehousing`

Choose the directory in which you will develop your packages and navigate to it at the command line. The directory does not need to contain an existing project.

## 3. Install the development environment

Run:

```shell
npm exec --yes --package=github:chrisjameslennon/create-voyzu -- create-voyzu dev
```

The command creates the root `package.json` and `packages/` directory when they do not exist. It downloads the Voyzu Platform into `.run/voyzu`, creates the development runtime and installs its dependencies.

The disposable platform runtime is always downloaded from Voyzu's `main`
branch. Development branch and tag overrides are not supported.

The resulting structure is:

```
your-development-directory/
├─ .package-sources/              # Downloaded Git package repositories
├─ .run/
│  ├─ packages/                   # Physical copies of installed packages
│  ├─ voyzu/                      # Disposable Voyzu Platform runtime
│  │  └─ apps/web/public/         # Next.js static assets served by the runtime
│  └─ package.json
├─ packages/                      # Packages being developed locally
├─ .env.local
├─ .gitignore
└─ package.json
```

Existing `.env.local`, `.gitignore`, `package.json` and package source are preserved.

## 4. Create the PostgreSQL database

Create an empty PostgreSQL database for the development environment. The examples in this guide use the name `voyzu`:

```shell
createdb voyzu
```

Record the database host, port, database name, username and password. The development installer does not create the PostgreSQL database itself.

## 5. Configure the environment

Open `.env.local` and replace `CHANGE_ME` in `VOYZU_DATABASE_URL` with the development database password:

```env
VOYZU_DATABASE_URL=postgresql://postgres:your-password@localhost:5432/voyzu
```

If the database password contains reserved URL characters, URL-encode it.

The installer has already generated a unique `VOYZU_AUTH_SECRET`. Preserve that value: Voyzu uses it to sign and verify authentication session cookies.

{% hint style="warning" %}
Do not commit `.env.local` or disclose its contents.
{% endhint %}

## 6. Initialize Voyzu and create the bootstrap administrator

Initialize the preinstalled Voyzu packages and create the bootstrap administrator:

```shell
npm run voyzu:initialize
```

The local bootstrap credentials are:

```
User code: ADMIN
Password:  password
```

{% hint style="danger" %}
The bootstrap administrator is only for initial setup. Sign in, create a named administrator with a strong unique password, verify that account can sign in, and delete the `ADMIN` user before exposing Voyzu to other users or a network.
{% endhint %}

## 7. Optionally install the Voyzu Ice Creams example package

Voyzu Ice Creams is a simple package for managing ice cream flavours. It is a best-practice example that illustrates many Voyzu patterns.

Install it from the official package repository:

```shell
npm run voyzu:install -- https://github.com/chrisjameslennon/voyzu-packages.git @voyzu/ice-creams
```

The repository is downloaded into `.package-sources/voyzu-packages`. The package is copied into `.run/packages/@voyzu/ice-creams`; it is not linked into the local `packages/` development workspace.

Start Voyzu:

```shell
npm run voyzu:dev
```

Browse to `http://localhost:3000`, sign in using the bootstrap administrator and select **Ice Creams** from the top navigation.

## 8. Write your package

With the development environment set up, it is time to write your package. All packages must:

* Reside in `packages/@publisher/package-name`.
* Include a `package.json` whose `name` exactly matches `@publisher/package-name`.
* Conform to the [Voyzu Package Contract](package-contract.md).
* Contain `voyzu.package.ts`.
* Contain at least one module, with every module conforming to the [Voyzu Module Contract](module-contract.md).

The directory structure and `package.json` name are both authoritative. For example, `packages/@acme/warehousing` must declare `"name": "@acme/warehousing"`.

Follow [Develop a new package](develop-a-new-package.md) for a practical walkthrough based on the Voyzu Ice Creams reference package.

## 9. Link your package into the Voyzu Platform

Install a package being developed locally into the runtime:

```shell
npm run voyzu:link-package -- @acme/warehousing
```

The command retains its existing name, but creates an ordinary physical runtime copy:

```
packages/@acme/warehousing       editable source
.run/packages/@acme/warehousing  physical runtime copy
```

The command installs workspace dependencies, applies the package's database installation and composes it into Voyzu.&#x20;

## 10. Run Voyzu

```bash
npm run voyzu:dev
## or simply
npm run dev
```

&#x20;This will start the Next.js development server. Hot reloading is enabled, so any change you make to your package in `/packages` will be automatically mirrored into the `.run` directory and will appear in the application.

Run composition again after structural changes such as adding modules, routes, navigation or package exports:

```shell
npm run voyzu:compose
```

To install every active package beneath the local `packages/` directory for watched development, run:

```shell
npm run voyzu:link-packages
```

## 11. Install your package

Voyzu packages are installed directly from GitHub, so they do not require an npm publishing step. Commit and push a conforming package to a Git repository using the standard `packages/@publisher/package-name` structure.

Then rom the root of an existing [production Voyzu installation](../installation-and-operation/installation-and-setup.md), you can install it with:

```shell
npm run voyzu:install -- https://github.com/{owner}/{repository}.git @publisher/package-name
```

The command downloads or refreshes the repository, copies the selected package into `.run/packages`, applies its database installation and composes it into Voyzu.

You must have Git access to the repository when the package is not public.

## 12. Publish your package

Voyzu packages are installed directly from GitHub, so they do not require an npm publishing step. All that is required to publish your package is to make your directory public.

If you think your package may benefit other users of the Voyzu platform, raise a Github issue.

## Further reading

For all package and platform commands, see [Voyzu commands](commands.md).
