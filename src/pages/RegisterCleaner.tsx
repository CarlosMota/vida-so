import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { createCleanerReal } from "@/lib/trpc-real";

export default function RegisterCleaner() {
  const useRealApi = import.meta.env.VITE_USE_REAL_API !== "false";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [serviceTypes, setServiceTypes] = useState("");
  const [priceBasic, setPriceBasic] = useState("150");
  const [priceDeep, setPriceDeep] = useState("250");
  const [priceWeekly, setPriceWeekly] = useState("400");
  const [bio, setBio] = useState("");
  const [loadingReal, setLoadingReal] = useState(false);

  const createCleaner = trpc.providers.createCleaner.useMutation({
    onSuccess: () => {
      toast.success("Cadastro de profissional enviado com sucesso!");
    },
    onError: () => toast.error("Erro ao cadastrar profissional"),
  });

  const submit = async () => {
    if (!name || !email || !city) {
      toast.error("Preencha nome, e-mail e cidade");
      return;
    }
    const payload = {
      name,
      email,
      phone,
      city,
      serviceTypes: serviceTypes.split(",").map((v) => v.trim()).filter(Boolean),
      priceBasic: Number(priceBasic) || 150,
      priceDeep: Number(priceDeep) || 250,
      priceWeekly: Number(priceWeekly) || 400,
      bio,
      providerType: "CLEANER" as const,
    };
    if (!useRealApi) {
      createCleaner.mutate(payload);
      return;
    }
    setLoadingReal(true);
    try {
      await createCleanerReal(payload);
      toast.success("Cadastro de profissional enviado com sucesso!");
    } catch {
      toast.error("Erro ao cadastrar profissional");
    } finally {
      setLoadingReal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container py-10 max-w-2xl">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Cadastro de Faxineira/Diarista</CardTitle>
            <CardDescription>Fluxo inicial de prestador CLEANER</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" /></div>
            <div><Label>E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Telefone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" /></div>
            <div className="md:col-span-2"><Label>Cidade/Bairro</Label><Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Valor básica (R$)</Label><Input type="number" value={priceBasic} onChange={(e) => setPriceBasic(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Valor profunda (R$)</Label><Input type="number" value={priceDeep} onChange={(e) => setPriceDeep(e.target.value)} className="mt-1.5" /></div>
            <div className="md:col-span-2"><Label>Valor semanal (R$)</Label><Input type="number" value={priceWeekly} onChange={(e) => setPriceWeekly(e.target.value)} className="mt-1.5" /></div>
            <div className="md:col-span-2"><Label>Tipos de serviço (vírgula)</Label><Input value={serviceTypes} onChange={(e) => setServiceTypes(e.target.value)} className="mt-1.5" /></div>
            <div className="md:col-span-2"><Label>Descrição profissional</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1.5" rows={4} /></div>
            <div className="md:col-span-2">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white border-0" disabled={createCleaner.isPending || loadingReal} onClick={() => void submit()}>
                {(createCleaner.isPending || loadingReal) ? "Enviando..." : "Cadastrar como Faxineira"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
