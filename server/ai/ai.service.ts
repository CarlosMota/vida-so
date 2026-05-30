import type {
  ChefSuggestionInput,
  CleanerSuggestionInput,
  GeneratePlanInput,
  ShoppingSuggestionInput,
} from "./types";

export async function suggestChef(input: ChefSuggestionInput) {
  return {
    recommendedChef: "Chef Ana Beatriz",
    reason: `Boa aderência para ${input.eventType ?? "refeições"} em ${input.location}.`,
    estimatedCost: Math.max(120, (input.budget ?? 240) * 0.7),
    suggestedShoppingItems: ["Arroz integral", "Frango", "Tomate", "Azeite"],
  };
}

export async function suggestCleaner(input: CleanerSuggestionInput) {
  return {
    recommendedCleaner: "Maria Oliveira",
    reason: `Perfil compatível com ${input.cleaningType} em ${input.location}.`,
    estimatedDurationHours: Math.max(2, input.roomCount ?? 3),
    estimatedPrice: 160 + (input.roomCount ?? 3) * 20,
    checklist: ["Pisos", "Banheiros", "Cozinha", "Superfícies"],
  };
}

export async function suggestShoppingItems(input: ShoppingSuggestionInput) {
  return {
    items: [
      { name: "Arroz", quantity: "1", unit: "kg", estimatedPrice: 8 },
      { name: "Feijão", quantity: "1", unit: "kg", estimatedPrice: 9 },
      { name: "Frango", quantity: "1", unit: "kg", estimatedPrice: 22 },
    ],
    reason: `Itens sugeridos para ${input.mealPlan}.`,
  };
}

export async function generatePlan(input: GeneratePlanInput) {
  return {
    chef: { name: "Chef Ana Beatriz", estimatedCost: 220 },
    cleaner: { name: "Maria Oliveira", estimatedCost: 180 },
    shopping: { estimatedCost: 140 },
    summary: `Plano integrado para ${input.peopleCount} pessoas em ${input.location}.`,
  };
}

