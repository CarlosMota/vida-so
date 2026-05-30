import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

// Step 1: real tRPC HTTP client in parallel with the current mock client.
// Keep this untyped for now to avoid coupling frontend build to server files.
type UntypedRouter = any;

const trpcUrl = `${import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3001"}/trpc`;

export const trpcReal = createTRPCProxyClient<UntypedRouter>({
  links: [
    httpBatchLink({
      url: trpcUrl,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});

export const trpcRealEndpoint = trpcUrl;

type SystemHealthResponse = { ok: boolean; service: string };
type AuthMeResponse = {
  id: number;
  openId: string;
  email?: string | null;
  name?: string | null;
  loginMethod?: string | null;
  role?: "user" | "admin" | "provider";
  avatarUrl?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  lastSignedIn?: Date;
} | null;

type TrpcRealSystemHealth = {
  system: {
    health: {
      query: () => Promise<SystemHealthResponse>;
    };
  };
};

type TrpcRealAuthMe = {
  auth: {
    me: {
      query: () => Promise<AuthMeResponse>;
    };
    logout: {
      mutate: () => Promise<{ success: true }>;
    };
  };
};

type TrpcRealChefs = {
  chefs: {
    list: {
      query: (input?: {
        city?: string;
        cuisine?: string;
        maxPrice?: number;
        minRating?: number;
      }) => Promise<any[]>;
    };
    match: {
      query: () => Promise<any[]>;
    };
    getById: {
      query: (input: { id: number }) => Promise<any | null>;
    };
    getReviews: {
      query: (input: { chefId: number }) => Promise<any[]>;
    };
  };
};

type TrpcRealCleaners = {
  cleaners: {
    list: {
      query: (input?: { city?: string; serviceType?: string }) => Promise<any[]>;
    };
  };
};

type TrpcRealDashboard = {
  bookings: {
    list: {
      query: () => Promise<any[]>;
    };
  };
  preferences: {
    get: {
      query: () => Promise<any | null>;
    };
  };
  shopping: {
    getLists: {
      query: () => Promise<any[]>;
    };
  };
};

type TrpcRealPreferences = {
  preferences: {
    save: {
      mutate: (input: {
        cuisineTypes?: string[];
        dietaryRestrictions?: string[];
        allergies?: string[];
        monthlyBudget?: number;
        preferredDeliveryTime?: string;
        onboardingCompleted?: boolean;
      }) => Promise<{ success: true }>;
    };
  };
};

type TrpcRealUsersProvidersAi = {
  users: {
    createCustomer: {
      mutate: (input: {
        name: string;
        email: string;
        phone?: string;
        userType?: "CUSTOMER" | "CLIENT";
      }) => Promise<{ success: true; userId: number | null }>;
    };
  };
  providers: {
    createChef: {
      mutate: (input: {
        name: string;
        email: string;
        phone?: string;
        city: string;
        specialties: string[];
        cuisineTypes: string[];
        pricePerPerson: number;
        bio?: string;
        experience?: number;
        isAvailable?: boolean;
        providerType?: "CHEF";
      }) => Promise<{ success: true }>;
    };
    createCleaner: {
      mutate: (input: {
        name: string;
        email: string;
        phone?: string;
        city: string;
        serviceTypes: string[];
        priceBasic: number;
        priceDeep?: number;
        priceWeekly?: number;
        bio?: string;
        isAvailable?: boolean;
        providerType?: "CLEANER";
      }) => Promise<{ success: true }>;
    };
  };
  ai: {
    suggestChef: {
      mutate: (input: {
        location: string;
        peopleCount: number;
        eventType?: string;
        dietaryPreferences?: string[];
        budget?: number;
        desiredDate?: string;
      }) => Promise<any>;
    };
    suggestCleaner: {
      mutate: (input: {
        location: string;
        propertyType?: string;
        roomCount?: number;
        cleaningType: string;
        desiredDate?: string;
      }) => Promise<any>;
    };
    suggestShoppingItems: {
      mutate: (input: {
        mealPlan: string;
        peopleCount: number;
        dietaryPreferences?: string[];
        budget?: number;
      }) => Promise<any>;
    };
    generatePlan: {
      mutate: (input: {
        location: string;
        peopleCount: number;
        eventType?: string;
        budget?: number;
        cleaningType?: string;
        desiredDate?: string;
      }) => Promise<any>;
    };
  };
};

type TrpcRealShopping = {
  shopping: {
    getLists: {
      query: () => Promise<any[]>;
    };
    getItems: {
      query: (input: { listId: number }) => Promise<any[]>;
    };
    createList: {
      mutate: (input: { name: string }) => Promise<{ success: true }>;
    };
    addItem: {
      mutate: (input: {
        listId: number;
        name: string;
        quantity?: string;
        unit?: string;
        estimatedPrice?: number;
        category?: string;
      }) => Promise<{ success: true }>;
    };
    removeItem: {
      mutate: (input: { itemId: number }) => Promise<{ success: true }>;
    };
    toggleItem: {
      mutate: (input: { itemId: number; checked: boolean }) => Promise<{ success: true }>;
    };
    scheduleDelivery: {
      mutate: (input: { listId: number; deliveryAt: string; deliveryAddress: string }) => Promise<{ success: true }>;
    };
    suggestItems: {
      mutate: (input: { context: string }) => Promise<any[]>;
    };
  };
};

type TrpcRealBookingsReviews = {
  bookings: {
    create: {
      mutate: (input: {
        serviceType: "chef" | "cleaning" | "shopping";
        providerId?: number;
        scheduledAt: string;
        notes?: string;
        totalPrice?: number;
        address?: string;
        serviceSubtype?: string;
      }) => Promise<{ success: true }>;
    };
    cancel: {
      mutate: (input: { bookingId: number }) => Promise<{ success: true }>;
    };
    getProviderBookings: {
      query: (input: { providerId: number; serviceType: "chef" | "cleaning" }) => Promise<any[]>;
    };
  };
  reviews: {
    create: {
      mutate: (input: {
        bookingId: number;
        providerType: "chef" | "cleaner";
        providerId: number;
        rating: number;
        comment?: string;
      }) => Promise<{ success: true }>;
    };
  };
};

export async function getSystemHealthReal() {
  const client = trpcReal as unknown as TrpcRealSystemHealth;
  return client.system.health.query();
}

export async function getAuthMeReal() {
  const client = trpcReal as unknown as TrpcRealAuthMe;
  return client.auth.me.query();
}

export async function logoutReal() {
  const client = trpcReal as unknown as TrpcRealAuthMe;
  return client.auth.logout.mutate();
}

export async function getChefsListReal(input?: {
  city?: string;
  cuisine?: string;
  maxPrice?: number;
  minRating?: number;
}) {
  const client = trpcReal as unknown as TrpcRealChefs;
  return client.chefs.list.query(input);
}

export async function getChefsMatchReal() {
  const client = trpcReal as unknown as TrpcRealChefs;
  return client.chefs.match.query();
}

export async function getChefByIdReal(id: number) {
  const client = trpcReal as unknown as TrpcRealChefs;
  return client.chefs.getById.query({ id });
}

export async function getChefReviewsReal(chefId: number) {
  const client = trpcReal as unknown as TrpcRealChefs;
  return client.chefs.getReviews.query({ chefId });
}

export async function getCleanersListReal(input?: { city?: string; serviceType?: string }) {
  const client = trpcReal as unknown as TrpcRealCleaners;
  return client.cleaners.list.query(input);
}

export async function getBookingsListReal() {
  const client = trpcReal as unknown as TrpcRealDashboard;
  return client.bookings.list.query();
}

export async function getPreferencesReal() {
  const client = trpcReal as unknown as TrpcRealDashboard;
  return client.preferences.get.query();
}

export async function getShoppingListsReal() {
  const client = trpcReal as unknown as TrpcRealShopping;
  return client.shopping.getLists.query();
}

export async function getShoppingItemsReal(listId: number) {
  const client = trpcReal as unknown as TrpcRealShopping;
  return client.shopping.getItems.query({ listId });
}

export async function createShoppingListReal(input: { name: string }) {
  const client = trpcReal as unknown as TrpcRealShopping;
  return client.shopping.createList.mutate(input);
}

export async function addShoppingItemReal(input: {
  listId: number;
  name: string;
  quantity?: string;
  unit?: string;
  estimatedPrice?: number;
  category?: string;
}) {
  const client = trpcReal as unknown as TrpcRealShopping;
  return client.shopping.addItem.mutate(input);
}

export async function removeShoppingItemReal(input: { itemId: number }) {
  const client = trpcReal as unknown as TrpcRealShopping;
  return client.shopping.removeItem.mutate(input);
}

export async function toggleShoppingItemReal(input: { itemId: number; checked: boolean }) {
  const client = trpcReal as unknown as TrpcRealShopping;
  return client.shopping.toggleItem.mutate(input);
}

export async function scheduleShoppingDeliveryReal(input: { listId: number; deliveryAt: string; deliveryAddress: string }) {
  const client = trpcReal as unknown as TrpcRealShopping;
  return client.shopping.scheduleDelivery.mutate(input);
}

export async function suggestShoppingItemsReal(input: { context: string }) {
  const client = trpcReal as unknown as TrpcRealShopping;
  return client.shopping.suggestItems.mutate(input);
}

export async function createBookingReal(input: {
  serviceType: "chef" | "cleaning" | "shopping";
  providerId?: number;
  scheduledAt: string;
  notes?: string;
  totalPrice?: number;
  address?: string;
  serviceSubtype?: string;
}) {
  const client = trpcReal as unknown as TrpcRealBookingsReviews;
  return client.bookings.create.mutate(input);
}

export async function cancelBookingReal(input: { bookingId: number }) {
  const client = trpcReal as unknown as TrpcRealBookingsReviews;
  return client.bookings.cancel.mutate(input);
}

export async function createReviewReal(input: {
  bookingId: number;
  providerType: "chef" | "cleaner";
  providerId: number;
  rating: number;
  comment?: string;
}) {
  const client = trpcReal as unknown as TrpcRealBookingsReviews;
  return client.reviews.create.mutate(input);
}

export async function getProviderBookingsReal(input: { providerId: number; serviceType: "chef" | "cleaning" }) {
  const client = trpcReal as unknown as TrpcRealBookingsReviews;
  return client.bookings.getProviderBookings.query(input);
}

export async function savePreferencesReal(input: {
  cuisineTypes?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
  monthlyBudget?: number;
  preferredDeliveryTime?: string;
  onboardingCompleted?: boolean;
}) {
  const client = trpcReal as unknown as TrpcRealPreferences;
  return client.preferences.save.mutate(input);
}

export async function createCustomerReal(input: {
  name: string;
  email: string;
  phone?: string;
  userType?: "CUSTOMER" | "CLIENT";
}) {
  const client = trpcReal as unknown as TrpcRealUsersProvidersAi;
  return client.users.createCustomer.mutate(input);
}

export async function createChefReal(input: {
  name: string;
  email: string;
  phone?: string;
  city: string;
  specialties: string[];
  cuisineTypes: string[];
  pricePerPerson: number;
  bio?: string;
  experience?: number;
  isAvailable?: boolean;
  providerType?: "CHEF";
}) {
  const client = trpcReal as unknown as TrpcRealUsersProvidersAi;
  return client.providers.createChef.mutate(input);
}

export async function createCleanerReal(input: {
  name: string;
  email: string;
  phone?: string;
  city: string;
  serviceTypes: string[];
  priceBasic: number;
  priceDeep?: number;
  priceWeekly?: number;
  bio?: string;
  isAvailable?: boolean;
  providerType?: "CLEANER";
}) {
  const client = trpcReal as unknown as TrpcRealUsersProvidersAi;
  return client.providers.createCleaner.mutate(input);
}

export async function aiSuggestChefReal(input: {
  location: string;
  peopleCount: number;
  eventType?: string;
  dietaryPreferences?: string[];
  budget?: number;
  desiredDate?: string;
}) {
  const client = trpcReal as unknown as TrpcRealUsersProvidersAi;
  return client.ai.suggestChef.mutate(input);
}
