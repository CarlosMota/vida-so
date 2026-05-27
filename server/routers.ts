import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  upsertUser,
  getUserByOpenId,
  updateUserProfile,
  getUserPreferences,
  upsertUserPreferences,
  listChefs,
  getChefById,
  matchChefsForUser,
  listCleaners,
  getCleanerById,
  createBooking,
  getUserBookings,
  updateBookingStatus,
  getProviderBookings,
  getUserShoppingLists,
  createShoppingList,
  getShoppingListById,
  getShoppingItems,
  addShoppingItem,
  removeShoppingItem,
  toggleShoppingItem,
  scheduleDelivery,
  createReview,
  getProviderReviews,
} from "./db";

// ─── Auth Router ──────────────────────────────────────────────────────────────
const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
});

// ─── Preferences Router ───────────────────────────────────────────────────────
const preferencesRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return getUserPreferences(ctx.user.id);
  }),
  save: protectedProcedure
    .input(z.object({
      cuisineTypes: z.array(z.string()).optional(),
      dietaryRestrictions: z.array(z.string()).optional(),
      allergies: z.array(z.string()).optional(),
      monthlyBudget: z.number().optional(),
      preferredDeliveryTime: z.string().optional(),
      onboardingCompleted: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await upsertUserPreferences(ctx.user.id, input);
      return { success: true };
    }),
});

// ─── Chefs Router ─────────────────────────────────────────────────────────────
const chefsRouter = router({
  list: publicProcedure
    .input(z.object({
      city: z.string().optional(),
      cuisine: z.string().optional(),
      maxPrice: z.number().optional(),
      minRating: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      return listChefs(input ?? {});
    }),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const chef = await getChefById(input.id);
      if (!chef) throw new Error("Chef não encontrado");
      return chef;
    }),
  match: protectedProcedure.query(async ({ ctx }) => {
    return matchChefsForUser(ctx.user.id);
  }),
  getReviews: publicProcedure
    .input(z.object({ chefId: z.number() }))
    .query(async ({ input }) => {
      return getProviderReviews(input.chefId, "chef");
    }),
});

// ─── Cleaners Router ──────────────────────────────────────────────────────────
const cleanersRouter = router({
  list: publicProcedure
    .input(z.object({
      city: z.string().optional(),
      serviceType: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      return listCleaners(input ?? {});
    }),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const cleaner = await getCleanerById(input.id);
      if (!cleaner) throw new Error("Profissional não encontrado");
      return cleaner;
    }),
  getReviews: publicProcedure
    .input(z.object({ cleanerId: z.number() }))
    .query(async ({ input }) => {
      return getProviderReviews(input.cleanerId, "cleaner");
    }),
});

// ─── Bookings Router ──────────────────────────────────────────────────────────
const bookingsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getUserBookings(ctx.user.id);
  }),
  create: protectedProcedure
    .input(z.object({
      serviceType: z.enum(["chef", "cleaning", "shopping"]),
      providerId: z.number().optional(),
      scheduledAt: z.string(),
      notes: z.string().optional(),
      totalPrice: z.number().optional(),
      address: z.string().optional(),
      serviceSubtype: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await createBooking({
        userId: ctx.user.id,
        serviceType: input.serviceType,
        providerId: input.providerId,
        scheduledAt: new Date(input.scheduledAt),
        notes: input.notes,
        totalPrice: input.totalPrice,
        address: input.address,
        serviceSubtype: input.serviceSubtype,
      });
      return { success: true };
    }),
  cancel: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .mutation(async ({ input }) => {
      await updateBookingStatus(input.bookingId, "cancelled");
      return { success: true };
    }),
  confirm: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .mutation(async ({ input }) => {
      await updateBookingStatus(input.bookingId, "confirmed");
      return { success: true };
    }),
  complete: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .mutation(async ({ input }) => {
      await updateBookingStatus(input.bookingId, "completed");
      return { success: true };
    }),
  getProviderBookings: protectedProcedure
    .input(z.object({
      providerId: z.number(),
      serviceType: z.enum(["chef", "cleaning"]),
    }))
    .query(async ({ input }) => {
      return getProviderBookings(input.providerId, input.serviceType);
    }),
});

