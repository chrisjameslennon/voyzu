# Production installation and setup

{% hint style="info" %}
This is a production-style installation. Voyzu and installed packages are downloaded and copied into an isolated `.run` runtime.

To develop Voyzu packages using a `.run` development runtime, directory links and hot reload, see [Development setup](../voyzu-platform-guide/development-setup.md).
{% endhint %}

## Install Voyzu

Follow these step-by-step instructions to install the Voyzu platform and the Core modules.

### 1. Prerequisites

Install:

* **Node.js**: Node.js 20.9.0 or later. Voyzu is currently developed and tested with Node.js 24.
* **npm**: installed with Node.js.
* **PostgreSQL**: a local or network PostgreSQL server accessible to the application.
* **Git**: used by the installer and package update commands.

Confirm the commands are available:

```shell
node -v
npm -v
psql --version
git --version
```

### 2. Create the PostgreSQL database

Create an empty PostgreSQL database for the installation. The examples in this guide use the name `voyzu`:

```shell
createdb voyzu
```

Record the database host, port, database name, username and password. The installation command does not create the PostgreSQL database itself.

### 3. Create the Voyzu installation

Choose a parent directory, then run:

```shell
npm exec --allow-git=all --yes --package=github:chrisjameslennon/create-voyzu -- create-voyzu install my-voyzu
```

The command is the same in PowerShell, macOS and Linux shells.

The `--allow-git=all` option permits this command to download the installer from GitHub. npm 12 blocks Git-based packages by default. The permission applies to this invocation and does not change your persistent npm configuration.

Production installation creates a new project and requires an empty target directory. The install command does not use `--force`; that option is reserved for recreating a development `.run` runtime.

`create-voyzu` always downloads the Voyzu Platform from its `main` branch.
Platform branch and tag overrides are not supported.

Move into the generated project:

```shell
cd my-voyzu
```

### 4. Configure the environment

Open `.env.local` in the generated project root. Replace `CHANGE_ME` in `VOYZU_DATABASE_URL`:

```env
VOYZU_DATABASE_URL=postgresql://postgres:your-password@localhost:5432/voyzu
```

If the database password contains reserved URL characters, URL-encode it.

The installer has already generated a unique authentication secret:

```env
VOYZU_AUTH_SECRET=<generated-base64url-value>
```

Voyzu uses this value to sign and verify authentication session cookies. If it is omitted or does not decode to at least 32 bytes, Voyzu refuses to authenticate requests. Do not replace it with a memorable password or reuse it between Voyzu instances.

The production installer creates `.env.local` only during the virgin installation. Voyzu package and update commands do not overwrite it.

{% hint style="warning" %}
Do not commit `.env.local` or disclose its contents. Restrict access to the database account and use a secret-management mechanism appropriate to the deployment environment.
{% endhint %}

### 5. Initialize Voyzu

After configuring `.env.local`, initialize Voyzu's Authentication and Audit modules:

```shell
npm run voyzu:initialize
```

This is a one-time initialization step for a new Voyzu installation.

### 6. Install the Voyzu Core package

At this point you have successfully installed the Voyzu platform!

The next step is to install the Core Voyzu Organization and Finance package.

```shell
npm run voyzu:install https://github.com/chrisjameslennon/voyzu-packages.git @voyzu/core
```

The install command downloads the Voyzu Packages repository into `.package-sources`, copies Core into `.run/packages/@voyzu/core`, applies its database installation, installs its npm dependencies and recomposes the application.

### 7. Start the production application

Run:

```shell
npm run voyzu:start
```

By default the application listens on:

```
http://localhost:3000
```

Browse to `http://localhost:3000` and sign in using the bootstrap administrator.

`npm run voyzu:initialize` creates the bootstrap administrator automatically when the user table is empty:

```
User code: ADMIN
Password:  password
```

{% hint style="danger" %}
The bootstrap administrator is only for initial setup. Sign in, create a named administrator with a strong unique password, verify that account can sign in, and delete the `ADMIN` user before exposing Voyzu to other users or a network.
{% endhint %}

{% hint style="info" %}
Congratulations! You have successfully installed Voyzu. Online help is available by clicking the help (?) icon in the top-right of Voyzu.
{% endhint %}

### Deployment and Hosting

If you are hosting a Voyzu instance you will want to run Voyzu behind your hosting platform's process manager and an HTTPS reverse proxy. See [Deployment](deployment/).

## Updating installed packages

To update an installed package, run its original install command again. For example, to update Voyzu Core:

```shell
npm run voyzu:install https://github.com/chrisjameslennon/voyzu-packages.git @voyzu/core
```

The command refreshes the downloaded repository, replaces the installed package copy, applies its installation steps, installs its dependencies and recomposes the application.

Restart Voyzu to build and run the updated application:

```shell
npm run voyzu:start
```

## Updating the Voyzu platform

To update the Voyzu Platform itself, run:

```shell
npm run voyzu:update
```

Production updates always fast-forward the installed platform from `main`.
Development updates use `voyzu.platform.branch` from the installation's root
`package.json`, switching the transient checkout to that branch when needed.

Restart Voyzu after the update:

```shell
npm run voyzu:start
```

## Common checks

If installation, build or startup fails, check:

* PostgreSQL is running and accepts connections from the application host.
* The database named in `VOYZU_DATABASE_URL` exists.
* The database username, password, host and port are correct.
* `.env.local` is in the project root.
* GitHub and the npm registry are reachable during installation.
* `npm run voyzu:initialize` completed successfully and created the bootstrap administrator.
* Commands are being run from the generated project root.

To test the configured database connection independently, run this from the generated project root:

```shell
npm --prefix .run exec -- tsx --env-file=.env.local .run/voyzu/scripts/db/util/test-connection.ts
```

The command uses `VOYZU_DATABASE_URL` from the root `.env.local` file and prints the database time when the connection succeeds. A failure indicates a database availability, database existence or connection-string problem rather than an application startup problem.

For the complete command reference, see [Voyzu commands](../voyzu-platform-guide/commands.md).
