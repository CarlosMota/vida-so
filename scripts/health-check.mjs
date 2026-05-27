/**
 * health-check.mjs
 * Verifica a saúde do ambiente de desenvolvimento da plataforma VidaSó.
 * Testa conexão com banco de dados, variáveis de ambiente e servidor.
 * Uso: node scripts/health-check.mjs
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const CHECKS = [];

function pass(label, detail = "") {
  CHECKS.push({ status: "✅", label, detail });
}

function fail(label, detail = "") {
  CHECKS.push({ status: "❌", label, detail });
}

function warn(label, detail = "") {
  CHECKS.push({ status: "⚠️ ", label, detail });
}

console.log("🔍 VidaSó — Verificação de Saúde do Ambiente\n");

// ─── 1. Variáveis de ambiente obrigatórias ────────────────────────────────────
const REQUIRED_ENVS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "VITE_APP_ID",
  "OAUTH_SERVER_URL",
  "VITE_OAUTH_PORTAL_URL",
  "BUILT_IN_FORGE_API_KEY",
  "BUILT_IN_FORGE_API_URL",
];

for (const envKey of REQUIRED_ENVS) {
  if (process.env[envKey]) {
    pass(`ENV: ${envKey}`, "definida");
  } else {
    fail(`ENV: ${envKey}`, "não definida — necessária para funcionamento");
  }
}

// ─── 2. Conexão com banco de dados ────────────────────────────────────────────
if (process.env.DATABASE_URL) {
  try {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    await conn.ping();
    await conn.end();
    pass("Banco de dados", "conexão MySQL bem-sucedida");
  } catch (err) {
    fail("Banco de dados", `falha na conexão: ${err.message}`);
  }
} else {
  warn("Banco de dados", "DATABASE_URL não definida, pulando teste");
}

// ─── 3. Tabelas essenciais no banco ───────────────────────────────────────────
if (process.env.DATABASE_URL) {
  const TABLES = ["users", "chefs", "cleaners", "bookings", "shopping_lists", "shopping_items", "reviews", "user_preferences"];
  try {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    for (const table of TABLES) {
      const [rows] = await conn.execute(
        `SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
        [table]
      );
      if (rows[0].count > 0) {
        pass(`Tabela: ${table}`, "existe no banco");
      } else {
        fail(`Tabela: ${table}`, "não encontrada — execute: npm run db:migrate");
      }
    }
    await conn.end();
  } catch (err) {
    warn("Tabelas", `não foi possível verificar: ${err.message}`);
  }
}

// ─── 4. Dependências Node.js ──────────────────────────────────────────────────
try {
  execSync("npm ls --depth=0", { cwd: ROOT, stdio: "pipe" });
  pass("Dependências Node.js", "npm e dependências presentes");
} catch {
  fail("Dependências Node.js", "execute: npm install");
}

// ─── 5. TypeScript sem erros ──────────────────────────────────────────────────
try {
  execSync("npm run check", { cwd: ROOT, stdio: "pipe" });
  pass("TypeScript", "sem erros de compilação");
} catch (err) {
  fail("TypeScript", "erros encontrados — execute: npm run check");
}

// ─── 6. Testes passando ───────────────────────────────────────────────────────
try {
  const output = execSync("npm test", { cwd: ROOT, encoding: "utf8" });
  const match = output.match(/Tests\s+(\d+) passed/);
  if (match) {
    pass("Testes Vitest", `${match[1]} testes passando`);
  } else {
    warn("Testes Vitest", "não foi possível confirmar resultado");
  }
} catch {
  fail("Testes Vitest", "testes falhando — execute: npm test");
}

// ─── Relatório final ──────────────────────────────────────────────────────────
console.log("\n┌─────────────────────────────────────────────────────────┐");
console.log("│              Relatório de Saúde — VidaSó                │");
console.log("└─────────────────────────────────────────────────────────┘\n");

for (const { status, label, detail } of CHECKS) {
  console.log(`  ${status}  ${label.padEnd(35)} ${detail}`);
}

const failures = CHECKS.filter((c) => c.status === "❌").length;
const warnings = CHECKS.filter((c) => c.status.startsWith("⚠")).length;
const passes = CHECKS.filter((c) => c.status === "✅").length;

console.log(`\n  Total: ${passes} OK  |  ${warnings} avisos  |  ${failures} falhas`);

if (failures > 0) {
  console.log("\n⛔ Ambiente com problemas. Corrija os itens marcados com ❌ antes de continuar.\n");
  process.exit(1);
} else if (warnings > 0) {
  console.log("\n⚠️  Ambiente funcional com avisos. Verifique os itens marcados.\n");
} else {
  console.log("\n🚀 Ambiente 100% saudável! Pronto para desenvolvimento.\n");
}
