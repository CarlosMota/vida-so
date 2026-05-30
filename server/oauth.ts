import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { serialize } from "cookie";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";

function getQueryParam(req: FastifyRequest, key: string): string | undefined {
  const query = req.query as Record<string, unknown> | undefined;
  const value = query?.[key];
  return typeof value === "string" ? value : undefined;
}

function sanitizeReturnPath(path: unknown): string {
  if (typeof path !== "string") return "/dashboard";
  if (!path.startsWith("/")) return "/dashboard";
  if (path.startsWith("//")) return "/dashboard";
  if (/^https?:\/\//i.test(path)) return "/dashboard";
  return path;
}

function sanitizeOrigin(origin: unknown): string | null {
  if (typeof origin !== "string") return null;
  try {
    const parsed = new URL(origin);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

export function registerOAuthRoutes(app: FastifyInstance) {
  app.get("/api/oauth/callback", async (req: FastifyRequest, res: FastifyReply) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).send({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).send({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      const cookieHeader = serialize(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: Math.floor(ONE_YEAR_MS / 1000),
      });
      res.header("set-cookie", cookieHeader);

      // Parse state to extract returnPath if present
      const defaultFrontendOrigin = sanitizeOrigin(process.env.FRONTEND_URL);
      let redirectTo = "/dashboard";
      let redirectOrigin: string | null = defaultFrontendOrigin;
      try {
        const decodedState = Buffer.from(state, "base64").toString("utf8");
        const decoded = JSON.parse(decodedState);
        redirectTo = sanitizeReturnPath(decoded.returnPath);
        redirectOrigin = sanitizeOrigin(decoded.origin) ?? defaultFrontendOrigin;
      } catch {
        // state is not our JSON format, use default
      }
      const finalRedirect = redirectOrigin ? `${redirectOrigin}${redirectTo}` : redirectTo;
      console.info("[OAuth] Redirect computed", {
        redirectOrigin,
        redirectTo,
        finalRedirect,
      });
      res.redirect(finalRedirect);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).send({ error: "OAuth callback failed" });
    }
  });
}