// ─── Shopping Router ──────────────────────────────────────────────────────────
const shoppingRouter = router({
  getLists: protectedProcedure.query(async ({ ctx }) => {
    return getUserShoppingLists(ctx.user.id);
  }),
  createList: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await createShoppingList(ctx.user.id, input.name);
      return { success: true };
    }),
  getItems: protectedProcedure
    .input(z.object({ listId: z.number() }))
    .query(async ({ input }) => {
      return getShoppingItems(input.listId);
    }),
  addItem: protectedProcedure
    .input(z.object({
      listId: z.number(),
      name: z.string(),
      quantity: z.string().optional(),
      unit: z.string().optional(),
      estimatedPrice: z.number().optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { listId, ...item } = input;
      await addShoppingItem(listId, item);
      return { success: true };
    }),
  removeItem: protectedProcedure
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ input }) => {
      await removeShoppingItem(input.itemId);
      return { success: true };
    }),
  toggleItem: protectedProcedure
    .input(z.object({ itemId: z.number(), checked: z.boolean() }))
    .mutation(async ({ input }) => {
      await toggleShoppingItem(input.itemId, input.checked);
      return { success: true };
    }),
  scheduleDelivery: protectedProcedure
    .input(z.object({
      listId: z.number(),
      deliveryAt: z.string(),
      deliveryAddress: z.string(),
    }))
    .mutation(async ({ input }) => {
      await scheduleDelivery(input.listId, new Date(input.deliveryAt), input.deliveryAddress);
      return { success: true };
    }),
  suggestItems: protectedProcedure
    .input(z.object({ context: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const prefs = await getUserPreferences(ctx.user.id);
      const restrictions = (prefs?.dietaryRestrictions as string[]) ?? [];
      const cuisines = (prefs?.cuisineTypes as string[]) ?? [];

      const prompt = `Você é um assistente de compras inteligente para uma plataforma brasileira. 
      O usuário tem as seguintes preferências: culinárias favoritas: ${cuisines.join(", ") || "variadas"}, restrições alimentares: ${restrictions.join(", ") || "nenhuma"}.
      Contexto do usuário: "${input.context}".
      Sugira 8 itens de compras relevantes e práticos para uma pessoa que mora sozinha no Brasil.
      Responda em JSON com o formato: {"items": [{"name": "nome", "quantity": "quantidade", "unit": "unidade", "category": "categoria", "estimatedPrice": valor_em_reais}]}
      Categorias possíveis: Hortifruti, Proteínas, Laticínios, Grãos e Cereais, Bebidas, Limpeza, Higiene, Outros.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um assistente de compras especializado em alimentação saudável para pessoas que moram sozinhas no Brasil. Responda sempre em JSON válido." },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "shopping_suggestions",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        quantity: { type: "string" },
                        unit: { type: "string" },
                        category: { type: "string" },
                        estimatedPrice: { type: "number" },
                      },
                      required: ["name", "quantity", "unit", "category", "estimatedPrice"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["items"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        if (content && typeof content === "string") {
          const parsed = JSON.parse(content);
          return parsed.items ?? [];
        }
      } catch (e) {
        console.error("LLM suggestion error:", e);
      }

      return [
        { name: "Frango grelhado", quantity: "500", unit: "g", category: "Proteínas", estimatedPrice: 18 },
        { name: "Arroz integral", quantity: "1", unit: "kg", category: "Grãos e Cereais", estimatedPrice: 8 },
        { name: "Feijão carioca", quantity: "500", unit: "g", category: "Grãos e Cereais", estimatedPrice: 6 },
        { name: "Tomate", quantity: "500", unit: "g", category: "Hortifruti", estimatedPrice: 5 },
        { name: "Alface", quantity: "1", unit: "pé", category: "Hortifruti", estimatedPrice: 3 },
        { name: "Leite integral", quantity: "1", unit: "L", category: "Laticínios", estimatedPrice: 5 },
        { name: "Ovos", quantity: "12", unit: "unidades", category: "Proteínas", estimatedPrice: 12 },
        { name: "Banana", quantity: "1", unit: "kg", category: "Hortifruti", estimatedPrice: 6 },
      ];
    }),
});

// ─── Reviews Router ───────────────────────────────────────────────────────────
const reviewsRouter = router({
  create: protectedProcedure
    .input(z.object({
      bookingId: z.number(),
      providerType: z.enum(["chef", "cleaner"]),
      providerId: z.number(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await createReview({ userId: ctx.user.id, ...input });
      return { success: true };
    }),
  listByProvider: publicProcedure
    .input(z.object({
      providerId: z.number(),
      providerType: z.enum(["chef", "cleaner"]),
    }))
    .query(async ({ input }) => {
      return getProviderReviews(input.providerId, input.providerType);
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  preferences: preferencesRouter,
  chefs: chefsRouter,
  cleaners: cleanersRouter,
  bookings: bookingsRouter,
  shopping: shoppingRouter,
  reviews: reviewsRouter,
});

export type AppRouter = typeof appRouter;
