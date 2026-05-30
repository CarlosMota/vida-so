import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Preencha e-mail e senha");
      return;
    }
    setLoading(true);
    try {
      // Current auth flow is OAuth/callback based; keep email/password as UX input.
      window.location.href = getLoginUrl("/dashboard");
    } catch {
      toast.error("Não foi possível iniciar o login. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      <Navbar />
      <div className="container py-12 max-w-lg">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Entrar na sua conta</CardTitle>
            <CardDescription>Acesse seu dashboard para gerenciar serviços e agendamentos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <Button
              className="w-full gradient-brand text-white border-0"
              disabled={loading}
              onClick={() => {
                void handleSubmit();
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => toast.info("Fluxo de recuperação será adicionado em breve.")}
              >
                Esqueci minha senha
              </button>
              <Link href="/signup" className="text-primary">Criar conta</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
