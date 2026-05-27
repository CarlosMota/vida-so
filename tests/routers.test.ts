import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("../server/db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  updateUserProfile: vi.fn().mockResolvedValue(undefined),
  getUserPreferences: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    cuisineTypes: ["Brasileira", "Italiana"],
    dietaryRestrictions: [],
    allergies: [],
    monthlyBudget: 600,
    preferredDeliveryTime: "08:00",
    onboardingCompleted: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  upsertUserPreferences: vi.fn().mockResolvedValue(undefined),
  listChefs: vi.fn().mockResolvedValue([
    { id: 1, name: "Chef Ana", cuisineTypes: ["Brasileira"], pricePerPerson: 80, city: "São Paulo", rating: 4.8, totalReviews: 12, experience: 5, isAvailable: true, bio: "Especialista em culinária brasileira" },
  ]),
  getChefById: vi.fn().mockResolvedValue({
    id: 1, name: "Chef Ana", cuisineTypes: ["Brasileira"], specialties: ["Marmitas saudáveis"], pricePerPerson: 80, city: "São Paulo", rating: 4.8, totalReviews: 12, experience: 5, isAvailable: true, bio: "Especialista em culinária brasileira",
  }),
  matchChefsForUser: vi.fn().mockResolvedValue([
    { id: 1, name: "Chef Ana", cuisineTypes: ["Brasileira"], pricePerPerson: 80, city: "São Paulo", rating: 4.8, totalReviews: 12, experience: 5, isAvailable: true, bio: "Especialista", matchScore: 95 },
  ]),
  listCleaners: vi.fn().mockResolvedValue([
    { id: 1, name: "Maria Limpeza", serviceTypes: ["Limpeza básica"], priceBasic: 150, priceDeep: 250, priceWeekly: 400, city: "São Paulo", rating: 4.9, totalReviews: 8, isAvailable: true, bio: "Profissional experiente" },
  ]),
  getCleanerById: vi.fn().mockResolvedValue({
    id: 1, name: "Maria Limpeza", serviceTypes: ["Limpeza básica"], priceBasic: 150, priceDeep: 250, priceWeekly: 400, city: "São Paulo", rating: 4.9, totalReviews: 8, isAvailable: true, bio: "Profissional experiente",
  }),
  createBooking: vi.fn().mockResolvedValue(undefined),
  getUserBookings: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, serviceType: "chef", providerId: 1, status: "pending", scheduledAt: new Date("2026-06-01T10:00:00"), totalPrice: 160, address: "Rua A, 100", serviceSubtype: "2 pessoas", createdAt: new Date(), updatedAt: new Date() },
  ]),
  updateBookingStatus: vi.fn().mockResolvedValue(undefined),
  getProviderBookings: vi.fn().mockResolvedValue([]),
  getUserShoppingLists: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, name: "Lista da semana", status: "draft", deliveryAt: null, deliveryAddress: null, totalEstimate: 0, createdAt: new Date(), updatedAt: new Date() },
  ]),
  createShoppingList: vi.fn().mockResolvedValue(undefined),
  getShoppingListById: vi.fn().mockResolvedValue({ id: 1, userId: 1, name: "Lista da semana", status: "draft" }),
  getShoppingItems: vi.fn().mockResolvedValue([
    { id: 1, listId: 1, name: "Frango", quantity: "500", unit: "g", estimatedPrice: 18, category: "Proteínas", checked: false, createdAt: new Date() },
  ]),
  addShoppingItem: vi.fn().mockResolvedValue(undefined),
  removeShoppingItem: vi.fn().mockResolvedValue(undefined),
  toggleShoppingItem: vi.fn().mockResolvedValue(undefined),
  scheduleDelivery: vi.fn().mockResolvedValue(undefined),
  createReview: vi.fn().mockResolvedValue(undefined),
  getProviderReviews: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, bookingId: 1, providerType: "chef", providerId: 1, rating: 5, comment: "Excelente!", createdAt: new Date() },
  ]),
}));

