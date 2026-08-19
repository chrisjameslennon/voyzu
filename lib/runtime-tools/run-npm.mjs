import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const env = { ...process.env };

for (const name of Object.keys(env)) {
  if (name.toLowerCase() === "npm_config_global_ignore_file") {
    delete env[name];
  }
}

const useNpmCli = process.platform === "win32" && process.env.npm_execpath;
const executable = useNpmCli ? process.execPath : "npm";
const executableArgs = useNpmCli ? [process.env.npm_execpath, ...args] : args;
const child = spawn(executable, executableArgs, {
  env,
  stdio: "inherit",
  shell: process.platform === "win32" && !useNpmCli,
});

child.on("error", (error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
