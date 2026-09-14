export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const development = process.env.NODE_ENV === "development";
    const started = performance.now();
    if (development) console.log("[voyzu] loading contract configuration ...");
    try {
      const [preinstalled, installed, { registerInternalApi }] = await Promise.all([
        import("./.generated/internal-api/pre-installed"),
        import("./.generated/internal-api/installed"),
        import("@voyzu/capability/internal-api"),
      ]);
      registerInternalApi([...preinstalled.internalApiResources, ...installed.internalApiResources]);
      if (development) {
        console.log(`[voyzu] contract configuration loaded in ${Math.round(performance.now() - started)} ms`);
      }
    } catch (error) {
      if (development) console.error("[voyzu] contract configuration failed to load");
      throw error;
    }
  }
}