// ─── Mock LLM ─────────────────────────────────────────────────────────────────
vi.mock("../server/_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: JSON.stringify({ items: [{ name: "Arroz", quantity: "1", unit: "kg", category: "Grãos e Cereais", estimatedPrice: 8 }] }) } }],
  }),
}));

// ─── Context helpers ───────────────────────────────────────────────────────────
function createAuthCtx(): TrpcContext {
  return {
    user: { id: 1, openId: "test-user", email: "test@vidasó.com", name: "Test User", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("auth", () => {
  it("me returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user for authenticated users", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const result = await caller.auth.me();
    expect(result).toMatchObject({ id: 1, name: "Test User" });
  });
});

describe("preferences", () => {
  it("get returns user preferences", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const prefs = await caller.preferences.get();
    expect(prefs).toMatchObject({ cuisineTypes: ["Brasileira", "Italiana"], monthlyBudget: 600 });
  });

  it("save preferences returns success", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const result = await caller.preferences.save({ cuisineTypes: ["Japonesa"], monthlyBudget: 800, onboardingCompleted: true });
    expect(result).toEqual({ success: true });
  });
});

describe("chefs", () => {
  it("list returns chefs publicly", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const chefs = await caller.chefs.list({});
    expect(chefs).toHaveLength(1);
    expect(chefs[0]).toMatchObject({ name: "Chef Ana", city: "São Paulo" });
  });

  it("getById returns chef details", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const chef = await caller.chefs.getById({ id: 1 });
    expect(chef).toMatchObject({ id: 1, name: "Chef Ana" });
  });

  it("match returns AI-matched chefs for authenticated users", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const matched = await caller.chefs.match();
    expect(matched[0]).toMatchObject({ matchScore: 95 });
  });

  it("match throws for unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.chefs.match()).rejects.toThrow();
  });
});

describe("cleaners", () => {
  it("list returns cleaners publicly", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const cleaners = await caller.cleaners.list({});
    expect(cleaners).toHaveLength(1);
    expect(cleaners[0]).toMatchObject({ name: "Maria Limpeza" });
  });
});

describe("bookings", () => {
  it("list returns user bookings", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const bookings = await caller.bookings.list();
    expect(bookings).toHaveLength(1);
    expect(bookings[0]).toMatchObject({ serviceType: "chef", status: "pending" });
  });

  it("create booking returns success", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const result = await caller.bookings.create({
      serviceType: "chef",
      providerId: 1,
      scheduledAt: "2026-06-01T10:00:00",
      totalPrice: 160,
      address: "Rua A, 100",
    });
    expect(result).toEqual({ success: true });
  });

  it("cancel booking returns success", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const result = await caller.bookings.cancel({ bookingId: 1 });
    expect(result).toEqual({ success: true });
  });

  it("list throws for unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.bookings.list()).rejects.toThrow();
  });
});

describe("shopping", () => {
  it("getLists returns user lists", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const lists = await caller.shopping.getLists();
    expect(lists).toHaveLength(1);
    expect(lists[0]).toMatchObject({ name: "Lista da semana" });
  });

  it("createList returns success", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const result = await caller.shopping.createList({ name: "Lista de fim de semana" });
    expect(result).toEqual({ success: true });
  });

  it("getItems returns list items", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const items = await caller.shopping.getItems({ listId: 1 });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ name: "Frango", category: "Proteínas" });
  });

  it("suggestItems returns AI suggestions", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const suggestions = await caller.shopping.suggestItems({ context: "jantar saudável" });
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]).toMatchObject({ name: "Arroz", category: "Grãos e Cereais" });
  });
});

describe("reviews", () => {
  it("create review returns success", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const result = await caller.reviews.create({
      bookingId: 1,
      providerType: "chef",
      providerId: 1,
      rating: 5,
      comment: "Excelente serviço!",
    });
    expect(result).toEqual({ success: true });
  });

  it("listByProvider returns reviews publicly", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const reviews = await caller.reviews.listByProvider({ providerId: 1, providerType: "chef" });
    expect(reviews).toHaveLength(1);
    expect(reviews[0]).toMatchObject({ rating: 5, comment: "Excelente!" });
  });
});
