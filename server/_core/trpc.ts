import { initTRPC, TRPCError } from "@trpc/server";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const providerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "provider" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Provider role required" });
  }

  return next();
});
