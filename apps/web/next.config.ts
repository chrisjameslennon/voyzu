import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

function findInstallationRoot(start: string): string | undefined {
  let current = resolve(start);
  while (true) {
    if (runtimeMode(join(current, ".run"))) return current;
    const parent = dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}

function isVoyzuSourceRoot(directory: string): boolean {
  try {
    const manifest = JSON.parse(
      readFileSync(join(directory, "package.json"), "utf8"),
    ) as { name?: string };
    return manifest.name === "voyzu";
  } catch {
    return false;
  }
}

function findSourceRoot(start: string): string | undefined {
  let current = resolve(start);
  while (true) {
    if (isVoyzuSourceRoot(current)) return current;
    const parent = dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}

function findRuntimeRoot(instanceRoot: string): string {
  return join(instanceRoot, ".run");
}

function runtimeMode(runtimeRoot: string): "development" | "production" | undefined {
  try {
    const runtimePackage = JSON.parse(
      readFileSync(join(runtimeRoot, "package.json"), "utf8"),
    ) as { voyzu?: { mode?: string } };
    return runtimePackage.voyzu?.mode === "development"
      || runtimePackage.voyzu?.mode === "production"
      ? runtimePackage.voyzu.mode
      : undefined;
  } catch {
    return undefined;
  }
}

export default function nextConfig(phase: string): NextConfig {
  const installationRoot = findInstallationRoot(process.cwd());
  const sourceRoot = installationRoot
    ? undefined
    : findSourceRoot(process.cwd());
  const instanceRoot = installationRoot ?? sourceRoot;
  const runtimeRoot = installationRoot
    ? findRuntimeRoot(installationRoot)
    : undefined;
  const mode = runtimeRoot ? runtimeMode(runtimeRoot) : undefined;
  if (instanceRoot) {
    loadEnvConfig(
      instanceRoot,
      phase === PHASE_DEVELOPMENT_SERVER,
      console,
      true,
    );
  }

  return {
    turbopack: runtimeRoot
      ? {
          root: installationRoot && mode === "development"
            ? installationRoot
            : runtimeRoot,
        }
      : sourceRoot
        ? { root: sourceRoot }
        : undefined,
    transpilePackages: [
      "@voyzu/api-reference",
      "@voyzu/capability",
      "@voyzu/auth",
      "@voyzu/audit",
      "@voyzu/welcome",
      "@voyzu/package-management",
      "@voyzu/system-info",
      "@voyzu/ui-reference",
      "@voyzu/types",
      "@voyzu/ui-components",
      "@voyzu/ui-layout",
      "@voyzu/ui-style",
      "@voyzu/ui-surface",
    ],
    devIndicators: {
      position: "bottom-right",
    },
    serverExternalPackages: ["@sparticuz/chromium-min", "puppeteer", "puppeteer-core"],
  };
}
