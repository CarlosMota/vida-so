/**
 * migrate.mjs
 * Gera e aplica migrations do Drizzle ORM automaticamente.
 * Uso: node scripts/migrate.mjs
 *
 * Equivale a rodar:
 *   npx drizzle-kit generate
 *   npx drizzle-kit migrate
 */

import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function run(cmd, label) {
  console.log(`\n▶ ${label}`);
  console.log(`  $ ${cmd}`);
  try {
    execSync(cmd, { cwd: ROOT, stdio: "inherit" });
    console.log(`  ✅ Concluído`);
  } catch (err) {
    console.error(`  ❌ Falhou: ${err.message}`);
    process.exit(1);
  }
}

console.log("🗄️  VidaSó — Migrations do Banco de Dados\n");
console.log(`📁 Diretório raiz: ${ROOT}`);

run("npx drizzle-kit generate --config=drizzle.config.ts", "Gerando arquivos de migration SQL");
run("npx drizzle-kit migrate --config=drizzle.config.ts", "Aplicando migrations no banco de dados");

console.log("\n✨ Todas as migrations foram aplicadas com sucesso!");
