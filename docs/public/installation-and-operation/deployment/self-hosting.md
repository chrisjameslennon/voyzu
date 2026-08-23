# Self Hosting

{% hint style="warning" %}
Self-hosting Voyzu is currently untested. Treat this guide and the deployment
command as a best-effort starting point, validate the installation in a
non-production environment, and raise a GitHub issue if you encounter problems.
{% endhint %}

This guide deploys Voyzu from scratch to a single Linux server. It uses:

* PostgreSQL for the database
* systemd to run Voyzu
* Nginx as the public reverse proxy
* Certbot for HTTPS certificates

The commands below target a current Ubuntu or Debian server. The same layout works on other systemd-based distributions, but package installation commands will differ.

## 1. Prepare a server and domain

Create a server with a stable public IP address and enough memory and disk for Node.js, a production build, PostgreSQL, and database backups.

At the network firewall, allow inbound traffic on:

* `22/tcp` for SSH, or your chosen SSH port
* `80/tcp` for HTTP and the initial certificate challenge
* `443/tcp` for HTTPS

Do not expose the Voyzu application port (`3000`) or PostgreSQL (`5432`) to the internet.

Create an `A` record for the Voyzu hostname that points to the server. Add an `AAAA` record only when the server has working public IPv6. The examples below use `voyzu.example.com`; replace it with your hostname.

Confirm DNS before requesting a certificate:

```bash
dig +short voyzu.example.com
```

## 2. Create the deployment user

Connect using the initial account supplied with the server. Create a dedicated account and copy the current account's authorized SSH keys:

```bash
sudo adduser --disabled-password --gecos "" voyzu
sudo usermod -aG sudo voyzu
sudo install -d -m 0700 -o voyzu -g voyzu /home/voyzu/.ssh
sudo cp "$HOME/.ssh/authorized_keys" /home/voyzu/.ssh/authorized_keys
sudo chown voyzu:voyzu /home/voyzu/.ssh/authorized_keys
sudo chmod 0600 /home/voyzu/.ssh/authorized_keys
```

The deployment script installs the environment file and systemd service, so this account requires non-interactive sudo:

```bash
echo 'voyzu ALL=(ALL) NOPASSWD: ALL' | sudo tee /etc/sudoers.d/voyzu-deploy
sudo chmod 0440 /etc/sudoers.d/voyzu-deploy
sudo visudo -cf /etc/sudoers.d/voyzu-deploy
```

Protect this account's SSH key as a privileged deployment credential. Test a new connection before closing the original session:

```bash
ssh voyzu@voyzu.example.com
sudo -n true
```

## 3. Install server software

On the server, install the base packages, PostgreSQL, Nginx, and Snap support for Certbot:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y ca-certificates curl git nginx openssl postgresql postgresql-client snapd
sudo systemctl enable --now nginx postgresql
```

Voyzu requires Node.js 20.9 or newer and is currently developed against Node.js 24. Install Node.js system-wide so it is available to non-interactive SSH and systemd sessions. For example, using the NodeSource Debian/Ubuntu packages:

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x -o /tmp/nodesource_setup.sh
sudo -E bash /tmp/nodesource_setup.sh
sudo apt install -y nodejs
```

Verify the installed tools:

```bash
node --version
npm --version
git --version
psql --version
nginx -v
```

If the server uses UFW, allow SSH before enabling it:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

For a non-standard SSH port, allow that port explicitly instead of relying on the `OpenSSH` profile.

## 4. Create the PostgreSQL database

Keep PostgreSQL bound to the local server. Generate a strong password; hexadecimal output is convenient because it does not need URL encoding in the connection string:

```bash
openssl rand -hex 24
sudo -u postgres psql
```

In `psql`, create the application role and database, replacing the example password:

```sql
CREATE ROLE voyzu_app WITH LOGIN PASSWORD 'replace-with-generated-password';
CREATE DATABASE voyzu OWNER voyzu_app;
\q
```

Test password authentication locally:

```bash
psql 'postgresql://voyzu_app:replace-with-generated-password@127.0.0.1:5432/voyzu' -c 'select current_database();'
```

## 5. Create the production environment file

On the computer from which deployments will run, create a file outside the repository, for example `voyzu.production.env`:

```env
VOYZU_DATABASE_URL=postgresql://voyzu_app:replace-with-generated-password@127.0.0.1:5432/voyzu
VOYZU_AUTH_SECRET=<generated-base64url-value>
```

When this environment is not based on a `create-voyzu` installation, generate the authentication secret with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Voyzu has no default authentication secret and rejects missing values or values that decode to fewer than 32 bytes. The file must use shell-compatible `KEY=VALUE` syntax. Keep it out of Git and restrict local access to it. Add optional capability configuration to the same file when required.

## 6. Deploy Voyzu

Run deployments from a local Voyzu repository. If you do not already have one:

```bash
git clone --branch main --single-branch https://github.com/chrisjameslennon/voyzu.git
cd voyzu
npm ci
```

The deployment script creates a production Voyzu installation using
`create-voyzu`. The platform is downloaded from
the `main` branch of `https://github.com/chrisjameslennon/voyzu.git`.

First inspect the plan without connecting:

```bash
npm run deploy -- \
  --host voyzu.example.com \
  --user voyzu \
  --env-file /secure/path/voyzu.production.env \
  --dry-run
```

Then deploy:

```bash
npm run deploy -- \
  --host voyzu.example.com \
  --user voyzu \
  --env-file /secure/path/voyzu.production.env
```

On Windows PowerShell, enter the command on one line or use PowerShell backticks instead of backslashes.

