/**
 * reset-db.mjs
 * ⚠️  ATENÇÃO: Este script apaga TODOS os dados do banco de dados!
 * Use apenas em ambiente de desenvolvimento para reiniciar do zero.
 * Uso: node scripts/reset-db.mjs --confirm
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const args = process.argv.slice(2);
if (!args.includes("--confirm")) {
  console.error("⚠️  Este script apaga todos os dados do banco!");
  console.error("   Para confirmar, execute: node scripts/reset-db.mjs --confirm");
  process.exit(1);
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não definida.");
  process.exit(1);
}

const TABLES_IN_ORDER = [
  "reviews",
  "shopping_items",
  "shopping_lists",
  "bookings",
  "user_preferences",
  "cleaners",
  "chefs",
  "users",
];

async function resetDb() {
  const conn = await mysql.createConnection(DATABASE_URL);
  console.log("🗑️  VidaSó — Reset do Banco de Dados\n");

  try {
    // Desabilitar verificação de FK temporariamente
    await conn.execute("SET FOREIGN_KEY_CHECKS = 0");

    for (const table of TABLES_IN_ORDER) {
      try {
        await conn.execute(`TRUNCATE TABLE \`${table}\``);
        console.log(`  ✅ Tabela ${table} limpa`);
      } catch (err) {
        console.warn(`  ⚠️  Tabela ${table} não encontrada ou erro: ${err.message}`);
      }
    }

    await conn.execute("SET FOREIGN_KEY_CHECKS = 1");

    console.log("\n✨ Banco de dados resetado com sucesso!");
    console.log("   Execute 'node scripts/seed-db.mjs' para repopular com dados de exemplo.");
  } catch (err) {
    console.error("❌ Erro durante o reset:", err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

resetDb();
