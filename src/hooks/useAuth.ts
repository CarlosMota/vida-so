const demoUser = {
  id: 1,
  openId: "demo-user",
  email: "demo@vidaso.local",
  name: "Usuário Demo",
  loginMethod: "demo",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export function useAuth() {
  return {
    user: demoUser,
    isAuthenticated: true,
    loading: false,
  };
}
