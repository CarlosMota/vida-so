export type ChefSuggestionInput = {
  location: string;
  peopleCount: number;
  eventType?: string;
  dietaryPreferences?: string[];
  budget?: number;
  desiredDate?: string;
};

export type CleanerSuggestionInput = {
  location: string;
  propertyType?: string;
  roomCount?: number;
  cleaningType: string;
  desiredDate?: string;
};

export type ShoppingSuggestionInput = {
  mealPlan: string;
  peopleCount: number;
  dietaryPreferences?: string[];
  budget?: number;
};

export type GeneratePlanInput = {
  location: string;
  peopleCount: number;
  eventType?: string;
  budget?: number;
  cleaningType?: string;
  desiredDate?: string;
};

