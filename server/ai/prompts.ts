import type {
  ChefSuggestionInput,
  CleanerSuggestionInput,
  GeneratePlanInput,
  ShoppingSuggestionInput,
} from "./types";

export function buildChefSuggestionPrompt(input: ChefSuggestionInput) {
  return `Sugira chef para ${input.peopleCount} pessoas em ${input.location}. Evento: ${input.eventType ?? "geral"}.`;
}

export function buildCleanerSuggestionPrompt(input: CleanerSuggestionInput) {
  return `Sugira profissional de limpeza em ${input.location}. Tipo: ${input.cleaningType}.`;
}

export function buildShoppingSuggestionPrompt(input: ShoppingSuggestionInput) {
  return `Gere itens de compra para ${input.peopleCount} pessoas. Contexto: ${input.mealPlan}.`;
}

export function buildPlanPrompt(input: GeneratePlanInput) {
  return `Monte plano com chef, compras e limpeza em ${input.location} para ${input.peopleCount} pessoas.`;
}

