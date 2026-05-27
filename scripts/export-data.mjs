/**
 * export-data.mjs
 * Exporta todos os dados do banco de dados para arquivos JSON.
 * Útil para backup, análise e migração de dados.
 * Uso: node scripts/export-data.mjs [--output ./backup]
 */

import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não definida.");
  process.exit(1);
}

const args = process.argv.slice(2);
const outputIdx = args.indexOf("--output");
const outputDir = outputIdx !== -1 ? args[outputIdx + 1] : "./backup";
const resolvedOutput = path.resolve(outputDir);

const TABLES = [
  "users",
  "chefs",
  "cleaners",
  "bookings",
  "shopping_lists",
  "shopping_items",
  "reviews",
  "user_preferences",
];

async function exportData() {
  const conn = await mysql.createConnection(DATABASE_URL);
  console.log("📦 VidaSó — Exportação de Dados\n");
  console.log(`📁 Destino: ${resolvedOutput}\n`);

  // Criar diretório de saída
  if (!fs.existsSync(resolvedOutput)) {
    fs.mkdirSync(resolvedOutput, { recursive: true });
  }

  const summary = {};

  try {
    for (const table of TABLES) {
      try {
        const [rows] = await conn.execute(`SELECT * FROM \`${table}\``);
        const filePath = path.join(resolvedOutput, `${table}.json`);
        fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), "utf8");
        summary[table] = rows.length;
        console.log(`  ✅ ${table.padEnd(20)} → ${rows.length} registros → ${table}.json`);
      } catch (err) {
        console.warn(`  ⚠️  ${table}: ${err.message}`);
        summary[table] = "erro";
      }
    }

    // Gerar arquivo de metadados
    const meta = {
      exportedAt: new Date().toISOString(),
      platform: "VidaSó",
      tables: summary,
    };
    fs.writeFileSync(path.join(resolvedOutput, "_meta.json"), JSON.stringify(meta, null, 2), "utf8");

    console.log(`\n✨ Exportação concluída!`);
    console.log(`   Arquivos salvos em: ${resolvedOutput}`);
    console.log(`   Total de tabelas: ${TABLES.length}`);
  } catch (err) {
    console.error("❌ Erro durante a exportação:", err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

exportData();
