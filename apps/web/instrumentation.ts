export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./.generated/operations/preinstalled");
    await import("./.generated/operations/register");
  }
}
