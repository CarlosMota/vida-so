import "dotenv/config";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { createContext } from "./_core/context";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "./routers";

const PORT = Number(process.env.PORT ?? 3001);
const HOST = "0.0.0.0";

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  });

  app.get("/health", async () => ({ status: "ok", service: "backend" } as const));
  registerOAuthRoutes(app);

  await app.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
    },
  });

  await app.listen({ host: HOST, port: PORT });

  app.log.info(`Backend running at http://localhost:${PORT}`);
  app.log.info(`Health: http://localhost:${PORT}/health`);
  app.log.info(`tRPC: http://localhost:${PORT}/trpc`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
