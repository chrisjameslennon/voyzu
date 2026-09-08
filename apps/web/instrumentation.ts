export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const development = process.env.NODE_ENV === "development";
    const started = performance.now();
    if (development) console.log("loading contract configuration ...");
    try {
      await import("./.generated/contracts/installed");
      if (development) {
        console.log(`contract configuration loaded in ${Math.round(performance.now() - started)} ms`);
      }
    } catch (error) {
      if (development) console.error("contract configuration failed to load");
      throw error;
    }
  }
}
