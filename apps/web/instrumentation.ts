export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./.generated/commands/pre-installed");
    await import("./.generated/commands/installed");
  }
}
