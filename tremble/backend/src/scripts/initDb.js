import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function init() {
  const sql = fs.readFileSync(
    path.join(__dirname, "../models/schema.sql"),
    "utf8"
  );
  // Connect without a DB selected so we can CREATE DATABASE
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });
  console.log("⏳ Initializing TREMBLE database...");
  await conn.query(sql);
  console.log("✅ Tables created successfully.");
  await conn.end();
}

init().catch((e) => {
  console.error("❌ DB init failed:", e);
  process.exit(1);
});
