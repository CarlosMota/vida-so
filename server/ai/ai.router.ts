import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { generatePlan, suggestChef, suggestCleaner, suggestShoppingItems } from "./ai.service";

export const aiRouter = router({
  suggestChef: publicProcedure
    .input(z.object({
      location: z.string(),
      peopleCount: z.number().int().min(1),
      eventType: z.string().optional(),
      dietaryPreferences: z.array(z.string()).optional(),
      budget: z.number().optional(),
      desiredDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => suggestChef(input)),
  suggestCleaner: publicProcedure
    .input(z.object({
      location: z.string(),
      propertyType: z.string().optional(),
      roomCount: z.number().int().optional(),
      cleaningType: z.string(),
      desiredDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => suggestCleaner(input)),
  suggestShoppingItems: publicProcedure
    .input(z.object({
      mealPlan: z.string(),
      peopleCount: z.number().int().min(1),
      dietaryPreferences: z.array(z.string()).optional(),
      budget: z.number().optional(),
    }))
    .mutation(async ({ input }) => suggestShoppingItems(input)),
  generatePlan: publicProcedure
    .input(z.object({
      location: z.string(),
      peopleCount: z.number().int().min(1),
      eventType: z.string().optional(),
      budget: z.number().optional(),
      cleaningType: z.string().optional(),
      desiredDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => generatePlan(input)),
});

