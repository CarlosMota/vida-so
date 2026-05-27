import type { Request, Response } from "express";
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
  req: Request;
  res: Response;
};
