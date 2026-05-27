import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "provider"]).default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cuisineTypes: json("cuisineTypes").$type<string[]>().default([]),
  dietaryRestrictions: json("dietaryRestrictions").$type<string[]>().default([]),
  allergies: json("allergies").$type<string[]>().default([]),
  monthlyBudget: float("monthlyBudget").default(0),
  preferredDeliveryTime: varchar("preferredDeliveryTime", { length: 10 }),
  onboardingCompleted: boolean("onboardingCompleted").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const chefs = mysqlTable("chefs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 150 }).notNull(),
  bio: text("bio"),
  photoUrl: text("photoUrl"),
  specialties: json("specialties").$type<string[]>().default([]),
  cuisineTypes: json("cuisineTypes").$type<string[]>().default([]),
  pricePerPerson: float("pricePerPerson").notNull(),
  city: varchar("city", { length: 100 }),
  rating: float("rating").default(0),
  totalReviews: int("totalReviews").default(0),
  experience: int("experience").default(0),
  isAvailable: boolean("isAvailable").default(true),
  portfolioImages: json("portfolioImages").$type<string[]>().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const cleaners = mysqlTable("cleaners", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 150 }).notNull(),
  bio: text("bio"),
  photoUrl: text("photoUrl"),
  serviceTypes: json("serviceTypes").$type<string[]>().default([]),
  priceBasic: float("priceBasic").default(150),
  priceDeep: float("priceDeep").default(250),
  priceWeekly: float("priceWeekly").default(400),
  city: varchar("city", { length: 100 }),
  rating: float("rating").default(0),
  totalReviews: int("totalReviews").default(0),
  isAvailable: boolean("isAvailable").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  serviceType: mysqlEnum("serviceType", ["chef", "cleaning", "shopping"]).notNull(),
  providerId: int("providerId"),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending").notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  notes: text("notes"),
  totalPrice: float("totalPrice"),
  address: text("address"),
  serviceSubtype: varchar("serviceSubtype", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const shoppingLists = mysqlTable("shopping_lists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  status: mysqlEnum("status", ["draft", "ordered", "delivered", "cancelled"]).default("draft").notNull(),
  deliveryAt: timestamp("deliveryAt"),
  deliveryAddress: text("deliveryAddress"),
  totalEstimate: float("totalEstimate").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const shoppingItems = mysqlTable("shopping_items", {
  id: int("id").autoincrement().primaryKey(),
  listId: int("listId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  quantity: varchar("quantity", { length: 50 }).default("1"),
  unit: varchar("unit", { length: 30 }),
  estimatedPrice: float("estimatedPrice"),
  category: varchar("category", { length: 50 }),
  checked: boolean("checked").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bookingId: int("bookingId").notNull(),
  providerType: mysqlEnum("providerType", ["chef", "cleaner"]).notNull(),
  providerId: int("providerId").notNull(),
  rating: int("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Chef = typeof chefs.$inferSelect;
export type Cleaner = typeof cleaners.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type ShoppingList = typeof shoppingLists.$inferSelect;
export type ShoppingItem = typeof shoppingItems.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
