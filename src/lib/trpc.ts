import { useCallback, useState, useSyncExternalStore } from "react";

type QueryOptions = {
  enabled?: boolean;
};

type MutationOptions<TData = unknown, TVariables = unknown> = {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: unknown) => void;
};

let version = 0;
const listeners = new Set<() => void>();

const notify = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

function useDemoQuery<TInput, TData>(
  input: TInput,
  options: QueryOptions | undefined,
  resolver: (input: TInput) => TData,
) {
  useSyncExternalStore(subscribe, () => version, () => version);
  const enabled = options?.enabled ?? true;

  return {
    data: enabled ? resolver(input) : undefined,
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: async () => ({ data: resolver(input) }),
  };
}

function useDemoMutation<TInput, TData>(
  resolver: (input: TInput) => TData | Promise<TData>,
  options?: MutationOptions<TData, TInput>,
) {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(
    async (input: TInput) => {
      setIsPending(true);
      try {
        const result = await resolver(input);
        notify();
        await options?.onSuccess?.(result, input);
        return result;
      } catch (error) {
        options?.onError?.(error);
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [options, resolver],
  );

  const mutate = useCallback(
    (input?: TInput) => {
      void mutateAsync(input as TInput);
    },
    [mutateAsync],
  );

  return { mutate, mutateAsync, isPending };
}

const now = Date.now();
const daysFromNow = (days: number) => new Date(now + days * 24 * 60 * 60 * 1000);

const chefs = [
  {
    id: 1,
    name: "Chef Ana Beatriz",
    bio: "Especialista em comida brasileira afetiva, marmitas saudáveis e cardápios para rotina corrida.",
    photoUrl: "",
    specialties: ["Marmitas saudáveis", "Jantar para amigos", "Comida caseira premium"],
    cuisineTypes: ["Brasileira", "Saudável"],
    pricePerPerson: 80,
    city: "São Paulo",
    rating: 4.8,
    totalReviews: 32,
    experience: 6,
    isAvailable: true,
  },
  {
    id: 2,
    name: "Chef Marco Bellini",
    bio: "Chef italiano com foco em massas artesanais, risotos e menus completos para pequenas recepções.",
    photoUrl: "",
    specialties: ["Massas frescas", "Risotos", "Menu degustação"],
    cuisineTypes: ["Italiana", "Mediterrânea"],
    pricePerPerson: 120,
    city: "Rio de Janeiro",
    rating: 4.9,
    totalReviews: 48,
    experience: 10,
    isAvailable: true,
  },
  {
    id: 3,
    name: "Chef Lina Sato",
    bio: "Cozinha japonesa contemporânea, bowls nutritivos e preparo semanal com ingredientes frescos.",
    photoUrl: "",
    specialties: ["Comida japonesa", "Bowls", "Meal prep"],
    cuisineTypes: ["Japonesa", "Saudável"],
    pricePerPerson: 110,
    city: "São Paulo",
    rating: 4.7,
    totalReviews: 21,
    experience: 5,
    isAvailable: true,
  },
  {
    id: 4,
    name: "Chef Bruno Lima",
    bio: "Menus veganos práticos, saborosos e pensados para compras econômicas sem perder variedade.",
    photoUrl: "",
    specialties: ["Vegano", "Low carb", "Congelados"],
    cuisineTypes: ["Vegana", "Saudável"],
    pricePerPerson: 95,
    city: "Belo Horizonte",
    rating: 4.6,
    totalReviews: 18,
    experience: 4,
    isAvailable: true,
  },
];

const cleaners = [
  {
    id: 1,
    name: "Maria Oliveira",
    bio: "Profissional detalhista para limpeza recorrente, organização de cozinha e manutenção semanal.",
    photoUrl: "",
    serviceTypes: ["Limpeza básica", "Limpeza semanal"],
    priceBasic: 150,
    priceDeep: 260,
    priceWeekly: 420,
    city: "São Paulo",
    rating: 4.9,
    totalReviews: 40,
    isAvailable: true,
  },
  {
    id: 2,
    name: "Juliana Castro",
    bio: "Atendimento para apartamentos pequenos, limpeza pós-viagem e higienização profunda.",
    photoUrl: "",
    serviceTypes: ["Limpeza básica", "Limpeza profunda"],
    priceBasic: 140,
    priceDeep: 250,
    priceWeekly: 390,
    city: "Rio de Janeiro",
    rating: 4.7,
    totalReviews: 27,
    isAvailable: true,
  },
  {
    id: 3,
    name: "Renata Souza",
    bio: "Experiência com casas com pets, organização leve e limpeza de rotina para moradores solo.",
    photoUrl: "",
    serviceTypes: ["Limpeza semanal", "Limpeza profunda"],
    priceBasic: 160,
    priceDeep: 280,
    priceWeekly: 450,
    city: "Belo Horizonte",
    rating: 4.8,
    totalReviews: 33,
    isAvailable: true,
  },
];

let preferences = {
  id: 1,
  userId: 1,
  cuisineTypes: ["Brasileira", "Italiana", "Saudável"],
  dietaryRestrictions: ["Sem lactose"],
  allergies: [],
  monthlyBudget: 800,
  preferredDeliveryTime: "19:00",
  onboardingCompleted: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

let bookings = [
  {
    id: 1,
    userId: 1,
    serviceType: "chef",
    providerId: 1,
    status: "confirmed",
    scheduledAt: daysFromNow(3),
    totalPrice: 160,
    address: "Rua das Flores, 120",
    serviceSubtype: "2 pessoas",
    notes: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    userId: 1,
    serviceType: "cleaning",
    providerId: 1,
    status: "pending",
    scheduledAt: daysFromNow(6),
    totalPrice: 150,
    address: "Rua das Flores, 120",
    serviceSubtype: "Limpeza Básica",
    notes: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    userId: 1,
    serviceType: "chef",
    providerId: 2,
    status: "completed",
    scheduledAt: daysFromNow(-10),
    totalPrice: 240,
    address: "Rua das Flores, 120",
    serviceSubtype: "2 pessoas",
    notes: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let shoppingLists = [
  {
    id: 1,
    userId: 1,
    name: "Lista da semana",
    status: "draft",
    deliveryAt: null,
    deliveryAddress: null,
    totalEstimate: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    userId: 1,
    name: "Jantar italiano",
    status: "ordered",
    deliveryAt: daysFromNow(1),
    deliveryAddress: "Rua das Flores, 120",
    totalEstimate: 96,
    createdAt: daysFromNow(-2),
    updatedAt: new Date(),
  },
];

let shoppingItems = [
  { id: 1, listId: 1, name: "Arroz integral", quantity: "1", unit: "kg", estimatedPrice: 8, category: "Grãos e Cereais", checked: false, createdAt: new Date() },
  { id: 2, listId: 1, name: "Frango", quantity: "500", unit: "g", estimatedPrice: 18, category: "Proteínas", checked: false, createdAt: new Date() },
  { id: 3, listId: 1, name: "Tomate", quantity: "6", unit: "un", estimatedPrice: 9, category: "Hortifruti", checked: true, createdAt: new Date() },
  { id: 4, listId: 2, name: "Massa fresca", quantity: "2", unit: "pct", estimatedPrice: 32, category: "Grãos e Cereais", checked: true, createdAt: new Date() },
  { id: 5, listId: 2, name: "Queijo parmesão", quantity: "1", unit: "un", estimatedPrice: 28, category: "Laticínios", checked: false, createdAt: new Date() },
];

let reviews = [
  {
    id: 1,
    userId: 1,
    bookingId: 3,
    providerType: "chef",
    providerId: 1,
    rating: 5,
    comment: "Cardápio muito bem pensado e comida excelente.",
    createdAt: daysFromNow(-8),
  },
  {
    id: 2,
    userId: 1,
    bookingId: 2,
    providerType: "cleaner",
    providerId: 1,
    rating: 5,
    comment: "Pontual e muito cuidadosa com os detalhes.",
    createdAt: daysFromNow(-5),
  },
];

let customerSignups: Array<{ id: number; name: string; email: string; phone?: string }> = [];

const nextId = (rows: Array<{ id: number }>) => Math.max(0, ...rows.map((row) => row.id)) + 1;

const endpoint = <TInput, TData>(resolver: (input: TInput) => TData) => ({
  useQuery: (input?: TInput, options?: QueryOptions) => useDemoQuery(input as TInput, options, resolver),
});

const mutation = <TInput, TData>(resolver: (input: TInput) => TData | Promise<TData>) => ({
  useMutation: (options?: MutationOptions<TData, TInput>) => useDemoMutation(resolver, options),
});

const filterChefs = (input: any = {}) =>
  chefs.filter((chef) => {
    if (input?.maxPrice && chef.pricePerPerson > input.maxPrice) return false;
    if (input?.minRating && chef.rating < input.minRating) return false;
    if (input?.city && !chef.city.toLowerCase().includes(input.city.toLowerCase())) return false;
    if (input?.cuisine && !chef.cuisineTypes.some((type) => type.toLowerCase().includes(input.cuisine.toLowerCase()))) return false;
    return true;
  });

const filterCleaners = (input: any = {}) =>
  cleaners.filter((cleaner) => {
    if (input?.city && !cleaner.city.toLowerCase().includes(input.city.toLowerCase())) return false;
    if (input?.serviceType && !cleaner.serviceTypes.some((type) => type.toLowerCase().includes(input.serviceType.toLowerCase()))) return false;
    return true;
  });

const invalidate = async (..._args: unknown[]) => {
  notify();
};

export const trpc = {
  useUtils: () => ({
    auth: { me: { invalidate } },
    preferences: { get: { invalidate } },
    chefs: {
      list: { invalidate },
      getById: { invalidate },
      match: { invalidate },
      getReviews: { invalidate },
    },
    cleaners: {
      list: { invalidate },
      getById: { invalidate },
      getReviews: { invalidate },
    },
    bookings: {
      list: { invalidate },
      getProviderBookings: { invalidate },
    },
    shopping: {
      getLists: { invalidate },
      getItems: { invalidate },
    },
    reviews: {
      listByProvider: { invalidate },
    },
  }),
  auth: {
    me: endpoint(() => ({
      id: 1,
      openId: "demo-user",
      email: "demo@vidaso.local",
      name: "Usuário Demo",
      role: "user",
    })),
    logout: mutation(() => ({ success: true })),
  },
  preferences: {
    get: endpoint(() => preferences),
    save: mutation((input: any) => {
      preferences = { ...preferences, ...input, updatedAt: new Date() };
      return { success: true };
    }),
  },
  chefs: {
    list: endpoint((input: any) => filterChefs(input)),
    getById: endpoint((input: any) => chefs.find((chef) => chef.id === input?.id) ?? null),
    match: endpoint(() =>
      filterChefs({}).map((chef, index) => ({
        ...chef,
        matchScore: Math.max(72, 96 - index * 7),
      })),
    ),
    getReviews: endpoint((input: any) => reviews.filter((review) => review.providerType === "chef" && review.providerId === input?.chefId)),
  },
  cleaners: {
    list: endpoint((input: any) => filterCleaners(input)),
    getById: endpoint((input: any) => cleaners.find((cleaner) => cleaner.id === input?.id) ?? null),
    getReviews: endpoint((input: any) => reviews.filter((review) => review.providerType === "cleaner" && review.providerId === input?.cleanerId)),
  },
  bookings: {
    list: endpoint(() => bookings),
    create: mutation((input: any) => {
      bookings = [
        {
          id: nextId(bookings),
          userId: 1,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
          ...input,
          scheduledAt: new Date(input.scheduledAt),
        },
        ...bookings,
      ];
      return { success: true };
    }),
    cancel: mutation((input: any) => {
      bookings = bookings.map((booking) => (booking.id === input.bookingId ? { ...booking, status: "cancelled", updatedAt: new Date() } : booking));
      return { success: true };
    }),
    confirm: mutation((input: any) => {
      bookings = bookings.map((booking) => (booking.id === input.bookingId ? { ...booking, status: "confirmed", updatedAt: new Date() } : booking));
      return { success: true };
    }),
    complete: mutation((input: any) => {
      bookings = bookings.map((booking) => (booking.id === input.bookingId ? { ...booking, status: "completed", updatedAt: new Date() } : booking));
      return { success: true };
    }),
    getProviderBookings: endpoint((input: any) =>
      bookings.filter((booking) => booking.providerId === input?.providerId && booking.serviceType === input?.serviceType),
    ),
  },
  shopping: {
    getLists: endpoint(() => shoppingLists),
    createList: mutation((input: any) => {
      shoppingLists = [
        {
          id: nextId(shoppingLists),
          userId: 1,
          name: input.name,
          status: "draft",
          deliveryAt: null,
          deliveryAddress: null,
          totalEstimate: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        ...shoppingLists,
      ];
      return { success: true };
    }),
    getItems: endpoint((input: any) => shoppingItems.filter((item) => item.listId === input?.listId)),
    addItem: mutation((input: any) => {
      shoppingItems = [
        ...shoppingItems,
        {
          id: nextId(shoppingItems),
          listId: input.listId,
          name: input.name,
          quantity: input.quantity ?? "1",
          unit: input.unit ?? "un",
          estimatedPrice: input.estimatedPrice ?? 0,
          category: input.category ?? "Outros",
          checked: false,
          createdAt: new Date(),
        },
      ];
      return { success: true };
    }),
    removeItem: mutation((input: any) => {
      shoppingItems = shoppingItems.filter((item) => item.id !== input.itemId);
      return { success: true };
    }),
    toggleItem: mutation((input: any) => {
      shoppingItems = shoppingItems.map((item) => (item.id === input.itemId ? { ...item, checked: !item.checked } : item));
      return { success: true };
    }),
    scheduleDelivery: mutation((input: any) => {
      shoppingLists = shoppingLists.map((list) =>
        list.id === input.listId
          ? { ...list, status: "ordered", deliveryAt: new Date(input.deliveryAt), deliveryAddress: input.deliveryAddress, updatedAt: new Date() }
          : list,
      );
      return { success: true };
    }),
    suggestItems: mutation((input: any) => {
      const context = String(input?.context ?? "").toLowerCase();
      if (context.includes("jantar") || context.includes("italiano")) {
        return [
          { name: "Massa artesanal", quantity: "1", unit: "pct", estimatedPrice: 22, category: "Grãos e Cereais" },
          { name: "Tomate pelado", quantity: "2", unit: "lata", estimatedPrice: 16, category: "Hortifruti" },
          { name: "Manjericão", quantity: "1", unit: "maço", estimatedPrice: 5, category: "Hortifruti" },
        ];
      }

      return [
        { name: "Ovos", quantity: "12", unit: "un", estimatedPrice: 14, category: "Proteínas" },
        { name: "Banana", quantity: "6", unit: "un", estimatedPrice: 7, category: "Hortifruti" },
        { name: "Iogurte natural", quantity: "1", unit: "un", estimatedPrice: 9, category: "Laticínios" },
      ];
    }),
  },
  reviews: {
    create: mutation((input: any) => {
      reviews = [
        {
          id: nextId(reviews),
          userId: 1,
          createdAt: new Date(),
          ...input,
        },
        ...reviews,
      ];
      bookings = bookings.map((booking) => (booking.id === input.bookingId ? { ...booking, status: "completed", updatedAt: new Date() } : booking));
      return { success: true };
    }),
    listByProvider: endpoint((input: any) =>
      reviews.filter((review) => review.providerId === input?.providerId && review.providerType === input?.providerType),
    ),
  },
  users: {
    createCustomer: mutation((input: any) => {
      customerSignups = [
        { id: nextId(customerSignups), name: input.name, email: input.email, phone: input.phone },
        ...customerSignups,
      ];
      return { success: true, userId: customerSignups[0].id };
    }),
  },
  providers: {
    createChef: mutation((input: any) => {
      chefs.unshift({
        id: nextId(chefs),
        name: input.name,
        bio: input.bio ?? "",
        photoUrl: "",
        specialties: input.specialties ?? [],
        cuisineTypes: input.cuisineTypes ?? [],
        pricePerPerson: input.pricePerPerson ?? 100,
        city: input.city,
        rating: 0,
        totalReviews: 0,
        experience: input.experience ?? 0,
        isAvailable: input.isAvailable ?? true,
      });
      return { success: true };
    }),
    createCleaner: mutation((input: any) => {
      cleaners.unshift({
        id: nextId(cleaners),
        name: input.name,
        bio: input.bio ?? "",
        photoUrl: "",
        serviceTypes: input.serviceTypes ?? [],
        priceBasic: input.priceBasic ?? 150,
        priceDeep: input.priceDeep ?? 250,
        priceWeekly: input.priceWeekly ?? 400,
        city: input.city,
        rating: 0,
        totalReviews: 0,
        isAvailable: input.isAvailable ?? true,
      });
      return { success: true };
    }),
    getChefs: endpoint((input: any) => filterChefs(input)),
    getCleaners: endpoint((input: any) => filterCleaners(input)),
  },
  ai: {
    suggestChef: mutation((input: any) => ({
      recommendedChef: chefs[0]?.name ?? "Chef Demo",
      reason: `Sugestão mock para ${input?.location ?? "sua região"}.`,
      estimatedCost: input?.budget ? input.budget * 0.7 : 180,
      suggestedShoppingItems: ["Arroz", "Frango", "Tomate"],
    })),
    suggestCleaner: mutation((input: any) => ({
      recommendedCleaner: cleaners[0]?.name ?? "Profissional Demo",
      reason: `Sugestão mock para ${input?.cleaningType ?? "limpeza geral"}.`,
      estimatedDurationHours: 3,
      estimatedPrice: 180,
      checklist: ["Pisos", "Banheiros", "Cozinha"],
    })),
    suggestShoppingItems: mutation((input: any) => ({
      items: [
        { name: "Arroz", quantity: "1", unit: "kg", estimatedPrice: 8 },
        { name: "Feijão", quantity: "1", unit: "kg", estimatedPrice: 9 },
      ],
      reason: `Lista mock para ${input?.mealPlan ?? "refeição"}.`,
    })),
    generatePlan: mutation((input: any) => ({
      chef: { name: chefs[0]?.name ?? "Chef Demo", estimatedCost: 220 },
      cleaner: { name: cleaners[0]?.name ?? "Profissional Demo", estimatedCost: 170 },
      shopping: { estimatedCost: 130 },
      summary: `Plano mock para ${input?.location ?? "local"} com ${input?.peopleCount ?? 1} pessoa(s).`,
    })),
  },
};
