import { randomBytes, randomUUID } from "node:crypto";

export const sdk = {
  async exchangeCodeForToken(_code: string, _state: string) {
    return { accessToken: "demo-access-token" };
  },
  async getUserInfo(_accessToken: string) {
    return {
      openId: "demo-user",
      name: "Usuário Demo",
      email: "demo@vidaso.local",
      loginMethod: "demo",
      platform: "demo",
    };
  },
  async createSessionToken(openId: string, _options?: { name?: string; expiresInMs?: number }) {
    return `${openId}.${randomUUID()}.${randomBytes(32).toString("hex")}`;
  },
};
