import { eq, and, desc, like, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  chefs,
  cleaners,
  bookings,
  shoppingLists,
  shoppingItems,
  reviews,
  userPreferences,
} from "./schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function updateUserProfile(userId: number, data: Partial<{ name: string; phone: string; address: string; city: string; avatarUrl: string }>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

// ─── User Preferences ─────────────────────────────────────────────────────────

export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function upsertUserPreferences(userId: number, data: {
  cuisineTypes?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
  monthlyBudget?: number;
  preferredDeliveryTime?: string;
  onboardingCompleted?: boolean;
}) {
  const db = await getDb();
  if (!db) return;
  const existing = await getUserPreferences(userId);
  if (existing) {
    await db.update(userPreferences).set(data).where(eq(userPreferences.userId, userId));
  } else {
    await db.insert(userPreferences).values({ userId, ...data });
  }
}

// ─── Chefs ────────────────────────────────────────────────────────────────────

export async function listChefs(filters?: { city?: string; cuisine?: string; maxPrice?: number; minRating?: number }) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(chefs).where(eq(chefs.isAvailable, true));
  const result = await query.orderBy(desc(chefs.rating));
  return result.filter((c) => {
    if (filters?.maxPrice && c.pricePerPerson > filters.maxPrice) return false;
    if (filters?.minRating && (c.rating ?? 0) < filters.minRating) return false;
    if (filters?.city && c.city && !c.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters?.cuisine) {
      const types = (c.cuisineTypes as string[]) ?? [];
      if (!types.some((t) => t.toLowerCase().includes(filters.cuisine!.toLowerCase()))) return false;
    }
    return true;
  });
}

export async function getChefById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(chefs).where(eq(chefs.id, id)).limit(1);
  return result[0] ?? null;
}

export async function matchChefsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const prefs = await getUserPreferences(userId);
  const allChefs = await db.select().from(chefs).where(eq(chefs.isAvailable, true));

  const scored = allChefs.map((chef) => {
    let score = 0;
    const cuisineTypes = (chef.cuisineTypes as string[]) ?? [];
    const userCuisines = (prefs?.cuisineTypes as string[]) ?? [];

    // Score por culinária preferida
    userCuisines.forEach((uc) => {
      if (cuisineTypes.some((ct) => ct.toLowerCase().includes(uc.toLowerCase()))) score += 30;
    });

    // Score por avaliação
    score += (chef.rating ?? 0) * 10;

    // Score por experiência
    score += Math.min((chef.experience ?? 0) * 2, 20);

    // Penalidade por preço alto (se orçamento definido)
    if (prefs?.monthlyBudget && prefs.monthlyBudget > 0) {
      const budget = prefs.monthlyBudget;
      if (chef.pricePerPerson <= budget / 4) score += 15;
      else if (chef.pricePerPerson > budget / 2) score -= 10;
    }

    return { ...chef, matchScore: Math.round(score) };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore);
}

// ─── Cleaners ─────────────────────────────────────────────────────────────────

export async function listCleaners(filters?: { city?: string; serviceType?: string }) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(cleaners).where(eq(cleaners.isAvailable, true)).orderBy(desc(cleaners.rating));
  return result.filter((c) => {
    if (filters?.city && c.city && !c.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters?.serviceType) {
      const types = (c.serviceTypes as string[]) ?? [];
      if (!types.some((t) => t.toLowerCase().includes(filters.serviceType!.toLowerCase()))) return false;
    }
    return true;
  });
}

export async function getCleanerById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(cleaners).where(eq(cleaners.id, id)).limit(1);
  return result[0] ?? null;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function createBooking(data: {
  userId: number;
  serviceType: "chef" | "cleaning" | "shopping";
  providerId?: number;
  scheduledAt: Date;
  notes?: string;
  totalPrice?: number;
  address?: string;
  serviceSubtype?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(bookings).values({ ...data, status: "pending" });
  return result;
}

export async function getUserBookings(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.scheduledAt));
}

export async function getBookingById(bookingId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  return result[0] ?? null;
}

export async function updateBookingStatus(bookingId: number, status: "pending" | "confirmed" | "completed" | "cancelled") {
  const db = await getDb();
  if (!db) return;
  await db.update(bookings).set({ status }).where(eq(bookings.id, bookingId));
}

export async function getProviderBookings(providerId: number, serviceType: "chef" | "cleaning") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings)
    .where(and(eq(bookings.providerId, providerId), eq(bookings.serviceType, serviceType)))
    .orderBy(desc(bookings.scheduledAt));
}

// ─── Shopping ─────────────────────────────────────────────────────────────────

export async function getUserShoppingLists(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shoppingLists).where(eq(shoppingLists.userId, userId)).orderBy(desc(shoppingLists.createdAt));
}

export async function createShoppingList(userId: number, name: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(shoppingLists).values({ userId, name, status: "draft" });
  return result;
}

export async function getShoppingListById(listId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(shoppingLists).where(eq(shoppingLists.id, listId)).limit(1);
  return result[0] ?? null;
}

export async function getShoppingItems(listId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shoppingItems).where(eq(shoppingItems.listId, listId)).orderBy(shoppingItems.createdAt);
}

export async function getShoppingItemById(itemId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(shoppingItems).where(eq(shoppingItems.id, itemId)).limit(1);
  return result[0] ?? null;
}

export async function addShoppingItem(listId: number, item: { name: string; quantity?: string; unit?: string; estimatedPrice?: number; category?: string }) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(shoppingItems).values({ listId, ...item });
}

export async function removeShoppingItem(itemId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(shoppingItems).where(eq(shoppingItems.id, itemId));
}

export async function toggleShoppingItem(itemId: number, checked: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(shoppingItems).set({ checked }).where(eq(shoppingItems.id, itemId));
}

export async function scheduleDelivery(listId: number, deliveryAt: Date, deliveryAddress: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(shoppingLists).set({ deliveryAt, deliveryAddress, status: "ordered" }).where(eq(shoppingLists.id, listId));
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function createReview(data: {
  userId: number;
  bookingId: number;
  providerType: "chef" | "cleaner";
  providerId: number;
  rating: number;
  comment?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(reviews).values(data);

  // Atualizar rating médio do provedor
  const allReviews = await db.select().from(reviews)
    .where(and(eq(reviews.providerId, data.providerId), eq(reviews.providerType, data.providerType)));
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  const totalReviews = allReviews.length;

  if (data.providerType === "chef") {
    await db.update(chefs).set({ rating: avgRating, totalReviews }).where(eq(chefs.id, data.providerId));
  } else {
    await db.update(cleaners).set({ rating: avgRating, totalReviews }).where(eq(cleaners.id, data.providerId));
  }
}

export async function getProviderReviews(providerId: number, providerType: "chef" | "cleaner") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews)
    .where(and(eq(reviews.providerId, providerId), eq(reviews.providerType, providerType)))
    .orderBy(desc(reviews.createdAt));
}
