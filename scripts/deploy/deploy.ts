import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const PLATFORM_REPOSITORY_URL = "https://github.com/chrisjameslennon/voyzu.git";
const CREATE_VOYZU_PACKAGE = "github:chrisjameslennon/create-voyzu";
const FINANCE_REPOSITORY_URL = "https://github.com/chrisjameslennon/voyzu-packages.git";
const FINANCE_PACKAGE_NAME = "@voyzu/finance";

interface DeploymentOptions {
  host: string;
  user: string;
  deployDir: string;
  serviceName: string;
  port: number;
  sshPort?: number;
  identityFile?: string;
  localEnvFile?: string;
  remoteEnvFile: string;
  dryRun: boolean;
}

function usage() {
  console.log(`Deploy a production Voyzu installation and Finance package to a self-hosted Linux server.

Usage:
  npm run deploy -- --host <hostname> [options]

Required:
  --host <hostname>          SSH hostname, address, or configured alias

Options:
  --user <name>              Remote service user (default: ubuntu)
  --deploy-dir <path>        Remote checkout (default: /home/<user>/voyzu)
  --service-name <name>      systemd service name (default: voyzu)
  --port <number>            Next.js application port (default: 3000)
  --ssh-port <number>        SSH port
  --identity <path>          SSH private key
  --env-file <path>          Local environment file to upload securely
  --remote-env-file <path>   Remote systemd environment file
                              (default: /etc/voyzu/voyzu.env)
  --dry-run                  Validate and print the deployment plan only
  --help                     Show this help

The remote environment file must define VOYZU_DATABASE_URL. If --env-file is
omitted, the existing remote environment file is retained and validated.`);
}

function optionValue(args: string[], index: number, option: string) {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${option} requires a value.`);
  }
  return value;
}

function parsePort(value: string, option: string) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${option} must be an integer between 1 and 65535.`);
  }
  return port;
}

function validateSafeName(value: string, option: string, pattern: RegExp) {
  if (!pattern.test(value)) {
    throw new Error(`${option} contains unsupported characters: ${value}`);
  }
  return value;
}

function parseArgs(argv: string[]): DeploymentOptions | undefined {
  if (argv.includes("--help")) {
    usage();
    return undefined;
  }

  let host = "";
  let user = "ubuntu";
  let deployDir: string | undefined;
  let serviceName = "voyzu";
  let port = 3000;
  let sshPort: number | undefined;
  let identityFile: string | undefined;
  let localEnvFile: string | undefined;
  let remoteEnvFile = "/etc/voyzu/voyzu.env";
  let dryRun = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case "--host":
        host = optionValue(argv, index, argument);
        index += 1;
        break;
      case "--user":
        user = optionValue(argv, index, argument);
        index += 1;
        break;
      case "--deploy-dir":
        deployDir = optionValue(argv, index, argument);
        index += 1;
        break;
      case "--service-name":
        serviceName = optionValue(argv, index, argument);
        index += 1;
        break;
      case "--port":
        port = parsePort(optionValue(argv, index, argument), argument);
        index += 1;
        break;
      case "--ssh-port":
        sshPort = parsePort(optionValue(argv, index, argument), argument);
        index += 1;
        break;
      case "--identity":
        identityFile = resolve(optionValue(argv, index, argument));
        index += 1;
        break;
      case "--env-file":
        localEnvFile = resolve(optionValue(argv, index, argument));
        index += 1;
        break;
      case "--remote-env-file":
        remoteEnvFile = optionValue(argv, index, argument);
        index += 1;
        break;
      case "--dry-run":
        dryRun = true;
        break;
      default:
        throw new Error(`Unknown option: ${argument}`);
    }
  }

  if (!host) throw new Error("--host is required.");
  serviceName = serviceName.replace(/\.service$/, "");
  validateSafeName(host, "--host", /^[a-z0-9][a-z0-9.:-]*$/i);
  validateSafeName(user, "--user", /^[a-z_][a-z0-9_-]*$/);
  validateSafeName(serviceName, "--service-name", /^[a-z0-9][a-z0-9_.@-]*$/i);

  const resolvedDeployDir = deployDir ?? `/home/${user}/voyzu`;
  if (!resolvedDeployDir.startsWith("/")) {
    throw new Error("--deploy-dir must be an absolute path.");
  }
  if (/\s/.test(resolvedDeployDir)) {
    throw new Error("--deploy-dir cannot contain whitespace.");
  }
  if (!remoteEnvFile.startsWith("/")) {
    throw new Error("--remote-env-file must be an absolute path.");
  }
  if (/\s/.test(remoteEnvFile)) {
    throw new Error("--remote-env-file cannot contain whitespace.");
  }
  if (identityFile && !existsSync(identityFile)) {
    throw new Error(`SSH identity file does not exist: ${identityFile}`);
  }
  if (localEnvFile && !existsSync(localEnvFile)) {
    throw new Error(`Environment file does not exist: ${localEnvFile}`);
  }

  return {
    host,
    user,
    deployDir: resolvedDeployDir,
    serviceName,
    port,
    sshPort,
    identityFile,
    localEnvFile,
    remoteEnvFile,
    dryRun,
  };
}

