/**
 * build-check.mjs
 * Executa o build de produção e verifica se está tudo correto antes de publicar.
 * Roda: TypeScript check → testes → build de produção
 * Uso: node scripts/build-check.mjs
 */

import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const steps = [
  {
    label: "TypeScript — verificação de tipos",
    cmd: "npm run check",
  },
  {
    label: "Vitest — execução dos testes",
    cmd: "npm test",
  },
  {
    label: "Vite — build de produção",
    cmd: "npm run build",
  },
];

console.log("🏗️  VidaSó — Build de Produção\n");

const results = [];

for (const step of steps) {
  process.stdout.write(`▶ ${step.label} ... `);
  const start = Date.now();
  try {
    execSync(step.cmd, { cwd: ROOT, stdio: "pipe" });
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`✅ (${elapsed}s)`);
    results.push({ label: step.label, status: "ok", elapsed });
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`❌ (${elapsed}s)`);
    console.error(`\n   Saída de erro:\n${err.stdout?.toString() || err.message}\n`);
    results.push({ label: step.label, status: "fail", elapsed });
    console.error("⛔ Build abortado por falha na etapa acima.");
    process.exit(1);
  }
}

// Verificar tamanho do bundle gerado
const distDir = path.join(ROOT, "dist");
if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(path.join(distDir, "assets") || distDir).filter((f) => f.endsWith(".js") || f.endsWith(".css"));
  console.log(`\n📦 Arquivos gerados em dist/:`);
  for (const file of files.slice(0, 10)) {
    const filePath = path.join(distDir, "assets", file);
    try {
      const size = fs.statSync(filePath).size;
      const sizeKb = (size / 1024).toFixed(1);
      console.log(`   ${file.padEnd(50)} ${sizeKb} KB`);
    } catch {
      console.log(`   ${file}`);
    }
  }
}

console.log("\n✨ Build de produção concluído com sucesso!\n");
