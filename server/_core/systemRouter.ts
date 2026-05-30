import { sql } from "drizzle-orm";
import { getDb } from "../db";
import { publicProcedure, router } from "./trpc";

export const systemRouter = router({
  health: publicProcedure.query(() => ({
    ok: true,
    service: "VidaSó",
  })),
  dbHealth: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return { ok: false };
    }

    try {
      await db.execute(sql`SELECT 1`);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }),
});
