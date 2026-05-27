import type { CookieOptions, Request } from "express";

export function getSessionCookieOptions(req?: Request): CookieOptions {
  const secure = req?.protocol === "https" || req?.headers["x-forwarded-proto"] === "https";

  return {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  };
}