function shellQuote(value: string) {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

function environmentFilePayload(path: string | undefined) {
  if (!path) return "";
  const contents = readFileSync(path, "utf8").replaceAll("\r\n", "\n");
  if (!/^\s*VOYZU_DATABASE_URL\s*=/m.test(contents)) {
    throw new Error(`${path} must define VOYZU_DATABASE_URL.`);
  }
  if (!/^\s*VOYZU_AUTH_SECRET\s*=/m.test(contents)) {
    throw new Error(`${path} must define VOYZU_AUTH_SECRET.`);
  }
  return Buffer.from(contents, "utf8").toString("base64");
}

function remoteScript(options: DeploymentOptions, envPayload: string) {
  const variables = [
    `PLATFORM_REPOSITORY_URL=${shellQuote(PLATFORM_REPOSITORY_URL)}`,
    `CREATE_VOYZU_PACKAGE=${shellQuote(CREATE_VOYZU_PACKAGE)}`,
    `FINANCE_REPOSITORY_URL=${shellQuote(FINANCE_REPOSITORY_URL)}`,
    `FINANCE_PACKAGE_NAME=${shellQuote(FINANCE_PACKAGE_NAME)}`,
    `DEPLOY_DIR=${shellQuote(options.deployDir)}`,
    `SERVICE_NAME=${shellQuote(options.serviceName)}`,
    `SERVICE_USER=${shellQuote(options.user)}`,
    `APP_PORT=${shellQuote(String(options.port))}`,
    `ENV_FILE=${shellQuote(options.remoteEnvFile)}`,
    `ENV_PAYLOAD=${shellQuote(envPayload)}`,
  ].join("\n");

  return `set -Eeuo pipefail

${variables}

log() { printf '\\n[voyzu-deploy] %s\\n' "$1"; }
fail() { printf '\\n[voyzu-deploy] ERROR: %s\\n' "$1" >&2; exit 1; }

for command in git node npm curl psql sudo base64 systemctl; do
  command -v "$command" >/dev/null 2>&1 || fail "Required command is not installed: $command"
done

node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit(major > 20 || (major === 20 && minor >= 9) ? 0 : 1)' || \
  fail "Voyzu requires Node.js 20.9 or newer; found $(node --version)."

sudo -n true >/dev/null 2>&1 || fail "The SSH user requires passwordless sudo for systemd deployment."
id "$SERVICE_USER" >/dev/null 2>&1 || fail "Service user does not exist: $SERVICE_USER"

if [ -n "$ENV_PAYLOAD" ]; then
  log "Installing environment file at $ENV_FILE"
  service_group="$(id -gn "$SERVICE_USER")"
  sudo install -d -m 0750 -o root -g "$service_group" "$(dirname "$ENV_FILE")"
  printf '%s' "$ENV_PAYLOAD" | base64 --decode | sudo tee "$ENV_FILE" >/dev/null
  sudo chown root:"$service_group" "$ENV_FILE"
  sudo chmod 0640 "$ENV_FILE"
fi

sudo -u "$SERVICE_USER" test -r "$ENV_FILE" || \
  fail "Environment file is missing or unreadable by $SERVICE_USER: $ENV_FILE"
sudo grep -Eq '^[[:space:]]*VOYZU_DATABASE_URL[[:space:]]*=' "$ENV_FILE" || \
  fail "Environment file must define VOYZU_DATABASE_URL: $ENV_FILE"
sudo grep -Eq '^[[:space:]]*VOYZU_AUTH_SECRET[[:space:]]*=' "$ENV_FILE" || \
  fail "Environment file must define VOYZU_AUTH_SECRET: $ENV_FILE"

set -a
# The deployment environment file must use shell-compatible KEY=VALUE syntax.
. "$ENV_FILE"
set +a
export NODE_ENV=production

if sudo systemctl cat "$SERVICE_NAME.service" >/dev/null 2>&1; then
  log "Stopping $SERVICE_NAME before changing the runtime"
  sudo systemctl stop "$SERVICE_NAME"
fi

if [ ! -f "$DEPLOY_DIR/.run/package.json" ]; then
  if [ -e "$DEPLOY_DIR" ] && [ "$(find "$DEPLOY_DIR" -mindepth 1 -maxdepth 1 -print -quit)" ]; then
    fail "Deploy directory exists and is not an empty Voyzu installation: $DEPLOY_DIR"
  fi
  log "Creating a production Voyzu installation in $DEPLOY_DIR"
  mkdir -p "$(dirname "$DEPLOY_DIR")"
  VOYZU_REPOSITORY="$PLATFORM_REPOSITORY_URL" \
    npm exec --yes --package="$CREATE_VOYZU_PACKAGE" -- \
    create-voyzu install "$DEPLOY_DIR"
else
  platform_dir="$DEPLOY_DIR/.run/voyzu"
  [ -d "$platform_dir/.git" ] || fail "Voyzu platform checkout is missing: $platform_dir"
  current_origin="$(git -C "$platform_dir" remote get-url origin)"
  [ "$current_origin" = "$PLATFORM_REPOSITORY_URL" ] || \
    fail "Unexpected Voyzu platform origin URL: $current_origin"
  log "Updating the Voyzu platform"
  cd "$DEPLOY_DIR"
  npm run voyzu:update
fi

cd "$DEPLOY_DIR"
platform_initialized="$(psql "$VOYZU_DATABASE_URL" -Atqc "SELECT to_regclass('public.app_user') IS NOT NULL")" || \
  fail "Could not inspect the Voyzu database."
if [ "$platform_initialized" != "t" ]; then
  log "Applying the preinstalled Voyzu platform database installation"
  npm run voyzu:initialize
fi

log "Installing or updating $FINANCE_PACKAGE_NAME"
npm run voyzu:install "$FINANCE_REPOSITORY_URL" "$FINANCE_PACKAGE_NAME"

log "Building the composed Voyzu application"
npm run voyzu:build

log "Removing development-only dependencies"
(cd .run && npm prune --omit=dev)

npm_bin="$(command -v npm)"
node_bin_dir="$(dirname "$(command -v node)")"
service_path="/etc/systemd/system/$SERVICE_NAME.service"

log "Installing systemd service $SERVICE_NAME"
sudo tee "$service_path" >/dev/null <<UNIT
[Unit]
Description=Voyzu web application
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$(id -gn "$SERVICE_USER")
WorkingDirectory=$DEPLOY_DIR
Environment=NODE_ENV=production
Environment="PATH=$node_bin_dir:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
EnvironmentFile=$ENV_FILE
ExecStart=$npm_bin --prefix $DEPLOY_DIR/.run --workspace @voyzu/web run start:port -- -H 127.0.0.1 -p $APP_PORT
Restart=on-failure
RestartSec=5
KillSignal=SIGINT
TimeoutStopSec=30
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME" >/dev/null
sudo systemctl restart "$SERVICE_NAME"

log "Waiting for Voyzu on http://127.0.0.1:$APP_PORT"
for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error --max-time 5 "http://127.0.0.1:$APP_PORT/" >/dev/null; then
    deployed_commit="$(git rev-parse --short HEAD)"
    log "Deployment complete: commit $deployed_commit, service $SERVICE_NAME"
    sudo systemctl --no-pager --full status "$SERVICE_NAME" | sed -n '1,8p'
    exit 0
  fi
  sleep 2
done

sudo systemctl --no-pager --full status "$SERVICE_NAME" || true
sudo journalctl -u "$SERVICE_NAME" --no-pager -n 50 || true
fail "Health check failed after 60 seconds."
`;
}

function runSsh(options: DeploymentOptions, script: string) {
  const args = ["-o", "BatchMode=yes"];
  if (options.sshPort) args.push("-p", String(options.sshPort));
  if (options.identityFile) args.push("-i", options.identityFile);
  args.push(`${options.user}@${options.host}`, "bash", "-se");

  return new Promise<void>((resolvePromise, reject) => {
    const child = spawn("ssh", args, { stdio: ["pipe", "inherit", "inherit"] });
    child.on("error", (error) => reject(new Error(`Could not start ssh: ${error.message}`)));
    child.on("exit", (code, signal) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`Remote deployment failed (${signal ?? `exit ${code ?? "unknown"}`}).`));
    });
    child.stdin.end(script);
  });
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (!options) return;

    const envPayload = environmentFilePayload(options.localEnvFile);
    console.log("Voyzu self-host deployment");
    console.log(`  repository:  ${PLATFORM_REPOSITORY_URL}`);
    console.log(`  finance:     ${FINANCE_PACKAGE_NAME} from ${FINANCE_REPOSITORY_URL}`);
    console.log(`  target:      ${options.user}@${options.host}`);
    console.log(`  deploy dir:  ${options.deployDir}`);
    console.log(`  service:     ${options.serviceName}`);
    console.log(`  port:        ${options.port}`);
    console.log(`  environment: ${options.remoteEnvFile}${options.localEnvFile ? " (upload)" : " (existing)"}`);

    if (options.dryRun) {
      console.log("\nDry run complete. No SSH connection was made.");
      return;
    }

    await runSsh(options, remoteScript(options, envPayload));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

await main();
