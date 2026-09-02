#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

// Helper to load .env.local or .env
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const [key, ...values] = trimmed.split("=");
        if (key && values.length > 0) {
          const val = values.join("=").replace(/^["']|["']$/g, "").trim();
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!dbUrl) {
  console.error(`
========================================================================
❌ ไม่พบตัวแปร DATABASE_URL ในระบบ หรือในไฟล์ .env.local
========================================================================

📌 วิธีตั้งค่าเพื่อรัน Migration เข้า Supabase อัตโนมัติ:
1. เปิด Supabase Dashboard -> ไปที่โปรเจกต์ของคุณ
2. เมนูด้านซ้ายล่าง คลิก Project Settings (ไอคอนฟันเฟือง) -> Database
3. เลื่อนลงมาที่หัวข้อ "Connection string" -> เลือกแท็บ "URI"
4. เปลี่ยน [YOUR-PASSWORD] เป็นรหัสผ่าน Database ของคุณ
   เช่น: postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
5. นำมาใส่ในไฟล์ .env.local:
   DATABASE_URL="postgresql://postgres.[project-ref]:[PASSWORD]@..."

6. รันคำสั่งนี้อีกครั้ง: npm run db:migrate
========================================================================
`);
  process.exit(1);
}

async function runMigrations() {
  console.log("🔌 กำลังเชื่อมต่อไปยัง Supabase PostgreSQL...");

  // Support Supabase SSL requirement
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✓ เชื่อมต่อฐานข้อมูลสำเร็จ\n");

    // 1. Create migration tracking table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public._schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 2. Read all SQL files from supabase/migrations
    const migrationsDir = path.resolve(process.cwd(), "supabase/migrations");
    if (!fs.existsSync(migrationsDir)) {
      console.log("⚠️ ไม่พบโฟลเดอร์ supabase/migrations");
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    // 3. Query already applied migrations
    const { rows } = await client.query(
      `SELECT version FROM public._schema_migrations;`
    );
    const appliedSet = new Set(rows.map((r) => r.version));

    let appliedCount = 0;

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`⏩ ข้าม: ${file} (เคยรันไปแล้ว)`);
        continue;
      }

      console.log(`⚡ กำลังรัน Migration: ${file} ...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");

      // Execute in a transaction
      await client.query("BEGIN;");
      try {
        await client.query(sql);
        await client.query(
          `INSERT INTO public._schema_migrations (version) VALUES ($1);`,
          [file]
        );
        await client.query("COMMIT;");
        console.log(`✅ สำเร็จ: ${file}\n`);
        appliedCount++;
      } catch (err) {
        await client.query("ROLLBACK;");
        console.error(`❌ เกิดข้อผิดพลาดในการรัน ${file}:`, err.message);
        throw err;
      }
    }

    if (appliedCount === 0) {
      console.log("\n✨ ฐานข้อมูลเป็นเวอร์ชันล่าสุดแล้ว ไม่มี Migration ค้างอยู่");
    } else {
      console.log(`\n🎉 รัน Migration สำเร็จทั้งหมด ${appliedCount} ไฟล์เรียบร้อยแล้ว!`);
    }
  } catch (err) {
    console.error("\n💥 Migration ล้มเหลว:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
