import { aiSuggestChefReal } from "./trpc-real";

export async function suggestChefWithAi(input: {
  location: string;
  peopleCount: number;
  eventType?: string;
  dietaryPreferences?: string[];
  budget?: number;
  desiredDate?: string;
}) {
  return aiSuggestChefReal(input);
}

