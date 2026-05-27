/**
 * stats-report.mjs
 * Gera um relatório de estatísticas da plataforma VidaSó diretamente do banco.
 * Útil para monitoramento e análise de negócio.
 * Uso: node scripts/stats-report.mjs
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não definida.");
  process.exit(1);
}

async function statsReport() {
  const conn = await mysql.createConnection(DATABASE_URL);
  console.log("📊 VidaSó — Relatório de Estatísticas da Plataforma");
  console.log("═".repeat(55));
  console.log(`   Gerado em: ${new Date().toLocaleString("pt-BR")}\n`);

  try {
    // ── Usuários ──────────────────────────────────────────────────
    const [[{ total_users }]] = await conn.execute("SELECT COUNT(*) AS total_users FROM users");
    const [[{ new_users_30d }]] = await conn.execute(
      "SELECT COUNT(*) AS new_users_30d FROM users WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );
    const [[{ onboarded }]] = await conn.execute(
      "SELECT COUNT(*) AS onboarded FROM user_preferences WHERE onboardingCompleted = 1"
    );

    console.log("👤 USUÁRIOS");
    console.log(`   Total de usuários:          ${total_users}`);
    console.log(`   Novos (últimos 30 dias):    ${new_users_30d}`);
    console.log(`   Onboarding concluído:       ${onboarded}`);

    // ── Prestadores ───────────────────────────────────────────────
    const [[{ total_chefs }]] = await conn.execute("SELECT COUNT(*) AS total_chefs FROM chefs");
    const [[{ available_chefs }]] = await conn.execute("SELECT COUNT(*) AS available_chefs FROM chefs WHERE isAvailable = 1");
    const [[{ avg_chef_rating }]] = await conn.execute("SELECT ROUND(AVG(rating), 2) AS avg_chef_rating FROM chefs");

    const [[{ total_cleaners }]] = await conn.execute("SELECT COUNT(*) AS total_cleaners FROM cleaners");
    const [[{ available_cleaners }]] = await conn.execute("SELECT COUNT(*) AS available_cleaners FROM cleaners WHERE isAvailable = 1");
    const [[{ avg_cleaner_rating }]] = await conn.execute("SELECT ROUND(AVG(rating), 2) AS avg_cleaner_rating FROM cleaners");

    console.log("\n👨‍🍳 PERSONAL CHEFS");
    console.log(`   Total cadastrados:          ${total_chefs}`);
    console.log(`   Disponíveis agora:          ${available_chefs}`);
    console.log(`   Avaliação média:            ${avg_chef_rating ?? "N/A"} ⭐`);

    console.log("\n🧹 PROFISSIONAIS DE LIMPEZA");
    console.log(`   Total cadastrados:          ${total_cleaners}`);
    console.log(`   Disponíveis agora:          ${available_cleaners}`);
    console.log(`   Avaliação média:            ${avg_cleaner_rating ?? "N/A"} ⭐`);

    // ── Agendamentos ──────────────────────────────────────────────
    const [[{ total_bookings }]] = await conn.execute("SELECT COUNT(*) AS total_bookings FROM bookings");
    const [booking_by_status] = await conn.execute(
      "SELECT status, COUNT(*) AS count FROM bookings GROUP BY status"
    );
    const [booking_by_type] = await conn.execute(
      "SELECT serviceType, COUNT(*) AS count FROM bookings GROUP BY serviceType"
    );
    const [[{ revenue }]] = await conn.execute(
      "SELECT ROUND(SUM(totalPrice), 2) AS revenue FROM bookings WHERE status IN ('confirmed', 'completed')"
    );

    console.log("\n📅 AGENDAMENTOS");
    console.log(`   Total de agendamentos:      ${total_bookings}`);
    for (const row of booking_by_status) {
      console.log(`   ${row.status.padEnd(20)}  ${row.count}`);
    }
    console.log("\n   Por tipo de serviço:");
    for (const row of booking_by_type) {
      console.log(`   ${row.serviceType.padEnd(20)}  ${row.count}`);
    }
    console.log(`\n   Receita confirmada:         R$ ${revenue ?? "0,00"}`);

    // ── Compras ───────────────────────────────────────────────────
    const [[{ total_lists }]] = await conn.execute("SELECT COUNT(*) AS total_lists FROM shopping_lists");
    const [[{ total_items }]] = await conn.execute("SELECT COUNT(*) AS total_items FROM shopping_items");
    const [[{ scheduled_deliveries }]] = await conn.execute(
      "SELECT COUNT(*) AS scheduled_deliveries FROM shopping_lists WHERE deliveryAt IS NOT NULL"
    );

    console.log("\n🛒 COMPRAS");
    console.log(`   Listas criadas:             ${total_lists}`);
    console.log(`   Itens adicionados:          ${total_items}`);
    console.log(`   Entregas agendadas:         ${scheduled_deliveries}`);

    // ── Avaliações ────────────────────────────────────────────────
    const [[{ total_reviews }]] = await conn.execute("SELECT COUNT(*) AS total_reviews FROM reviews");
    const [[{ avg_rating }]] = await conn.execute("SELECT ROUND(AVG(rating), 2) AS avg_rating FROM reviews");

    console.log("\n⭐ AVALIAÇÕES");
    console.log(`   Total de avaliações:        ${total_reviews}`);
    console.log(`   Nota média geral:           ${avg_rating ?? "N/A"} ⭐`);

    console.log("\n" + "═".repeat(55));
    console.log("   Relatório gerado com sucesso!\n");
  } catch (err) {
    console.error("❌ Erro ao gerar relatório:", err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

statsReport();
