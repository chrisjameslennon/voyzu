import "server-only";

import { execFile } from "node:child_process";
import { access, readFile, stat, statfs } from "node:fs/promises";
import os from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { promisify } from "node:util";

import { getDb, getPool } from "@voyzu/capability/db";

const execFileAsync = promisify(execFile);

interface PackageManifest {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  voyzu?: { mode?: string };
}

export interface InfoItem {
  label: string;
  value: string;
  mono?: boolean;
}

export interface InfoSection {
  title: string;
  items: InfoItem[];
}

export interface SystemInformation {
  generatedAt: string;
  sections: InfoSection[];
}

interface LockInformation {
  path: string;
  kind: "Development" | "Production";
  modifiedAt: string;
  size: number;
  contents: string;
  pid?: number;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readJson(path: string): Promise<PackageManifest | undefined> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as PackageManifest;
  } catch {
    return undefined;
  }
}

async function findPlatformRoot(start = process.cwd()): Promise<string> {
  if (process.env.VOYZU_PLATFORM_ROOT) return resolve(process.env.VOYZU_PLATFORM_ROOT);
  let current = resolve(start);
  while (true) {
    const manifest = await readJson(join(current, "package.json"));
    if (manifest?.name === "voyzu") return current;
    const parent = dirname(current);
    if (parent === current) return resolve(start);
    current = parent;
  }
}

function installationPaths(platformRoot: string) {
  const parent = dirname(platformRoot);
  const installed = basename(parent) === ".run";
  const runtimeRoot = installed ? parent : platformRoot;
  const instanceRoot = installed ? dirname(parent) : platformRoot;
  const webRoot = join(platformRoot, "apps", "web");
  return { installed, runtimeRoot, instanceRoot, platformRoot, webRoot };
}

