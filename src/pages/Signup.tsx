import { useState } from "react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { createCustomerReal } from "@/lib/trpc-real";
import { getLoginUrl } from "@/const";

export default function Signup() {
  const useRealApi = import.meta.env.VITE_USE_REAL_API !== "false";
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loadingReal, setLoadingReal] = useState(false);

  const createCustomer = trpc.users.createCustomer.useMutation({
    onSuccess: () => {
      toast.success("Cadastro realizado com sucesso!");
      navigate("/dashboard");
    },
    onError: () => toast.error("Erro ao cadastrar usuário"),
  });

  const submit = async () => {
    if (!name || !email) {
      toast.error("Preencha nome e e-mail");
      return;
    }
    if (!useRealApi) {
      createCustomer.mutate({ name, email, phone, userType: "CUSTOMER" });
      return;
    }
    setLoadingReal(true);
    try {
      await createCustomerReal({ name, email, phone, userType: "CUSTOMER" });
      toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
      window.location.href = getLoginUrl("/dashboard");
    } catch {
      toast.error("Erro ao cadastrar usuário");
    } finally {
      setLoadingReal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container py-10 max-w-xl">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>Cadastro inicial de cliente VidaSó</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="mt-1.5" />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className="mt-1.5" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="mt-1.5" />
            </div>
            <Button
              className="w-full gradient-brand text-white border-0"
              disabled={createCustomer.isPending || loadingReal}
              onClick={() => {
                void submit();
              }}
            >
              {(createCustomer.isPending || loadingReal) ? "Cadastrando..." : "Cadastrar"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Já tem conta? <a href={getLoginUrl("/dashboard")} className="text-primary">Entrar</a>
            </p>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground mb-2">Quer atuar como prestador?</p>
              <div className="flex gap-2">
                <Link href="/register/chef"><Button variant="outline" size="sm">Sou Chef</Button></Link>
                <Link href="/register/cleaner"><Button variant="outline" size="sm">Sou Faxineira</Button></Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

