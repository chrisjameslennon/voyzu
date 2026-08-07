 
import { config } from "dotenv";
const envFile = process.argv.includes("--production") ? ".env.production" : ".env.local";
config({ path: envFile });
console.log(`Using env: ${envFile}`);

import { getPool } from "@voyzu/capability/db";

async function main() {
  const pool = getPool();
  try {
    const { rows } = await pool.query("SELECT NOW() AS now");
    console.log("connected:", rows[0].now);
  } finally {
    await pool.end();
  }
}

main();



