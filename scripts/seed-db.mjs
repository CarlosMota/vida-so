/**
 * seed-db.mjs
 * Popula o banco de dados com dados de exemplo para desenvolvimento.
 * Uso: node scripts/seed-db.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não definida.");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

// ─── Chefs ────────────────────────────────────────────────────────────────────
const chefs = [
  {
    name: "Ana Beatriz Santos",
    bio: "Chef formada pelo Senac com 8 anos de experiência em culinária brasileira contemporânea. Especialista em marmitas saudáveis e jantares especiais para ocasiões únicas.",
    cuisineTypes: JSON.stringify(["Brasileira", "Saudável", "Fitness"]),
    specialties: JSON.stringify(["Marmitas saudáveis", "Jantares especiais", "Brunch"]),
    pricePerPerson: 85,
    city: "São Paulo",
    rating: 4.9,
    totalReviews: 47,
    experience: 8,
    isAvailable: true,
    portfolioImages: JSON.stringify([]),
  },
  {
    name: "Carlos Mendes",
    bio: "Chef italiano radicado em São Paulo. Especialista em massas artesanais e risotos. Formado em Bolonha, traz o autêntico sabor da Itália para a sua casa.",
    cuisineTypes: JSON.stringify(["Italiana", "Francesa", "Fusion"]),
    specialties: JSON.stringify(["Massas artesanais", "Risotos", "Sobremesas"]),
    pricePerPerson: 120,
    city: "São Paulo",
    rating: 4.8,
    totalReviews: 32,
    experience: 12,
    isAvailable: true,
    portfolioImages: JSON.stringify([]),
  },
  {
    name: "Yuki Tanaka",
    bio: "Nascida em Osaka e radicada no Brasil há 10 anos. Domina todas as técnicas da culinária japonesa, do sushi ao ramen artesanal. Ingredientes sempre frescos e importados.",
    cuisineTypes: JSON.stringify(["Japonesa"]),
    specialties: JSON.stringify(["Sushi", "Ramen", "Temaki"]),
    pricePerPerson: 110,
    city: "São Paulo",
    rating: 4.95,
    totalReviews: 61,
    experience: 10,
    isAvailable: true,
    portfolioImages: JSON.stringify([]),
  },
  {
    name: "Roberto Alves",
    bio: "Mestre churrasqueiro com 15 anos de experiência. Especialista em cortes nobres e churrasco gaúcho. Leva toda a estrutura necessária para um evento inesquecível.",
    cuisineTypes: JSON.stringify(["Churrasco", "Brasileira", "Mineira"]),
    specialties: JSON.stringify(["Churrasco", "Frutos do mar", "Costela assada"]),
    pricePerPerson: 95,
    city: "Rio de Janeiro",
    rating: 4.7,
    totalReviews: 28,
    experience: 15,
    isAvailable: true,
    portfolioImages: JSON.stringify([]),
  },
  {
    name: "Fernanda Costa",
    bio: "Nutricionista e chef especializada em alimentação plant-based. Cria cardápios veganos e vegetarianos saborosos e nutritivos, sem abrir mão do prazer à mesa.",
    cuisineTypes: JSON.stringify(["Vegana", "Saudável", "Fitness"]),
    specialties: JSON.stringify(["Pratos veganos", "Marmitas fitness", "Sobremesas sem açúcar"]),
    pricePerPerson: 75,
    city: "Belo Horizonte",
    rating: 4.85,
    totalReviews: 39,
    experience: 6,
    isAvailable: true,
    portfolioImages: JSON.stringify([]),
  },
  {
    name: "Pedro Oliveira",
    bio: "Chef carioca especializado em frutos do mar e culinária mediterrânea. Trabalhou em restaurantes estrelados em Lisboa e traz essa experiência para o seu lar.",
    cuisineTypes: JSON.stringify(["Frutos do Mar", "Italiana", "Francesa"]),
    specialties: JSON.stringify(["Frutos do mar", "Risotos", "Massas artesanais"]),
    pricePerPerson: 130,
    city: "Rio de Janeiro",
    rating: 4.75,
    totalReviews: 22,
    experience: 9,
    isAvailable: false,
    portfolioImages: JSON.stringify([]),
  },
];

// ─── Profissionais de Limpeza ─────────────────────────────────────────────────
const cleaners = [
  {
    name: "Maria Aparecida Silva",
    bio: "Profissional com 12 anos de experiência em limpeza residencial. Organizada, pontual e de confiança. Especialista em limpeza profunda e organização de ambientes.",
    serviceTypes: JSON.stringify(["Limpeza básica", "Limpeza profunda", "Limpeza semanal", "Organização"]),
    priceBasic: 150,
    priceDeep: 280,
    priceWeekly: 480,
    city: "São Paulo",
    rating: 4.9,
    totalReviews: 85,
    isAvailable: true,
  },
  {
    name: "Josefa Rodrigues",
    bio: "Especialista em limpeza pós-obra e higienização profunda. Utiliza produtos de alta qualidade e equipamentos profissionais. Atende apartamentos e casas.",
    serviceTypes: JSON.stringify(["Limpeza básica", "Limpeza profunda", "Pós-obra", "Higienização"]),
    priceBasic: 160,
    priceDeep: 300,
    priceWeekly: 500,
    city: "São Paulo",
    rating: 4.8,
    totalReviews: 54,
    isAvailable: true,
  },
  {
    name: "Cleide Ferreira",
    bio: "Profissional certificada em limpeza e organização. Atende com discrição e eficiência. Pacotes semanais com desconto especial para moradores de apartamento.",
    serviceTypes: JSON.stringify(["Limpeza básica", "Limpeza semanal", "Organização"]),
    priceBasic: 140,
    priceDeep: 260,
    priceWeekly: 450,
    city: "Rio de Janeiro",
    rating: 4.7,
    totalReviews: 41,
    isAvailable: true,
  },
  {
    name: "Sandra Lima",
    bio: "10 anos de experiência em limpeza residencial e comercial. Especialista em higienização de sofás, colchões e tapetes. Produtos ecológicos e seguros para pets.",
    serviceTypes: JSON.stringify(["Limpeza básica", "Limpeza profunda", "Higienização"]),
    priceBasic: 155,
    priceDeep: 290,
    priceWeekly: 490,
    city: "Belo Horizonte",
    rating: 4.85,
    totalReviews: 33,
    isAvailable: true,
  },
  {
    name: "Tereza Nascimento",
    bio: "Profissional dedicada e meticulosa. Especializada em apartamentos compactos e studios. Pacotes mensais com visitas semanais a preço fixo.",
    serviceTypes: JSON.stringify(["Limpeza básica", "Limpeza semanal"]),
    priceBasic: 130,
    priceDeep: 240,
    priceWeekly: 420,
    city: "São Paulo",
    rating: 4.6,
    totalReviews: 27,
    isAvailable: false,
  },
];

// ─── Inserção ─────────────────────────────────────────────────────────────────
async function seed() {
  try {
    console.log("🌱 Iniciando seed do banco de dados VidaSó...\n");

    // Inserir chefs
    console.log("👨‍🍳 Inserindo chefs...");
    for (const chef of chefs) {
      await connection.execute(
        `INSERT IGNORE INTO chefs (name, bio, cuisineTypes, specialties, pricePerPerson, city, rating, totalReviews, experience, isAvailable, portfolioImages)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [chef.name, chef.bio, chef.cuisineTypes, chef.specialties, chef.pricePerPerson, chef.city, chef.rating, chef.totalReviews, chef.experience, chef.isAvailable ? 1 : 0, chef.portfolioImages]
      );
      console.log(`  ✅ Chef: ${chef.name}`);
    }

    // Inserir profissionais de limpeza
    console.log("\n🧹 Inserindo profissionais de limpeza...");
    for (const cleaner of cleaners) {
      await connection.execute(
        `INSERT IGNORE INTO cleaners (name, bio, serviceTypes, priceBasic, priceDeep, priceWeekly, city, rating, totalReviews, isAvailable)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cleaner.name, cleaner.bio, cleaner.serviceTypes, cleaner.priceBasic, cleaner.priceDeep, cleaner.priceWeekly, cleaner.city, cleaner.rating, cleaner.totalReviews, cleaner.isAvailable ? 1 : 0]
      );
      console.log(`  ✅ Profissional: ${cleaner.name}`);
    }

    console.log("\n✨ Seed concluído com sucesso!");
    console.log(`   ${chefs.length} chefs inseridos`);
    console.log(`   ${cleaners.length} profissionais de limpeza inseridos`);
  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