function formatBytes(value: number): string {
  if (!Number.isFinite(value)) return "Unavailable";
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  let amount = value;
  let index = 0;
  while (amount >= 1024 && index < units.length - 1) {
    amount /= 1024;
    index += 1;
  }
  return `${amount.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts = [days ? `${days}d` : "", hours ? `${hours}h` : "", `${minutes}m`].filter(Boolean);
  return parts.join(" ");
}

function percentage(part: number, total: number): string {
  return total > 0 ? `${((part / total) * 100).toFixed(1)}%` : "Unavailable";
}

function networkAddresses(): string {
  const addresses = Object.entries(os.networkInterfaces()).flatMap(([name, entries]) =>
    (entries ?? [])
      .filter(({ internal }) => !internal)
      .map(({ address, family }) => `${name}: ${address} (${family})`),
  );
  return addresses.length ? addresses.join("; ") : "None detected";
}

async function filesystemItems(path: string): Promise<InfoItem[]> {
  try {
    const filesystem = await statfs(path);
    const total = filesystem.bsize * filesystem.blocks;
    const free = filesystem.bsize * filesystem.bfree;
    const available = filesystem.bsize * filesystem.bavail;
    const used = total - free;
    return [
      { label: "Voyzu filesystem location", value: path, mono: true },
      { label: "Total storage", value: formatBytes(total) },
      { label: "Used storage", value: `${formatBytes(used)} (${percentage(used, total)})` },
      { label: "Available storage", value: formatBytes(available) },
    ];
  } catch {
    return [{ label: "Storage", value: "Filesystem information is unavailable" }];
  }
}

async function resolvedPackageVersion(
  packageName: string,
  roots: readonly string[],
): Promise<string> {
  for (const root of roots) {
    const manifest = await readJson(join(root, "node_modules", packageName, "package.json"));
    if (manifest?.version) return manifest.version;
  }
  return "Unavailable";
}

async function readLocks(webRoot: string): Promise<LockInformation[]> {
  const candidates = [
    { kind: "Development" as const, path: join(webRoot, ".next", "dev", "lock") },
    { kind: "Production" as const, path: join(webRoot, ".next", "lock") },
  ];
  const locks: LockInformation[] = [];
  for (const candidate of candidates) {
    if (!(await exists(candidate.path))) continue;
    const [metadata, rawContents] = await Promise.all([
      stat(candidate.path),
      readFile(candidate.path, "utf8").catch(() => ""),
    ]);
    const contents = rawContents.trim();
    let pid: number | undefined;
    try {
      const parsed = JSON.parse(contents) as { pid?: unknown };
      if (typeof parsed.pid === "number" && Number.isInteger(parsed.pid) && parsed.pid > 0) pid = parsed.pid;
    } catch {
      // Some Next.js versions use the lock's presence rather than JSON content.
    }
    locks.push({
      ...candidate,
      modifiedAt: metadata.mtime.toISOString(),
      size: metadata.size,
      contents: contents || "(empty lock file)",
      pid,
    });
  }
  return locks;
}

function processIsRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

async function windowsProcessItems(pid: number): Promise<InfoItem[]> {
  const command = [
    `$process = Get-Process -Id ${pid} -ErrorAction Stop`,
    "$data = [ordered]@{",
    "Name=$process.ProcessName; CPUSeconds=$process.CPU; WorkingSet=$process.WorkingSet64; PrivateMemory=$process.PrivateMemorySize64; VirtualMemory=$process.VirtualMemorySize64; Threads=$process.Threads.Count; Handles=$process.HandleCount; StartTime=$process.StartTime.ToUniversalTime().ToString('o'); Path=$process.Path",
    "}",
    "$data | ConvertTo-Json -Compress",
  ].join("; ");
  try {
    const { stdout } = await execFileAsync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", command], {
      timeout: 3000,
      windowsHide: true,
    });
    const data = JSON.parse(stdout) as Record<string, unknown>;
    return [
      { label: "Lock process name", value: String(data.Name ?? "Unavailable") },
      { label: "Lock process CPU time", value: `${Number(data.CPUSeconds ?? 0).toFixed(2)} seconds` },
      { label: "Lock process working set", value: formatBytes(Number(data.WorkingSet)) },
      { label: "Lock process private memory", value: formatBytes(Number(data.PrivateMemory)) },
      { label: "Lock process virtual memory", value: formatBytes(Number(data.VirtualMemory)) },
      { label: "Lock process threads", value: String(data.Threads ?? "Unavailable") },
      { label: "Lock process handles", value: String(data.Handles ?? "Unavailable") },
      { label: "Lock process started", value: String(data.StartTime ?? "Unavailable") },
      { label: "Lock process executable", value: String(data.Path ?? "Unavailable"), mono: true },
    ];
  } catch {
    return [];
  }
}

async function unixProcessItems(pid: number): Promise<InfoItem[]> {
  try {
    const { stdout } = await execFileAsync(
      "ps",
      ["-p", String(pid), "-o", "pid=", "-o", "ppid=", "-o", "user=", "-o", "%cpu=", "-o", "%mem=", "-o", "rss=", "-o", "vsz=", "-o", "etime=", "-o", "stat=", "-o", "command="],
      { timeout: 3000 },
    );
    const match = stdout.trim().match(/^(\d+)\s+(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(\S+)\s+([\s\S]+)$/);
    if (!match) return [];
    return [
      { label: "Lock process parent PID", value: match[2], mono: true },
      { label: "Lock process user", value: match[3] },
      { label: "Lock process CPU", value: `${match[4]}%` },
      { label: "Lock process memory", value: `${match[5]}%` },
      { label: "Lock process resident memory", value: formatBytes(Number(match[6]) * 1024) },
      { label: "Lock process virtual memory", value: formatBytes(Number(match[7]) * 1024) },
      { label: "Lock process elapsed time", value: match[8] },
      { label: "Lock process state", value: match[9], mono: true },
      { label: "Lock process command", value: match[10], mono: true },
    ];
  } catch {
    return [];
  }
}

async function lockProcessItems(lock: LockInformation | undefined): Promise<InfoItem[]> {
  if (!lock?.pid) return [];
  const running = processIsRunning(lock.pid);
  const base: InfoItem[] = [
    { label: "Lock process PID", value: String(lock.pid), mono: true },
    { label: "Lock process running", value: running ? "Yes" : "No" },
  ];
  if (!running || lock.pid === process.pid) return base;
  const details = process.platform === "win32"
    ? await windowsProcessItems(lock.pid)
    : await unixProcessItems(lock.pid);
  return [...base, ...details];
}

async function databaseInformation(): Promise<InfoSection> {
  try {
    const { rows } = await getDb().query(`
      SELECT
        current_database() AS database_name,
        current_user AS database_user,
        session_user AS session_user,
        current_setting('server_version') AS postgres_version,
        version() AS postgres_build,
        current_setting('server_encoding') AS server_encoding,
        current_setting('TimeZone') AS timezone,
        current_setting('max_connections') AS max_connections,
        inet_server_addr()::text AS server_address,
        inet_server_port() AS server_port,
        inet_client_addr()::text AS client_address,
        pg_backend_pid() AS backend_pid,
        pg_is_in_recovery() AS in_recovery,
        pg_database_size(current_database())::bigint::text AS database_size_bytes,
        pg_postmaster_start_time()::text AS server_started_at,
        (now() - pg_postmaster_start_time())::text AS server_uptime,
        (SELECT datcollate FROM pg_database WHERE datname = current_database()) AS collation,
        (SELECT datctype FROM pg_database WHERE datname = current_database()) AS character_type,
        (SELECT numbackends FROM pg_stat_database WHERE datname = current_database()) AS active_connections
    `);
    const row = rows[0] ?? {};
    const pool = getPool();
    const serverAddress = row.server_address
      ? `${String(row.server_address)}${row.server_port ? `:${String(row.server_port)}` : ""}`
      : row.server_port
        ? `Local socket:${String(row.server_port)}`
        : "Local socket or unavailable";
    return {
      title: "Database",
      items: [
        { label: "Database name", value: String(row.database_name ?? "Unavailable"), mono: true },
        { label: "PostgreSQL version", value: String(row.postgres_version ?? "Unavailable") },
        { label: "PostgreSQL build", value: String(row.postgres_build ?? "Unavailable") },
        { label: "Server address", value: serverAddress, mono: true },
        { label: "Client address", value: String(row.client_address ?? "Local socket or unavailable"), mono: true },
        { label: "Database user", value: String(row.database_user ?? "Unavailable"), mono: true },
        { label: "Session user", value: String(row.session_user ?? "Unavailable"), mono: true },
        { label: "Backend PID", value: String(row.backend_pid ?? "Unavailable"), mono: true },
        { label: "Database size", value: formatBytes(Number(row.database_size_bytes)) },
        { label: "Server started", value: String(row.server_started_at ?? "Unavailable") },
        { label: "Server uptime", value: String(row.server_uptime ?? "Unavailable") },
        { label: "Recovery / standby mode", value: row.in_recovery === true ? "Yes" : "No" },
        { label: "Active database connections", value: String(row.active_connections ?? "Unavailable") },
        { label: "Maximum connections", value: String(row.max_connections ?? "Unavailable") },
        { label: "Connection pool total / idle / waiting", value: `${pool.totalCount} / ${pool.idleCount} / ${pool.waitingCount}` },
        { label: "Server encoding", value: String(row.server_encoding ?? "Unavailable") },
        { label: "Collation", value: String(row.collation ?? "Unavailable"), mono: true },
        { label: "Character type", value: String(row.character_type ?? "Unavailable"), mono: true },
        { label: "Timezone", value: String(row.timezone ?? "Unavailable") },
      ],
    };
  } catch (error) {
    return {
      title: "Database",
      items: [
        { label: "Status", value: "Database information is unavailable" },
        { label: "Reason", value: error instanceof Error ? error.message : String(error) },
      ],
    };
  }
}

export async function getSystemInformation(): Promise<SystemInformation> {
  const platformRoot = await findPlatformRoot();
  const paths = installationPaths(platformRoot);
  const platformManifestPath = join(paths.platformRoot, "package.json");
  const webManifestPath = join(paths.webRoot, "package.json");
  const [platformManifest, locks] = await Promise.all([
    readJson(platformManifestPath),
    readLocks(paths.webRoot),
  ]);
  const resolutionRoots = [paths.webRoot, paths.platformRoot, paths.runtimeRoot];
  const [nextVersion, reactVersion] = await Promise.all([
    resolvedPackageVersion("next", resolutionRoots),
    resolvedPackageVersion("react", resolutionRoots),
  ]);
  const activeLock = locks.sort((left, right) => right.modifiedAt.localeCompare(left.modifiedAt))[0];
  const memory = process.memoryUsage();
  const cpu = process.cpuUsage();
  const resource = process.resourceUsage();
  const cpuSeconds = (cpu.user + cpu.system) / 1_000_000;
  const cpuAverage = process.uptime() > 0 ? cpuSeconds / process.uptime() * 100 : 0;
  const currentUser = os.userInfo();
  const cpus = os.cpus();
  const database = await databaseInformation();
  const storageItems = await filesystemItems(paths.platformRoot);
  const totalMemory = os.totalmem();
  const usedMemory = totalMemory - os.freemem();

  const lockItems = locks.length
    ? locks.flatMap((lock) => [
        { label: `${lock.kind} lock`, value: lock.path, mono: true },
        { label: `${lock.kind} lock modified`, value: lock.modifiedAt },
        { label: `${lock.kind} lock contents`, value: lock.contents, mono: true },
      ])
    : [{ label: "Next.js lock", value: "No development or production lock file found" }];

  return {
    generatedAt: new Date().toISOString(),
    sections: [
      {
        title: "Install",
        items: [
          {
            label: "Workspace mode",
            value: paths.installed
              ? (await readJson(join(paths.instanceRoot, "package.json")))?.voyzu?.mode ?? "Unavailable"
              : "Source",
          },
          { label: "Voyzu version", value: platformManifest?.version ?? "Unavailable" },
          { label: "Node.js version", value: process.version },
          { label: "Next.js version", value: nextVersion },
          { label: "React version", value: reactVersion },
          { label: "Instance root", value: paths.instanceRoot, mono: true },
          { label: "Runtime workspace (.run)", value: paths.runtimeRoot, mono: true },
          { label: "Voyzu platform root", value: paths.platformRoot, mono: true },
          { label: "Web application root", value: paths.webRoot, mono: true },
          { label: "Voyzu package.json", value: platformManifestPath, mono: true },
          { label: "Web package.json", value: webManifestPath, mono: true },
          { label: "Current working directory", value: process.cwd(), mono: true },
        ],
      },
      {
        title: "Process",
        items: [
          { label: "NODE_ENV", value: process.env.NODE_ENV ?? "Not set", mono: true },
          ...lockItems,
          ...(await lockProcessItems(activeLock)),
          { label: "Web server (SSR) PID / parent PID", value: `${process.pid} / ${process.ppid}`, mono: true },
          { label: "Web server (SSR) executable", value: process.execPath, mono: true },
          { label: "Web server (SSR) command", value: process.argv.join(" "), mono: true },
          { label: "Web server (SSR) started", value: new Date(Date.now() - process.uptime() * 1000).toISOString() },
          { label: "Web server (SSR) uptime", value: formatDuration(process.uptime()) },
          { label: "Web server (SSR) CPU time", value: `${cpuSeconds.toFixed(2)} seconds` },
          { label: "Web server (SSR) average CPU", value: `${cpuAverage.toFixed(2)}% of one logical CPU` },
          { label: "Resident memory (RSS)", value: formatBytes(memory.rss) },
          { label: "Heap used / total", value: `${formatBytes(memory.heapUsed)} / ${formatBytes(memory.heapTotal)}` },
          { label: "External / array buffers", value: `${formatBytes(memory.external)} / ${formatBytes(memory.arrayBuffers)}` },
          { label: "Maximum RSS", value: formatBytes(resource.maxRSS * 1024) },
          { label: "Filesystem reads / writes", value: `${resource.fsRead} / ${resource.fsWrite}` },
          { label: "Active resource types", value: [...new Set(process.getActiveResourcesInfo())].sort().join(", ") || "None" },
        ],
      },
      database,
      {
        title: "O/S",
        items: [
          { label: "Hostname", value: os.hostname() },
          { label: "Operating system", value: `${os.type()} ${os.release()}` },
          { label: "Platform", value: process.platform, mono: true },
          { label: "Architecture", value: `${os.arch()} / ${os.machine()}`, mono: true },
          { label: "O/S version", value: os.version() },
          { label: "System uptime", value: formatDuration(os.uptime()) },
          { label: "CPU", value: cpus[0]?.model ?? "Unavailable" },
          { label: "Logical CPUs", value: String(os.availableParallelism()) },
          {
            label: "Load average (1 / 5 / 15 min)",
            value: process.platform === "win32"
              ? "Unavailable on Windows"
              : os.loadavg().map((value) => value.toFixed(2)).join(" / "),
          },
          { label: "Total memory (RAM)", value: formatBytes(totalMemory) },
          { label: "Used memory (RAM)", value: `${formatBytes(usedMemory)} (${percentage(usedMemory, totalMemory)})` },
          ...storageItems,
          { label: "Temporary directory", value: os.tmpdir(), mono: true },
          { label: "Runtime user", value: `${currentUser.username} (${currentUser.homedir})`, mono: true },
          { label: "Network addresses", value: networkAddresses(), mono: true },
        ],
      },
    ],
  };
}
