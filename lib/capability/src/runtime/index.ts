export const runtime = {
  env: process.env.NODE_ENV ?? "development",
  isDev: process.env.NODE_ENV === "development",
  isTest: process.env.NODE_ENV === "test",
  isProd: process.env.NODE_ENV === "production",
  isProductionLike: process.env.NODE_ENV === "production",
  isDevLike: process.env.NODE_ENV !== "production",
  isVercel: Boolean(process.env.VERCEL_ENV),
  vercelProductionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL,
};
