import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { parse, serialize, type SerializeOptions } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import { getUserByOpenId } from "../db";

type ContextRequest = {
  protocol?: string;
  headers?: Record<string, unknown>;
};

type ContextResponse = {
  clearCookie: (name: string, options?: SerializeOptions) => void;
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

  const res: ContextResponse = {
    clearCookie: (name, options) => {
      const cookieHeader = serialize(name, "", {
        path: "/",
        ...options,
        maxAge: 0,
        expires: new Date(0),
      });
      opts.res.header("set-cookie", cookieHeader);
    },
  };

  let user: TrpcContext["user"] = null;
  const cookieHeader = opts.req.headers.cookie;
  if (typeof cookieHeader === "string") {
    const cookies = parse(cookieHeader);
    const sessionToken = cookies[COOKIE_NAME];
    if (typeof sessionToken === "string" && sessionToken.length > 0) {
      const openId = sessionToken.split(".")[0];
      if (openId) {
        const dbUser = await getUserByOpenId(openId);
        if (dbUser) {
          user = dbUser;
        }
      }
    }
  }

  return {
    user,
    req,
    res,
  };
}
