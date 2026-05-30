type CookieRequestLike = {
  protocol?: string;
  headers?: Record<string, unknown>;
};

type SessionCookieOptions = {
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  path: string;
};

export function getSessionCookieOptions(req?: CookieRequestLike): SessionCookieOptions {
  const forwardedProtoHeader = req?.headers?.["x-forwarded-proto"];
  const forwardedProto =
    typeof forwardedProtoHeader === "string"
      ? forwardedProtoHeader
      : Array.isArray(forwardedProtoHeader) && typeof forwardedProtoHeader[0] === "string"
        ? forwardedProtoHeader[0]
        : undefined;

  const secure = req?.protocol === "https" || forwardedProto === "https";

  return {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  };
}
