import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

type ContextRequest = {
  protocol?: string;
  headers?: Record<string, unknown>;
};

type ContextResponse = {
  clearCookie: (name: string, options?: unknown) => void;
};

export type TrpcContext = {
  user: {
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
  req: ContextRequest;
  res: ContextResponse;
};

export async function createContext(opts: CreateFastifyContextOptions): Promise<TrpcContext> {
  const req: ContextRequest = {
    protocol: opts.req.protocol,
    headers: opts.req.headers as Record<string, unknown>,
  };

  // Cookie auth is not wired yet in Fastify bootstrap.
  const res: ContextResponse = {
    clearCookie: () => {},
  };

  return {
    user: null,
    req,
    res,
  };
}