The script:

1. Uploads the environment to `/etc/voyzu/voyzu.env` with restricted permissions.
2. Stops an existing Voyzu service before changing its runtime.
3. Creates `/home/voyzu/voyzu` as a production installation on the first run,
   or fast-forwards its platform checkout on later runs.
4. Checks the configured database and applies the preinstalled platform
   installation when it has not yet been initialized.
5. Installs or updates `@voyzu/finance`, including its database installation and
   composed application registrations.
6. Builds the composed web application and prunes development dependencies.
7. Installs and enables `voyzu.service` under systemd.
8. Starts Voyzu on `127.0.0.1:3000` and performs a local health check.

The deployed directory is an installation root. Its platform checkout is at
`/home/voyzu/voyzu/.run/voyzu`, and installed packages are beneath
`/home/voyzu/voyzu/.run/packages`.

The platform checkout must be clean apart from composition output managed by
Voyzu. Use `--help` to see options for an SSH key, SSH port, service name,
deployment directory, or application port:

```bash
npm run deploy -- --help
```

Voyzu uses Puppeteer for PDF generation. Dependency installation downloads the
browser as the deployment user. On a new Debian or Ubuntu server, also install
the browser's operating-system dependencies. Keep Puppeteer's cache under the
service user's home directory:

```bash
ssh voyzu@voyzu.example.com
sudo env HOME=/home/voyzu PUPPETEER_CACHE_DIR=/home/voyzu/.cache/puppeteer \
  /home/voyzu/voyzu/.run/node_modules/.bin/puppeteer \
  browsers install chrome-headless-shell --install-deps
sudo chown -R voyzu:voyzu /home/voyzu/.cache/puppeteer
```

This is a host setup step and does not need to run with every deployment.

## 7. Verify initialization

The deployment command initializes the preinstalled platform packages and
installs Finance before starting the service. For a new empty database it also
creates the bootstrap administrator:

```text
User code: ADMIN
Password:  password
```

Confirm the generated installation, Finance package, database connection, and
service:

```bash
ssh voyzu@voyzu.example.com
cd /home/voyzu/voyzu
sudo systemctl status voyzu
set -a
. /etc/voyzu/voyzu.env
set +a
npm run voyzu:list-packages
curl --fail http://127.0.0.1:3000/ >/dev/null
```

Sign in through the HTTPS endpoint after completing the proxy configuration.
Create a named administrator with a strong unique password, verify that account
can sign in, and delete the bootstrap `ADMIN` user before allowing normal
access.

## 8. Configure Nginx

The repository includes an example site at `infra/deploy/nginx.conf.example`. Copy it to the server:

```bash
scp infra/deploy/nginx.conf.example voyzu@voyzu.example.com:/tmp/voyzu.nginx.conf
ssh voyzu@voyzu.example.com
sudo cp /tmp/voyzu.nginx.conf /etc/nginx/sites-available/voyzu
sudo editor /etc/nginx/sites-available/voyzu
```

Replace `voyzu.example.com` if necessary. If the deployment used a different application port, update the `proxy_pass` port as well.

Enable the site and remove the default site:

```bash
sudo ln -s /etc/nginx/sites-available/voyzu /etc/nginx/sites-enabled/voyzu
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
curl --head http://voyzu.example.com/
```

Nginx is the only public application endpoint. It forwards the original host, scheme, and client address to Voyzu and disables response buffering so Next.js streaming responses are not held by the proxy.

## 9. Enable HTTPS with Certbot

The hostname must resolve publicly to this server and port `80` must be reachable before this step. Install Certbot using its recommended Snap package:

```bash
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/local/bin/certbot
```

Request the certificate and allow Certbot to update the Nginx site:

```bash
sudo certbot --nginx -d voyzu.example.com
sudo nginx -t
sudo systemctl reload nginx
```

Choose the HTTP-to-HTTPS redirect when prompted. Confirm renewal works:

```bash
sudo certbot renew --dry-run
```

Finally, browse to `https://voyzu.example.com`, sign in, and replace or disable all seeded credentials.

## 10. Operate and update Voyzu

Inspect the application and proxy:

```bash
sudo systemctl status voyzu
sudo journalctl -u voyzu -n 100 --no-pager
sudo tail -n 100 /var/log/nginx/voyzu.error.log
curl --head http://127.0.0.1:3000/
```

For later releases, rerun the deployment command. It fast-forwards the platform,
updates Finance from the Voyzu Packages repository, rebuilds the composed
application, and restarts the service. Omit `--env-file` to retain the existing
remote environment file:

```bash
npm run deploy -- --host voyzu.example.com --user voyzu
```

Back up PostgreSQL before deploying changes that affect the database:

```bash
sudo install -d -m 0700 -o postgres -g postgres /var/backups/voyzu
sudo -u postgres pg_dump --format=custom --file=/var/backups/voyzu/voyzu-$(date +%F).dump voyzu
```

Store backups outside the server and test the restore process. Also keep the operating system, Node.js, PostgreSQL, Nginx, and Certbot patched.

## References

* [Next.js self-hosting guide](https://nextjs.org/docs/app/guides/self-hosting)
* [Nginx proxy module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
* [NodeSource Node.js packages](https://github.com/nodesource/distributions)
* [PostgreSQL packages for Ubuntu](https://www.postgresql.org/download/linux/ubuntu/)
* [Puppeteer installation and troubleshooting](https://pptr.dev/troubleshooting)
* [Certbot instructions for Nginx](https://certbot.eff.org/instructions?ws=nginx\&os=snap)
